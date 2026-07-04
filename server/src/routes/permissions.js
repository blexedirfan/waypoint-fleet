import { Router } from "express";
import { db, rowToPermissions } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../asyncHandler.js";

export const permissionsRouter = Router();

const PATCHABLE = {
  membersCanEditVehicle: "members_can_edit_vehicle",
  membersCanEditAssignment: "members_can_edit_assignment",
  membersCanAddVehicles: "members_can_add_vehicles",
  membersCanDeleteVehicles: "members_can_delete_vehicles",
};

permissionsRouter.get("/", requireAuth, asyncHandler(async (req, res) => {
  const row = await db.prepare("SELECT * FROM permissions WHERE id = 1").get();
  res.json(rowToPermissions(row));
}));

permissionsRouter.patch("/", requireAuth, asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Only admins can change member permissions." });
  }
  const existing = await db.prepare("SELECT * FROM permissions WHERE id = 1").get();
  const patch = req.body || {};
  const merged = { ...existing };
  for (const [apiField, column] of Object.entries(PATCHABLE)) {
    if (apiField in patch) merged[column] = patch[apiField] ? 1 : 0;
  }

  await db.prepare(`
    UPDATE permissions SET
      members_can_edit_vehicle = ?, members_can_edit_assignment = ?,
      members_can_add_vehicles = ?, members_can_delete_vehicles = ?
    WHERE id = 1
  `).run(
    merged.members_can_edit_vehicle, merged.members_can_edit_assignment,
    merged.members_can_add_vehicles, merged.members_can_delete_vehicles
  );

  res.json(rowToPermissions(await db.prepare("SELECT * FROM permissions WHERE id = 1").get()));
}));
