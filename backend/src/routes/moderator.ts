import { Router, Request, Response } from "express";
import { z } from "zod";
import db from "../db/index.js";
import { moderatorRequired } from "../middleware/auth.js";

const router: Router = Router();

router.get("/submissions", moderatorRequired, (req: Request, res: Response): void => {
  const status = req.query.status as string || "all";
  const search = (req.query.search as string || "").trim();

  let where = "WHERE 1=1";
  const params: unknown[] = [];

  if (status !== "all") {
    where += " AND r.status = ?";
    params.push(status);
  }

  if (search) {
    where += " AND (r.name LIKE ? OR r.neighborhood LIKE ?)";
    const s = `%${search}%`;
    params.push(s, s);
  }

  const submissions = db.prepare(`
    SELECT r.*, COALESCE(u.name, r.submitter_name) as submitter_name, u.email as submitter_email
    FROM resources r
    LEFT JOIN users u ON r.submitted_by = u.id
    ${where}
    ORDER BY
      CASE r.status
        WHEN 'flagged' THEN 0
        WHEN 'pending' THEN 1
        WHEN 'approved' THEN 2
        WHEN 'rejected' THEN 3
      END,
      r.created_at DESC
  `).all(...params);

  const stats = db.prepare(`
    SELECT
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
      SUM(CASE WHEN status = 'flagged' THEN 1 ELSE 0 END) as flagged_count,
      COUNT(*) as total
    FROM resources
  `).get();

  res.json({ submissions, stats });
});

router.put("/submissions/:id", moderatorRequired, (req: Request, res: Response): void => {
  const updateSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().min(1).max(2000).optional(),
    neighborhood: z.string().min(1).max(200).optional(),
    category: z.enum(["Repair", "Reuse", "Donate", "Borrow", "Refuse", "Exchange"]).optional(),
    contact: z.string().max(500).optional(),
  });

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  const existing = db.prepare("SELECT id FROM resources WHERE id = ?").get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: "Submission not found" });
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

  if (updates.length > 0) {
    updates.push("updated_at = datetime('now')");
    params.push(req.params.id);
    db.prepare(`UPDATE resources SET ${updates.join(", ")} WHERE id = ?`).run(...params);
  }

  const resource = db.prepare("SELECT * FROM resources WHERE id = ?").get(req.params.id);
  res.json({ resource });
});

router.put("/submissions/:id/approve", moderatorRequired, (req: Request, res: Response): void => {
  const existing = db.prepare("SELECT * FROM resources WHERE id = ?").get(req.params.id) as { submitted_by: number; name: string } | undefined;
  if (!existing) {
    res.status(404).json({ error: "Submission not found" });
    return;
  }

  db.prepare(`
    UPDATE resources SET status = 'approved', verified = 1, updated_at = datetime('now') WHERE id = ?
  `).run(req.params.id);

  if (existing.submitted_by) {
    db.prepare(`
      INSERT INTO notifications (user_id, type, title, body)
      VALUES (?, 'approval', 'Submission verified ✓', ?)
    `).run(existing.submitted_by, `"${existing.name}" has been verified by a community moderator and is now live on the map.`);

    db.prepare(`
      INSERT INTO activities (user_id, type, description)
      VALUES (?, 'verification', ?)
    `).run(existing.submitted_by, `Your submission "${existing.name}" was verified ✓`);
  }

  const resource = db.prepare("SELECT * FROM resources WHERE id = ?").get(req.params.id);
  res.json({ resource });
});

router.put("/submissions/:id/reject", moderatorRequired, (req: Request, res: Response): void => {
  const existing = db.prepare("SELECT * FROM resources WHERE id = ?").get(req.params.id) as { submitted_by: number; name: string } | undefined;
  if (!existing) {
    res.status(404).json({ error: "Submission not found" });
    return;
  }

  db.prepare(`
    UPDATE resources SET status = 'rejected', updated_at = datetime('now') WHERE id = ?
  `).run(req.params.id);

  if (existing.submitted_by) {
    db.prepare(`
      INSERT INTO notifications (user_id, type, title, body)
      VALUES (?, 'feedback', 'Submission update', ?)
    `).run(existing.submitted_by, `"${existing.name}" was not approved. A moderator may have left feedback.`);
  }

  const resource = db.prepare("SELECT * FROM resources WHERE id = ?").get(req.params.id);
  res.json({ resource });
});

export default router;
