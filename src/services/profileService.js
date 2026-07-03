import { apiFetch } from "@/lib/apiClient";

/* Talks to the real API server (see server/src/routes/profile.js).
     getProfile(userId)           => Promise<{id,name,email,phone,avatar}>
     updateProfile(userId, patch) => Promise<{id,name,email,phone,avatar}>
   `userId` is accepted for signature compatibility but unused — the server
   identifies the caller from the Bearer token, always acting on "me". */

export async function getProfile(_userId) {
  return apiFetch("/api/profile");
}

export async function updateProfile(_userId, patch) {
  return apiFetch("/api/profile", { method: "PATCH", body: patch });
}
