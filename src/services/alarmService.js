import { apiFetch } from "@/lib/apiClient";

/* Talks to the real API server (see server/src/routes/alarms.js).
     getAlarms()                              => Promise<Alarm[]>
     acknowledgeAlarm(id, { remark, processMemo }) => Promise<Alarm> */

export async function getAlarms() {
  return apiFetch("/api/alarms");
}

export async function acknowledgeAlarm(id, data) {
  return apiFetch(`/api/alarms/${encodeURIComponent(id)}/acknowledge`, { method: "PATCH", body: data });
}
