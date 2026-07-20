import { Router } from "express";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { db, rowToAlarm } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../asyncHandler.js";

export const alarmsRouter = Router();

// Howen VSS (or whichever third-party platform ends up sending these) push
// alerts in here — unlike every other route in this file, the caller isn't
// one of our signed-in users, so this can't use requireAuth. It's instead
// gated by a shared secret both sides know, checked in constant time so a
// slow string-compare can't leak the secret one byte at a time.
function verifyWebhookSecret(req) {
  const expected = process.env.HOWEN_WEBHOOK_SECRET;
  if (!expected) return false; // fail closed if the server isn't configured
  const provided = req.headers["x-webhook-secret"] || "";
  const a = Buffer.from(String(provided));
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// We don't yet have Howen's actual payload spec, so this accepts a handful
// of plausible key spellings per field rather than one exact shape — once
// their real docs are in hand, trim this down to match.
function pick(body, keys) {
  for (const key of keys) {
    if (body[key] !== undefined && body[key] !== null && body[key] !== "") return body[key];
  }
  return undefined;
}

function pickPosition(body, prefix) {
  const combined = pick(body, [`${prefix}Position`, `${prefix}_position`, `${prefix}Location`]);
  if (combined) return String(combined);
  const lat = pick(body, [`${prefix}Lat`, `${prefix}_lat`, `${prefix}Latitude`]);
  const lng = pick(body, [`${prefix}Lng`, `${prefix}_lng`, `${prefix}Longitude`, `${prefix}Lon`]);
  if (lat !== undefined && lng !== undefined) return `${lat}, ${lng}`;
  return null;
}

function mapWebhookPayload(body) {
  return {
    externalId: pick(body, ["id", "alertId", "alarmId", "eventId"]),
    deviceId: pick(body, ["deviceId", "device_id", "deviceID", "device", "deviceName"]),
    driverName: pick(body, ["driverName", "driver_name", "driver"]) ?? null,
    alarmType: pick(body, ["alarmType", "alarm_type", "type"]),
    fleet: pick(body, ["fleet", "fleetName", "fleet_name"]) ?? null,
    alarmStatus: pick(body, ["alarmStatus", "alarm_status", "eventStatus"]) ?? null,
    beginTime: pick(body, ["beginTime", "begin_time", "startTime", "start_time", "time"]),
    startPosition: pickPosition(body, "start"),
    startSpeed: pick(body, ["startSpeed", "start_speed", "speed"]) ?? null,
    reportingTime: pick(body, ["reportingTime", "reporting_time", "reportTime"]) ?? null,
    geofenceName: pick(body, ["geofenceName", "geofence_name", "geofence"]) ?? null,
    endTime: pick(body, ["endTime", "end_time"]) ?? null,
    endPosition: pickPosition(body, "end"),
    endSpeed: pick(body, ["endSpeed", "end_speed"]) ?? null,
    reUpload: pick(body, ["reUpload", "re_upload"]) ?? null,
    startDetails: pick(body, ["startDetails", "start_details", "startRaw"]) ?? null,
    endDetails: pick(body, ["endDetails", "end_details", "endRaw"]) ?? null,
    alarmDuration: pick(body, ["alarmDuration", "alarm_duration", "duration"]) ?? null,
  };
}

// Not requireAuth — this is called by the third-party platform itself, not
// a signed-in Waypoint user. Mounted at POST /api/alarms/webhook.
alarmsRouter.post("/webhook", asyncHandler(async (req, res) => {
  if (!verifyWebhookSecret(req)) {
    return res.status(401).json({ error: "Invalid or missing webhook secret." });
  }

  const mapped = mapWebhookPayload(req.body || {});
  if (!mapped.deviceId || !mapped.alarmType || !mapped.beginTime) {
    return res.status(400).json({ error: "deviceId, alarmType, and beginTime (or an equivalent field) are required." });
  }

  // Webhooks are commonly retried on timeout/network blips — if the sender
  // gives us their own event id, upsert on it so a retry updates the same
  // row instead of creating a duplicate alert. Namespaced so it can never
  // collide with our own ALM-xxxx seed/manual ids.
  const id = mapped.externalId ? `HWN-${mapped.externalId}` : `HWN-${randomUUID()}`;

  await db.prepare(`
    INSERT INTO alarms (
      id, device_id, driver_name, alarm_type, fleet, alarm_status, begin_time,
      start_position, start_speed, reporting_time, status, geofence_name,
      end_time, end_position, end_speed, re_upload, start_details, end_details, alarm_duration
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (id) DO UPDATE SET
      device_id = EXCLUDED.device_id, driver_name = EXCLUDED.driver_name,
      alarm_type = EXCLUDED.alarm_type, fleet = EXCLUDED.fleet,
      alarm_status = EXCLUDED.alarm_status, begin_time = EXCLUDED.begin_time,
      start_position = EXCLUDED.start_position, start_speed = EXCLUDED.start_speed,
      reporting_time = EXCLUDED.reporting_time, geofence_name = EXCLUDED.geofence_name,
      end_time = EXCLUDED.end_time, end_position = EXCLUDED.end_position,
      end_speed = EXCLUDED.end_speed, re_upload = EXCLUDED.re_upload,
      start_details = EXCLUDED.start_details, end_details = EXCLUDED.end_details,
      alarm_duration = EXCLUDED.alarm_duration
  `).run(
    id, mapped.deviceId, mapped.driverName, mapped.alarmType, mapped.fleet, mapped.alarmStatus,
    mapped.beginTime, mapped.startPosition, mapped.startSpeed, mapped.reportingTime,
    mapped.geofenceName, mapped.endTime, mapped.endPosition, mapped.endSpeed,
    mapped.reUpload, mapped.startDetails, mapped.endDetails, mapped.alarmDuration
  );

  const row = await db.prepare("SELECT * FROM alarms WHERE id = ?").get(id);
  res.status(201).json(rowToAlarm(row));
}));

alarmsRouter.get("/", requireAuth, asyncHandler(async (req, res) => {
  const rows = await db.prepare("SELECT * FROM alarms ORDER BY begin_time DESC").all();
  res.json(rows.map(rowToAlarm));
}));

alarmsRouter.patch("/:id/acknowledge", requireAuth, asyncHandler(async (req, res) => {
  const existing = await db.prepare("SELECT * FROM alarms WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Alarm not found." });
  if (existing.status === "Acknowledged") {
    return res.status(409).json({ error: "This alarm has already been acknowledged." });
  }

  const user = await db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  const { remark, processMemo } = req.body || {};

  await db.prepare(`
    UPDATE alarms SET
      status = 'Acknowledged', process_user = ?, process_time = now(),
      process_driver = ?, remark = ?, process_memo = ?
    WHERE id = ?
  `).run(
    user.email, "Already fire Driver", remark || "Correct alarm", processMemo ?? null,
    req.params.id
  );

  const row = await db.prepare("SELECT * FROM alarms WHERE id = ?").get(req.params.id);
  res.json(rowToAlarm(row));
}));
