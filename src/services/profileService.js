import { getItem, setItem } from "@/lib/storage";

/* CONTRACT for backend dev — replace the localStorage bodies below with
   fetch() calls to your real endpoints; keep these signatures/return shapes
   so useProfile.js needs no changes:
     getProfile(userId)           => Promise<{id,name,email,phone,avatar}>
     updateProfile(userId, patch) => Promise<{id,name,email,phone,avatar}> */

function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toPublicUser(u) {
  return { id: u.id, name: u.name, email: u.email, phone: u.phone, avatar: u.avatar };
}

export async function getProfile(userId) {
  await delay();
  const users = getItem("users", []);
  const user = users.find((u) => u.id === userId);
  if (!user) throw new Error("Profile not found.");
  return toPublicUser(user);
}

export async function updateProfile(userId, patch) {
  await delay();
  const users = getItem("users", []);
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error("Profile not found.");
  users[idx] = { ...users[idx], ...patch };
  setItem("users", users);
  return toPublicUser(users[idx]);
}
