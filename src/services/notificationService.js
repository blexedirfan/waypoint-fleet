import { apiFetch } from "@/lib/apiClient";

/* Talks to the real API server (see server/src/routes/notifications.js).
     getNotifications()                    => Promise<Notification[]>
     addNotification({title, desc, tone})  => Promise<Notification>
     toggleRead(id)                        => Promise<Notification[]>
     markAllRead()                         => Promise<Notification[]>
   Notification: { id, title, desc, time (ISO string), read, tone }
   tone is "good" | "warn" | "muted" (drives color in NotificationsPage.jsx).
   This is a fleet-wide feed (no per-user scoping) — see the note in
   server/src/db.js about that being an open decision for later. */

export async function getNotifications() {
  return apiFetch("/api/notifications");
}

export async function addNotification({ title, desc, tone }) {
  return apiFetch("/api/notifications", { method: "POST", body: { title, desc, tone } });
}

export async function toggleRead(id) {
  return apiFetch(`/api/notifications/${encodeURIComponent(id)}/toggle`, { method: "PATCH" });
}

export async function markAllRead() {
  return apiFetch("/api/notifications/mark-all-read", { method: "POST" });
}
