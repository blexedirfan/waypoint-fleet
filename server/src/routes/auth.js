import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { db, rowToUser } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../asyncHandler.js";

export const authRouter = Router();

function issueToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

authRouter.post("/signup", asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required." });
  }

  const existing = await db.prepare("SELECT id FROM users WHERE lower(email) = lower(?)").get(email);
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists." });
  }

  const { count } = await db.prepare("SELECT COUNT(*) as count FROM users").get();
  const role = Number(count) === 0 ? "admin" : "member";
  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: randomUUID(), name, email, phone: "", avatar: "", role };

  await db.prepare(
    "INSERT INTO users (id, name, email, password_hash, phone, avatar, role) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(user.id, user.name, user.email, passwordHash, user.phone, user.avatar, user.role);

  res.json({ user, token: issueToken(user) });
}));

authRouter.post("/signin", asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  const row = await db.prepare("SELECT * FROM users WHERE lower(email) = lower(?)").get(email || "");
  if (!row || !(await bcrypt.compare(password || "", row.password_hash))) {
    return res.status(401).json({ error: "Invalid email or password." });
  }
  const user = rowToUser(row);
  res.json({ user, token: issueToken(user) });
}));

authRouter.post("/signout", (req, res) => {
  res.json({ ok: true });
});

authRouter.get("/session", requireAuth, asyncHandler(async (req, res) => {
  const row = await db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!row) return res.status(401).json({ error: "Session expired. Please sign in again." });
  res.json({ user: rowToUser(row) });
}));
