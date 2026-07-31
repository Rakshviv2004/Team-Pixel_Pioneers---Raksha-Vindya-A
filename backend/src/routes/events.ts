import { Router, Request, Response } from "express";
import db from "../db/index.js";
import { authRequired } from "../middleware/auth.js";

const router: Router = Router();

router.get("/", (_req: Request, res: Response): void => {
  const events = db.prepare(`
    SELECT * FROM events ORDER BY date ASC
  `).all();

  res.json({ events });
});

router.get("/:id", (req: Request, res: Response): void => {
  const event = db.prepare("SELECT * FROM events WHERE id = ?").get(req.params.id);

  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  const registrationCount = db.prepare(
    "SELECT COUNT(*) as count FROM event_registrations WHERE event_id = ?"
  ).get(req.params.id) as { count: number };

  res.json({
    event: {
      ...event as object,
      participants: registrationCount.count,
    },
  });
});

router.post("/:id/register", authRequired, (req: Request, res: Response): void => {
  const event = db.prepare("SELECT * FROM events WHERE id = ?").get(req.params.id) as { capacity: number; participants: number } | undefined;

  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  const existing = db.prepare(
    "SELECT 1 FROM event_registrations WHERE event_id = ? AND user_id = ?"
  ).get(req.params.id, req.user!.userId);

  if (existing) {
    db.prepare("DELETE FROM event_registrations WHERE event_id = ? AND user_id = ?")
      .run(req.params.id, req.user!.userId);

    db.prepare("UPDATE events SET participants = participants - 1 WHERE id = ?")
      .run(req.params.id);

    res.json({ registered: false });
    return;
  }

  const regCount = db.prepare(
    "SELECT COUNT(*) as count FROM event_registrations WHERE event_id = ?"
  ).get(req.params.id) as { count: number };

  if (regCount.count >= event.capacity) {
    res.status(400).json({ error: "Event is full" });
    return;
  }

  db.prepare("INSERT INTO event_registrations (event_id, user_id) VALUES (?, ?)")
    .run(req.params.id, req.user!.userId);

  db.prepare("UPDATE events SET participants = participants + 1 WHERE id = ?")
    .run(req.params.id);

  res.json({ registered: true });
});

export default router;
