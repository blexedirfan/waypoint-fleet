import { Router } from "express";
import { randomUUID } from "node:crypto";
import { db, rowToNotification } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../asyncHandler.js";

export const notificationsRouter = Router();

notificationsRouter.get("/", requireAuth, asyncHandler(async (req, res) => {
  const rows = await db.prepare("SELECT * FROM notifications ORDER BY created_at DESC").all();
  res.json(rows.map(rowToNotification));
}));

notificationsRouter.post("/", requireAuth, asyncHandler(async (req, res) => {
  const { title, desc, tone } = req.body || {};
  if (!title || !desc || !tone) {
    return res.status(400).json({ error: "title, desc, and tone are required." });
  }
  const notification = { id: randomUUID(), title, desc, tone, read: 0, created_at: new Date().toISOString() };
  await db.prepare('INSERT INTO notifications (id, title, "desc", tone, read, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
    notification.id, notification.title, notification.desc, notification.tone, notification.read, notification.created_at
  );
  res.json(rowToNotification(notification));
}));

notificationsRouter.patch("/:id/toggle", requireAuth, asyncHandler(async (req, res) => {
  const row = await db.prepare("SELECT * FROM notifications WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Notification not found." });
  await db.prepare("UPDATE notifications SET read = ? WHERE id = ?").run(row.read ? 0 : 1, row.id);
  const rows = await db.prepare("SELECT * FROM notifications ORDER BY created_at DESC").all();
  res.json(rows.map(rowToNotification));
}));

notificationsRouter.post("/mark-all-read", requireAuth, asyncHandler(async (req, res) => {
  await db.prepare("UPDATE notifications SET read = 1").run();
  const rows = await db.prepare("SELECT * FROM notifications ORDER BY created_at DESC").all();
  res.json(rows.map(rowToNotification));
}));
