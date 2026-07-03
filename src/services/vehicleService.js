import { apiFetch } from "@/lib/apiClient";

/* Talks to the real API server (see server/src/routes/vehicles.js).
     getVehicles()             => Promise<Vehicle[]>
     updateVehicle(id, patch)  => Promise<Vehicle>
     createVehicle(data)       => Promise<Vehicle>
     deleteVehicle(id)         => Promise<void>
   The server enforces the same admin/member permission rules the UI
   already implies (see permissionsService.js) — a 403 here means the
   signed-in account genuinely isn't allowed to make this change, not just
   that the button was hidden client-side. */

export async function getVehicles() {
  return apiFetch("/api/vehicles");
}

export async function updateVehicle(id, patch) {
  return apiFetch(`/api/vehicles/${encodeURIComponent(id)}`, { method: "PATCH", body: patch });
}

export async function createVehicle(data) {
  return apiFetch("/api/vehicles", { method: "POST", body: data });
}

export async function deleteVehicle(id) {
  await apiFetch(`/api/vehicles/${encodeURIComponent(id)}`, { method: "DELETE" });
}
