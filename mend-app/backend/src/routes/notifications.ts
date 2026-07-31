import { Router, Request, Response } from "express";
import db from "../db/index.js";
import { authRequired } from "../middleware/auth.js";

const router: Router = Router();

router.get("/", authRequired, (req: Request, res: Response): void => {
  const filter = req.query.filter as string || "All";

  let query = "SELECT * FROM notifications WHERE user_id = ?";
  const params: unknown[] = [req.user!.userId];

  if (filter === "Unread") {
    query += " AND read = 0";
  } else if (filter === "Mentions") {
    query += " AND mention = 1";
  }

  query += " ORDER BY created_at DESC";

  const notifications = db.prepare(query).all(...params) as Array<Record<string, unknown>>;
  const unreadCount = db.prepare(
    "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0"
  ).get(req.user!.userId) as { count: number };

  res.json({ notifications, unreadCount: unreadCount.count });
});

router.put("/:id/read", authRequired, (req: Request, res: Response): void => {
  const result = db.prepare(
    "UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?"
  ).run(req.params.id, req.user!.userId);

  if (result.changes === 0) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }

  res.json({ success: true });
});

router.put("/read-all", authRequired, (req: Request, res: Response): void => {
  db.prepare(
    "UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0"
  ).run(req.user!.userId);

  res.json({ success: true });
});

export default router;
