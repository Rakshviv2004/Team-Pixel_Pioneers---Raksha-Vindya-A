import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import db from "../db/index.js";
import { generateToken, authRequired } from "../middleware/auth.js";

const router: Router = Router();

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/register", (req: Request, res: Response): void => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  const { name, email, password } = parsed.data;

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const password_hash = bcrypt.hashSync(password, 10);

  const result = db.prepare(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)"
  ).run(name, email, password_hash);

  db.prepare(
    "INSERT INTO user_stats (user_id) VALUES (?)"
  ).run(result.lastInsertRowid);

  const token = generateToken({
    userId: result.lastInsertRowid as number,
    email,
    role: "user",
  });

  res.status(201).json({
    token,
    user: { id: result.lastInsertRowid, name, email, role: "user" },
  });
});

router.post("/login", (req: Request, res: Response): void => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  const { email, password } = parsed.data;

  const user = db.prepare(
    "SELECT id, name, email, password_hash, role FROM users WHERE email = ?"
  ).get(email) as { id: number; name: string; email: string; password_hash: string; role: string } | undefined;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = generateToken({ userId: user.id, email: user.email, role: user.role });

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

router.get("/me", authRequired, (req: Request, res: Response): void => {
  const user = db.prepare(
    "SELECT id, name, email, role, neighborhood, bio, avatar_url, created_at FROM users WHERE id = ?"
  ).get(req.user!.userId) as object | undefined;

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ user });
});

export default router;
