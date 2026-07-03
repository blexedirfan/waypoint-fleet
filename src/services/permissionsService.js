import { apiFetch } from "@/lib/apiClient";

/* Talks to the real API server (see server/src/routes/permissions.js).
     getPermissions()           => Promise<Permissions>
     updatePermissions(patch)   => Promise<Permissions>
   Permissions is a single global record (not per-user) controlling what a
   "member" (non-admin) account is allowed to do. Admins are never gated by
   this — these flags only affect members. The server rejects (403) a
   PATCH from anyone whose role isn't "admin", regardless of what the UI
   shows:
     { membersCanEditVehicle, membersCanEditAssignment, membersCanAddVehicles, membersCanDeleteVehicles } */

export async function getPermissions() {
  return apiFetch("/api/permissions");
}

export async function updatePermissions(patch) {
  return apiFetch("/api/permissions", { method: "PATCH", body: patch });
}
