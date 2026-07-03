import { Router } from "express";
import { db, rowToVehicle } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const vehiclesRouter = Router();

// Fields grouped exactly like VehicleForm.jsx's "Vehicle" vs "Assignment"
// sections, so server-side enforcement matches what the UI already implies.
// nickname/photo are deliberately excluded from both — Settings has always
// let any signed-in user personalize their vehicle's nickname/photo with no
// permission gate, and that stays true here.
const VEHICLE_FIELD_TO_COLUMN = {
  model: "model", type: "type", modelYear: "model_year", month: "month",
  engineCC: "engine_cc", color: "color", colorHex: "color_hex", fuelType: "fuel_type",
  transmission: "transmission", seating: "seating", status: "status", notes: "notes",
};
const ASSIGNMENT_FIELD_TO_COLUMN = {
  owner: "owner", assignedTo: "assigned_to", department: "department", allocatedOn: "allocated_on",
};
const PERSON_FIELD_TO_COLUMN = {
  name: "person_name", title: "person_title", department: "person_department", office: "person_office",
  employeeId: "person_employee_id", email: "person_email", contact: "person_contact", hue: "person_hue",
};

function getPermissionsRow() {
  return db.prepare("SELECT * FROM permissions WHERE id = 1").get();
}

function changedFields(existingRow, patch, fieldMap) {
  return Object.keys(fieldMap).filter((field) => {
    if (!(field in patch)) return false;
    return String(patch[field] ?? "") !== String(existingRow[fieldMap[field]] ?? "");
  });
}

function personalizationChanged(existingRow, patch) {
  return ["nickname", "photo"].some(
    (field) => field in patch && String(patch[field] ?? "") !== String(existingRow[field] ?? "")
  );
}

function personChanged(existingRow, patch) {
  if (!("person" in patch) || !patch.person) return false;
  return Object.keys(PERSON_FIELD_TO_COLUMN).some((field) => {
    if (!(field in patch.person)) return false;
    return String(patch.person[field] ?? "") !== String(existingRow[PERSON_FIELD_TO_COLUMN[field]] ?? "");
  });
}

vehiclesRouter.get("/", requireAuth, (req, res) => {
  const rows = db.prepare("SELECT * FROM vehicles ORDER BY created_at ASC").all();
  res.json(rows.map(rowToVehicle));
});

vehiclesRouter.post("/", requireAuth, (req, res) => {
  const isAdmin = req.user.role === "admin";
  const perms = getPermissionsRow();
  const { c: ownedCount } = db.prepare("SELECT COUNT(*) as c FROM vehicles WHERE created_by = ?").get(req.user.id);

  // Everyone gets to create their first vehicle unconditionally — that's
  // what makes the mandatory onboarding flow actually unblockable. Beyond
  // that first one, additional vehicles still need the admin's go-ahead.
  if (ownedCount > 0 && !isAdmin && !perms.members_can_add_vehicles) {
    return res.status(403).json({ error: "You don't have permission to add vehicles." });
  }

  const data = req.body || {};
  if (!data.assetNo) return res.status(400).json({ error: "Asset No. is required." });
  const existing = db.prepare("SELECT asset_no FROM vehicles WHERE asset_no = ?").get(data.assetNo);
  if (existing) return res.status(409).json({ error: "A vehicle with this Asset No. already exists." });

  const person = data.person || {};
  db.prepare(`
    INSERT INTO vehicles (
      asset_no, model, type, model_year, month, engine_cc, color, color_hex,
      fuel_type, transmission, seating, status, owner, assigned_to, department,
      allocated_on, notes, nickname, photo, person_name, person_title,
      person_department, person_office, person_employee_id, person_email, person_contact, person_hue,
      created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.assetNo, data.model ?? "", data.type ?? "", data.modelYear ?? null, data.month ?? "",
    data.engineCC ?? "", data.color ?? "", data.colorHex ?? "", data.fuelType ?? "", data.transmission ?? "",
    data.seating ?? "", data.status || "Active", data.owner ?? "", data.assignedTo ?? "", data.department ?? "",
    data.allocatedOn ?? "", data.notes ?? "", data.nickname ?? null, data.photo ?? null,
    person.name ?? "", person.title ?? "", person.department ?? "", person.office ?? "",
    person.employeeId ?? "", person.email ?? "", person.contact ?? "", person.hue ?? 220,
    req.user.id
  );

  const row = db.prepare("SELECT * FROM vehicles WHERE asset_no = ?").get(data.assetNo);
  res.json(rowToVehicle(row));
});

vehiclesRouter.patch("/:assetNo", requireAuth, (req, res) => {
  const existing = db.prepare("SELECT * FROM vehicles WHERE asset_no = ?").get(req.params.assetNo);
  if (!existing) return res.status(404).json({ error: "Vehicle not found." });

  const patch = req.body || {};
  const isAdmin = req.user.role === "admin";
  const isOwner = existing.created_by === req.user.id;
  const perms = getPermissionsRow();

  const vehicleChanges = changedFields(existing, patch, VEHICLE_FIELD_TO_COLUMN);
  const assignmentChanges = changedFields(existing, patch, ASSIGNMENT_FIELD_TO_COLUMN);
  const hasPersonChange = personChanged(existing, patch);
  const hasPersonalizationChange = personalizationChanged(existing, patch);

  if (vehicleChanges.length && !isAdmin && !(isOwner && perms.members_can_edit_vehicle)) {
    return res.status(403).json({ error: "You don't have permission to edit vehicle specs." });
  }
  if ((assignmentChanges.length || hasPersonChange) && !isAdmin && !(isOwner && perms.members_can_edit_assignment)) {
    return res.status(403).json({ error: "You don't have permission to edit assignment info." });
  }
  if (hasPersonalizationChange && !isAdmin && !isOwner) {
    return res.status(403).json({ error: "You can only change the nickname/photo of a vehicle you added." });
  }

  const merged = { ...existing };
  for (const field of Object.keys(VEHICLE_FIELD_TO_COLUMN)) {
    if (field in patch) merged[VEHICLE_FIELD_TO_COLUMN[field]] = patch[field];
  }
  for (const field of Object.keys(ASSIGNMENT_FIELD_TO_COLUMN)) {
    if (field in patch) merged[ASSIGNMENT_FIELD_TO_COLUMN[field]] = patch[field];
  }
  if ("person" in patch && patch.person) {
    for (const field of Object.keys(PERSON_FIELD_TO_COLUMN)) {
      if (field in patch.person) merged[PERSON_FIELD_TO_COLUMN[field]] = patch.person[field];
    }
  }
  if ("nickname" in patch) merged.nickname = patch.nickname;
  if ("photo" in patch) merged.photo = patch.photo;

  db.prepare(`
    UPDATE vehicles SET
      model = ?, type = ?, model_year = ?, month = ?, engine_cc = ?, color = ?, color_hex = ?,
      fuel_type = ?, transmission = ?, seating = ?, status = ?, owner = ?, assigned_to = ?,
      department = ?, allocated_on = ?, notes = ?, nickname = ?, photo = ?, person_name = ?,
      person_title = ?, person_department = ?, person_office = ?, person_employee_id = ?,
      person_email = ?, person_contact = ?, person_hue = ?, updated_at = datetime('now')
    WHERE asset_no = ?
  `).run(
    merged.model, merged.type, merged.model_year, merged.month, merged.engine_cc, merged.color, merged.color_hex,
    merged.fuel_type, merged.transmission, merged.seating, merged.status, merged.owner, merged.assigned_to,
    merged.department, merged.allocated_on, merged.notes, merged.nickname, merged.photo, merged.person_name,
    merged.person_title, merged.person_department, merged.person_office, merged.person_employee_id,
    merged.person_email, merged.person_contact, merged.person_hue, req.params.assetNo
  );

  const row = db.prepare("SELECT * FROM vehicles WHERE asset_no = ?").get(req.params.assetNo);
  res.json(rowToVehicle(row));
});

vehiclesRouter.delete("/:assetNo", requireAuth, (req, res) => {
  const existing = db.prepare("SELECT created_by FROM vehicles WHERE asset_no = ?").get(req.params.assetNo);
  if (!existing) return res.status(404).json({ error: "Vehicle not found." });

  const isAdmin = req.user.role === "admin";
  const isOwner = existing.created_by === req.user.id;
  const perms = getPermissionsRow();
  if (!isAdmin && !(isOwner && perms.members_can_delete_vehicles)) {
    return res.status(403).json({ error: "You don't have permission to delete this vehicle." });
  }
  db.prepare("DELETE FROM vehicles WHERE asset_no = ?").run(req.params.assetNo);
  res.json({ ok: true });
});
