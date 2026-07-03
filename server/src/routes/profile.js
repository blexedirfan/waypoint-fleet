import { Router } from "express";
import { db, rowToUser } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const profileRouter = Router();

const EDITABLE_FIELDS = ["name", "email", "phone", "avatar"];

profileRouter.get("/", requireAuth, (req, res) => {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!row) return res.status(404).json({ error: "Profile not found." });
  res.json(rowToUser(row));
});

profileRouter.patch("/", requireAuth, (req, res) => {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!row) return res.status(404).json({ error: "Profile not found." });

  const patch = req.body || {};
  const updated = { ...row };
  for (const key of EDITABLE_FIELDS) {
    if (key in patch) updated[key] = patch[key];
  }

  db.prepare("UPDATE users SET name = ?, email = ?, phone = ?, avatar = ? WHERE id = ?").run(
    updated.name, updated.email, updated.phone, updated.avatar, row.id
  );

  res.json(rowToUser(updated));
});
