import { getItem, setItem } from "@/lib/storage";

/* CONTRACT for backend dev — replace the localStorage bodies below with
   fetch() calls to your real endpoints; keep these signatures/return shapes
   so useNotifications.js needs no changes:
     getNotifications()                    => Promise<Notification[]>
     addNotification({title, desc, tone})  => Promise<Notification>
     toggleRead(id)                        => Promise<Notification[]>
     markAllRead()                         => Promise<Notification[]>
   Notification: { id, title, desc, time (ISO string), read, tone }
   tone is "good" | "warn" | "muted" (drives color in NotificationsPage.jsx). */

function delay(ms = 150) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function seedIfEmpty() {
  const existing = getItem("notifications", null);
  if (existing === null) {
    setItem("notifications", []);
    return [];
  }
  return existing;
}

export async function getNotifications() {
  await delay();
  return seedIfEmpty();
}

export async function addNotification({ title, desc, tone }) {
  await delay();
  const notifications = seedIfEmpty();
  const notification = {
    id: crypto.randomUUID(),
    title,
    desc,
    tone,
    time: new Date().toISOString(),
    read: false,
  };
  setItem("notifications", [notification, ...notifications]);
  return notification;
}

export async function toggleRead(id) {
  await delay();
  const notifications = seedIfEmpty();
  const updated = notifications.map((n) => (n.id === id ? { ...n, read: !n.read } : n));
  setItem("notifications", updated);
  return updated;
}

export async function markAllRead() {
  await delay();
  const notifications = seedIfEmpty();
  const updated = notifications.map((n) => ({ ...n, read: true }));
  setItem("notifications", updated);
  return updated;
}
