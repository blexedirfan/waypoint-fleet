import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SEED_VEHICLES } from "./seedVehicles.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data.sqlite");

export const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    phone TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin','member')),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS vehicles (
    asset_no TEXT PRIMARY KEY,
    model TEXT NOT NULL,
    type TEXT,
    model_year INTEGER,
    month TEXT,
    engine_cc TEXT,
    color TEXT,
    color_hex TEXT,
    fuel_type TEXT,
    transmission TEXT,
    seating TEXT,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Maintenance','Inactive')),
    owner TEXT,
    assigned_to TEXT,
    department TEXT,
    allocated_on TEXT,
    notes TEXT,
    nickname TEXT,
    photo TEXT,
    person_name TEXT,
    person_title TEXT,
    person_department TEXT,
    person_office TEXT,
    person_employee_id TEXT,
    person_email TEXT,
    person_contact TEXT,
    person_hue INTEGER,
    created_by TEXT REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    members_can_edit_vehicle INTEGER NOT NULL DEFAULT 1,
    members_can_edit_assignment INTEGER NOT NULL DEFAULT 0,
    members_can_add_vehicles INTEGER NOT NULL DEFAULT 0,
    members_can_delete_vehicles INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    desc TEXT NOT NULL,
    tone TEXT NOT NULL CHECK (tone IN ('good','warn','muted')),
    read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
`);

// Migration for databases created before `created_by` existed — SQLite has
// no "ADD COLUMN IF NOT EXISTS", so check first.
const vehicleColumns = db.prepare("PRAGMA table_info(vehicles)").all();
if (!vehicleColumns.some((c) => c.name === "created_by")) {
  db.exec("ALTER TABLE vehicles ADD COLUMN created_by TEXT REFERENCES users(id)");
}

if (!db.prepare("SELECT id FROM permissions WHERE id = 1").get()) {
  db.prepare("INSERT INTO permissions (id) VALUES (1)").run();
}

const { count } = db.prepare("SELECT COUNT(*) as count FROM vehicles").get();
if (count === 0) {
  const insert = db.prepare(`
    INSERT INTO vehicles (
      asset_no, model, type, model_year, month, engine_cc, color, color_hex,
      fuel_type, transmission, seating, status, owner, assigned_to, department,
      allocated_on, notes, person_name, person_title, person_department,
      person_office, person_employee_id, person_email, person_contact, person_hue
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const v of SEED_VEHICLES) {
    insert.run(
      v.assetNo, v.model, v.type, v.modelYear, v.month, v.engineCC, v.color, v.colorHex,
      v.fuelType, v.transmission, v.seating, v.status, v.owner, v.assignedTo, v.department,
      v.allocatedOn, v.notes, v.person.name, v.person.title, v.person.department,
      v.person.office, v.person.employeeId, v.person.email, v.person.contact, v.person.hue
    );
  }
}

// ---- row <-> API shape mapping ----------------------------------------

export function rowToVehicle(row) {
  return {
    id: row.asset_no,
    assetNo: row.asset_no,
    model: row.model,
    type: row.type,
    modelYear: row.model_year,
    month: row.month,
    engineCC: row.engine_cc,
    color: row.color,
    colorHex: row.color_hex,
    fuelType: row.fuel_type,
    transmission: row.transmission,
    seating: row.seating,
    status: row.status,
    owner: row.owner,
    assignedTo: row.assigned_to,
    department: row.department,
    allocatedOn: row.allocated_on,
    notes: row.notes,
    nickname: row.nickname,
    photo: row.photo,
    createdBy: row.created_by,
    person: {
      name: row.person_name,
      title: row.person_title,
      department: row.person_department,
      office: row.person_office,
      employeeId: row.person_employee_id,
      email: row.person_email,
      contact: row.person_contact,
      hue: row.person_hue,
    },
  };
}

export function rowToUser(row) {
  return { id: row.id, name: row.name, email: row.email, phone: row.phone, avatar: row.avatar, role: row.role };
}

export function rowToNotification(row) {
  return { id: row.id, title: row.title, desc: row.desc, tone: row.tone, read: !!row.read, time: row.created_at };
}

export function rowToPermissions(row) {
  return {
    membersCanEditVehicle: !!row.members_can_edit_vehicle,
    membersCanEditAssignment: !!row.members_can_edit_assignment,
    membersCanAddVehicles: !!row.members_can_add_vehicles,
    membersCanDeleteVehicles: !!row.members_can_delete_vehicles,
  };
}
