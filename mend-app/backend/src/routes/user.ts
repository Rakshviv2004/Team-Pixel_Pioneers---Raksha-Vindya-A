import { Router, Request, Response } from "express";
import { z } from "zod";
import db from "../db/index.js";
import { authRequired } from "../middleware/auth.js";

const router: Router = Router();

router.get("/profile", authRequired, (req: Request, res: Response): void => {
  const user = db.prepare(`
    SELECT id, name, email, neighborhood, bio, avatar_url, role,
           location_permission, theme, language,
           show_profile, show_contributions, show_location,
           reduced_motion, large_text, high_contrast,
           notif_new_nearby, notif_approvals, notif_events,
           notif_volunteers, notif_moderator,
           created_at
    FROM users WHERE id = ?
  `).get(req.user!.userId) as object | undefined;

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const stats = db.prepare("SELECT * FROM user_stats WHERE user_id = ?").get(req.user!.userId);

  res.json({ user, stats });
});

router.put("/profile", authRequired, (req: Request, res: Response): void => {
  const allowedFields = [
    "name", "neighborhood", "bio",
    "show_profile", "show_contributions", "show_location",
    "location_permission", "theme", "language",
    "reduced_motion", "large_text", "high_contrast",
    "notif_new_nearby", "notif_approvals", "notif_events",
    "notif_volunteers", "notif_moderator",
  ];

  const updates: string[] = [];
  const params: unknown[] = [];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(req.body[field]);
    }
  }

  if (updates.length === 0) {
    res.status(400).json({ error: "No valid fields to update" });
    return;
  }

  updates.push("updated_at = datetime('now')");
  params.push(req.user!.userId);

  db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(...params);

  const user = db.prepare("SELECT id, name, email, neighborhood, bio, role, created_at FROM users WHERE id = ?").get(req.user!.userId);
  res.json({ user });
});

router.get("/contributions", authRequired, (req: Request, res: Response): void => {
  const activities = db.prepare(`
    SELECT * FROM activities WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
  `).all(req.user!.userId);

  const resources = db.prepare(`
    SELECT id, name, category, status, created_at FROM resources WHERE submitted_by = ? ORDER BY created_at DESC
  `).all(req.user!.userId);

  const registrations = db.prepare(`
    SELECT e.id, e.name, e.date, e.type FROM event_registrations er
    JOIN events e ON er.event_id = e.id
    WHERE er.user_id = ? ORDER BY e.date DESC
  `).all(req.user!.userId);

  res.json({ activities, resources, registrations });
});

router.get("/badges", authRequired, (req: Request, res: Response): void => {
  const allBadges = db.prepare("SELECT * FROM badges ORDER BY id").all();
  const earnedBadges = db.prepare(`
    SELECT badge_id FROM user_badges WHERE user_id = ?
  `).all(req.user!.userId) as Array<{ badge_id: number }>;

  const earnedSet = new Set(earnedBadges.map(b => b.badge_id));

  const badges = (allBadges as Array<Record<string, unknown>>).map(b => ({
    ...b,
    earned: earnedSet.has(b.id as number),
  }));

  res.json({ badges });
});

router.get("/saved", authRequired, (req: Request, res: Response): void => {
  const saved = db.prepare(`
    SELECT r.*, COALESCE(u.name, r.submitter_name) as submitter_name
    FROM saved_resources sr
    JOIN resources r ON sr.resource_id = r.id
    LEFT JOIN users u ON r.submitted_by = u.id
    WHERE sr.user_id = ?
    ORDER BY sr.created_at DESC
  `).all(req.user!.userId);

  res.json({ resources: saved });
});

router.get("/stats", authRequired, (req: Request, res: Response): void => {
  const stats = db.prepare("SELECT * FROM user_stats WHERE user_id = ?").get(req.user!.userId);

  const pendingCount = db.prepare(
    "SELECT COUNT(*) as count FROM resources WHERE submitted_by = ? AND status IN ('pending', 'flagged')"
  ).get(req.user!.userId) as { count: number };

  res.json({
    stats,
    pendingSubmissions: pendingCount.count,
    resourcesAdded: (stats as { resources_added?: number })?.resources_added || 0,
  });
});

export default router;
