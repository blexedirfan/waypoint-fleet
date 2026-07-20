import pg from "pg";
import { SEED_VEHICLES } from "./seedVehicles.js";
import { SEED_ALARMS } from "./seedAlarms.js";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
const isLocal = !connectionString || /localhost|127\.0\.0\.1/.test(connectionString);

export const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

// Keeps every route file's `db.prepare(sql).get/all/run(...)` calls working
// unchanged against a real Postgres connection — only `?` placeholders (the
// node:sqlite style already used everywhere) get rewritten to Postgres's
// `$1, $2, ...`, and every method returns a Promise instead of a value.
function toPgSql(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

export const db = {
  prepare(sql) {
    const pgSql = toPgSql(sql);
    return {
      async get(...params) {
        const { rows } = await pool.query(pgSql, params);
        return rows[0];
      },
      async all(...params) {
        const { rows } = await pool.query(pgSql, params);
        return rows;
      },
      async run(...params) {
        await pool.query(pgSql, params);
      },
    };
  },
  exec(sql) {
    return pool.query(sql);
  },
};

// The Postgres container (docker-compose in local dev) can still be starting
// up when this module loads — retry instead of crashing the server on boot.
async function waitForDb() {
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      await pool.query("SELECT 1");
      return;
    } catch (err) {
      if (attempt === 10) throw err;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

await waitForDb();

await db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    phone TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin','member')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
    "desc" TEXT NOT NULL,
    tone TEXT NOT NULL CHECK (tone IN ('good','warn','muted')),
    read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS alarms (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL,
    driver_name TEXT,
    alarm_type TEXT NOT NULL,
    fleet TEXT,
    alarm_status TEXT,
    begin_time TIMESTAMPTZ NOT NULL,
    start_position TEXT,
    start_speed TEXT,
    reporting_time TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Acknowledged')),
    process_user TEXT,
    process_time TIMESTAMPTZ,
    process_driver TEXT,
    remark TEXT,
    geofence_name TEXT,
    end_time TIMESTAMPTZ,
    end_position TEXT,
    end_speed TEXT,
    re_upload TEXT,
    start_details TEXT,
    end_details TEXT,
    alarm_duration TEXT,
    process_memo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`);

// Migration for databases created before `created_by` existed — Postgres
// has no "ADD COLUMN IF NOT EXISTS" pre-9.6-safe check across all versions
// we care about, so check information_schema first either way.
const { rows: vehicleColumns } = await pool.query(
  "SELECT column_name FROM information_schema.columns WHERE table_name = 'vehicles'"
);
if (!vehicleColumns.some((c) => c.column_name === "created_by")) {
  await db.exec("ALTER TABLE vehicles ADD COLUMN created_by TEXT REFERENCES users(id)");
}

if (!(await db.prepare("SELECT id FROM permissions WHERE id = 1").get())) {
  await db.prepare("INSERT INTO permissions (id) VALUES (1)").run();
}

const { count } = await db.prepare("SELECT COUNT(*) as count FROM vehicles").get();
if (Number(count) === 0) {
  const insert = db.prepare(`
    INSERT INTO vehicles (
      asset_no, model, type, model_year, month, engine_cc, color, color_hex,
      fuel_type, transmission, seating, status, owner, assigned_to, department,
      allocated_on, notes, person_name, person_title, person_department,
      person_office, person_employee_id, person_email, person_contact, person_hue
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const v of SEED_VEHICLES) {
    await insert.run(
      v.assetNo, v.model, v.type, v.modelYear, v.month, v.engineCC, v.color, v.colorHex,
      v.fuelType, v.transmission, v.seating, v.status, v.owner, v.assignedTo, v.department,
      v.allocatedOn, v.notes, v.person.name, v.person.title, v.person.department,
      v.person.office, v.person.employeeId, v.person.email, v.person.contact, v.person.hue
    );
  }
}

const { count: alarmCount } = await db.prepare("SELECT COUNT(*) as count FROM alarms").get();
if (Number(alarmCount) === 0) {
  const insertAlarm = db.prepare(`
    INSERT INTO alarms (
      id, device_id, driver_name, alarm_type, fleet, alarm_status, begin_time,
      start_position, start_speed, reporting_time, status, process_user, process_time,
      process_driver, remark, geofence_name, end_time, end_position, end_speed,
      re_upload, start_details, end_details, alarm_duration, process_memo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const a of SEED_ALARMS) {
    await insertAlarm.run(
      a.id, a.deviceId, a.driverName, a.alarmType, a.fleet, a.alarmStatus, a.beginTime,
      a.startPosition, a.startSpeed, a.reportingTime, a.status, a.processUser, a.processTime,
      a.processDriver, a.remark, a.geofenceName, a.endTime, a.endPosition, a.endSpeed,
      a.reUpload, a.startDetails, a.endDetails, a.alarmDuration, a.processMemo
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

export function rowToAlarm(row) {
  return {
    id: row.id,
    deviceId: row.device_id,
    driverName: row.driver_name,
    alarmType: row.alarm_type,
    fleet: row.fleet,
    alarmStatus: row.alarm_status,
    beginTime: row.begin_time,
    startPosition: row.start_position,
    startSpeed: row.start_speed,
    reportingTime: row.reporting_time,
    status: row.status,
    processUser: row.process_user,
    processTime: row.process_time,
    processDriver: row.process_driver,
    remark: row.remark,
    geofenceName: row.geofence_name,
    endTime: row.end_time,
    endPosition: row.end_position,
    endSpeed: row.end_speed,
    reUpload: row.re_upload,
    startDetails: row.start_details,
    endDetails: row.end_details,
    alarmDuration: row.alarm_duration,
    processMemo: row.process_memo,
  };
}
