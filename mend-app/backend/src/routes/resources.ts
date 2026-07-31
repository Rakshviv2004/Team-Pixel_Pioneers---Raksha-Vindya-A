import { Router, Request, Response } from "express";
import { z } from "zod";
import db from "../db/index.js";
import { authRequired, authOptional } from "../middleware/auth.js";

const router: Router = Router();

const resourceSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.enum(["Repair", "Reuse", "Donate", "Borrow", "Refuse", "Exchange"]),
  description: z.string().min(1).max(2000),
  neighborhood: z.string().min(1).max(200),
  contact: z.string().max(500).optional().default(""),
});

router.get("/", authOptional, (req: Request, res: Response): void => {
  const search = (req.query.search as string || "").trim();
  const category = req.query.category as string || "";
  const status = req.query.status as string || "approved";
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
  const offset = (page - 1) * limit;

  let where = "WHERE r.status = ?";
  const params: unknown[] = [status];

  if (category && category !== "All resources") {
    where += " AND r.category = ?";
    params.push(category);
  }

  if (search) {
    where += " AND (r.name LIKE ? OR r.description LIKE ? OR r.neighborhood LIKE ?)";
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  const count = db.prepare(`SELECT COUNT(*) as total FROM resources r ${where}`).get(...params) as { total: number };

  const rows = db.prepare(`
    SELECT r.*, COALESCE(u.name, r.submitter_name) as submitter_name
    FROM resources r
    LEFT JOIN users u ON r.submitted_by = u.id
    ${where}
    ORDER BY r.verified DESC, r.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset) as Array<Record<string, unknown>>;

  const savedSet = new Set<number>();
  if (req.user) {
    const saved = db.prepare("SELECT resource_id FROM saved_resources WHERE user_id = ?")
      .all(req.user.userId) as Array<{ resource_id: number }>;
    for (const s of saved) savedSet.add(s.resource_id);
  }

  const resources = rows.map(r => ({
    ...r,
    is_saved: savedSet.has(r.id as number),
  }));

  res.json({
    resources,
    pagination: {
      page,
      limit,
      total: count.total,
      totalPages: Math.ceil(count.total / limit),
    },
  });
});

router.get("/:id", authOptional, (req: Request, res: Response): void => {
  const resource = db.prepare(`
    SELECT r.*, COALESCE(u.name, r.submitter_name) as submitter_name
    FROM resources r
    LEFT JOIN users u ON r.submitted_by = u.id
    WHERE r.id = ?
  `).get(req.params.id);

  if (!resource) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }

  let is_saved = false;
  if (req.user) {
    const saved = db.prepare(
      "SELECT 1 FROM saved_resources WHERE user_id = ? AND resource_id = ?"
    ).get(req.user.userId, req.params.id);
    is_saved = !!saved;
  }

  res.json({ resource: { ...resource as object, is_saved } });
});

router.post("/", authRequired, (req: Request, res: Response): void => {
  const parsed = resourceSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  const { name, category, description, neighborhood, contact } = parsed.data;

  const user = db.prepare("SELECT name FROM users WHERE id = ?").get(req.user!.userId) as { name: string } | undefined;

  const result = db.prepare(`
    INSERT INTO resources (name, category, description, neighborhood, contact, submitted_by, submitter_name, status, verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 0)
  `).run(name, category, description, neighborhood, contact, req.user!.userId, user?.name || "Anonymous");

  db.prepare(`
    INSERT INTO activities (user_id, type, description)
    VALUES (?, 'submission', ?)
  `).run(req.user!.userId, `You submitted "${name}" for review.`);

  db.prepare(`
    UPDATE user_stats SET resources_added = resources_added + 1 WHERE user_id = ?
  `).run(req.user!.userId);

  const resource = db.prepare("SELECT * FROM resources WHERE id = ?").get(result.lastInsertRowid);

  res.status(201).json({ resource });
});

router.put("/:id", authRequired, (req: Request, res: Response): void => {
  const existing = db.prepare("SELECT * FROM resources WHERE id = ?").get(req.params.id) as { submitted_by: number } | undefined;

  if (!existing) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }

  if (existing.submitted_by !== req.user!.userId && req.user!.role !== "admin" && req.user!.role !== "moderator") {
    res.status(403).json({ error: "Not authorized to edit this resource" });
    return;
  }

  const parsed = resourceSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  const updates: string[] = [];
  const params: unknown[] = [];

  for (const [key, value] of Object.entries(parsed.data)) {
    if (value !== undefined) {
      updates.push(`${key} = ?`);
      params.push(value);
    }
  }

  if (updates.length === 0) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }

  updates.push("updated_at = datetime('now')");
  params.push(req.params.id);

  db.prepare(`UPDATE resources SET ${updates.join(", ")} WHERE id = ?`).run(...params);

  const resource = db.prepare("SELECT * FROM resources WHERE id = ?").get(req.params.id);
  res.json({ resource });
});

router.delete("/:id", authRequired, (req: Request, res: Response): void => {
  const existing = db.prepare("SELECT * FROM resources WHERE id = ?").get(req.params.id) as { submitted_by: number } | undefined;

  if (!existing) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }

  if (existing.submitted_by !== req.user!.userId && req.user!.role !== "admin") {
    res.status(403).json({ error: "Not authorized to delete this resource" });
    return;
  }

  db.prepare("DELETE FROM saved_resources WHERE resource_id = ?").run(req.params.id);
  db.prepare("DELETE FROM resources WHERE id = ?").run(req.params.id);

  res.json({ message: "Resource deleted" });
});

router.post("/:id/save", authRequired, (req: Request, res: Response): void => {
  const existing = db.prepare("SELECT id FROM resources WHERE id = ?").get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }

  const saved = db.prepare(
    "SELECT 1 FROM saved_resources WHERE user_id = ? AND resource_id = ?"
  ).get(req.user!.userId, req.params.id);

  if (saved) {
    db.prepare("DELETE FROM saved_resources WHERE user_id = ? AND resource_id = ?")
      .run(req.user!.userId, req.params.id);
    res.json({ saved: false });
  } else {
    db.prepare("INSERT INTO saved_resources (user_id, resource_id) VALUES (?, ?)")
      .run(req.user!.userId, req.params.id);

    db.prepare(`
      INSERT INTO activities (user_id, type, description)
      VALUES (?, 'save', ?)
    `).run(req.user!.userId, `You saved a resource to your list.`);

    res.json({ saved: true });
  }
});

export default router;
