import { getItem, setItem } from "@/lib/storage";

/* CONTRACT for backend dev — replace the localStorage bodies below with
   fetch() calls to your real endpoints; keep these signatures/return shapes
   so usePermissions.js needs no changes:
     getPermissions()           => Promise<Permissions>
     updatePermissions(patch)   => Promise<Permissions>
   Permissions is a single global record (not per-user) controlling what a
   "member" (non-admin) account is allowed to do. Admins are never gated by
   this — these flags only affect members:
     { membersCanEditVehicle, membersCanEditAssignment, membersCanAddVehicles, membersCanDeleteVehicles } */

const DEFAULTS = {
  membersCanEditVehicle: true,
  membersCanEditAssignment: false,
  membersCanAddVehicles: false,
  membersCanDeleteVehicles: false,
};

function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function seedIfEmpty() {
  const existing = getItem("permissions", null);
  if (existing === null) {
    setItem("permissions", DEFAULTS);
    return DEFAULTS;
  }
  return existing;
}

export async function getPermissions() {
  await delay();
  return seedIfEmpty();
}

export async function updatePermissions(patch) {
  await delay();
  const current = seedIfEmpty();
  const updated = { ...current, ...patch };
  setItem("permissions", updated);
  return updated;
}
