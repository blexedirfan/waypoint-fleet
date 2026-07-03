import { getItem, setItem } from "@/lib/storage";
import { VEHICLES } from "@/constants/data";

/* CONTRACT for backend dev — replace the localStorage bodies below with
   fetch() calls to your real endpoints; keep these signatures/return shapes
   so useVehicles.js needs no changes:
     getVehicles()             => Promise<Vehicle[]>
     updateVehicle(id, patch)  => Promise<Vehicle>
     createVehicle(data)       => Promise<Vehicle>
     deleteVehicle(id)         => Promise<void>
   Vehicle is the existing shape in constants/data.js plus two optional
   user-editable fields: `nickname` (string) and `photo` (base64 data URL).
   createVehicle uses `data.assetNo` as the new vehicle's `id` — it's the
   primary key referenced everywhere (selectedVehicleId, list keys), so it
   must be unique and is never changed afterward. */

function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function seedIfEmpty() {
  const existing = getItem("vehicles", null);
  if (existing === null) {
    setItem("vehicles", VEHICLES);
    return VEHICLES;
  }
  return existing;
}

export async function getVehicles() {
  await delay();
  return seedIfEmpty();
}

export async function updateVehicle(id, patch) {
  await delay();
  const vehicles = seedIfEmpty();
  const idx = vehicles.findIndex((v) => v.id === id);
  if (idx === -1) throw new Error("Vehicle not found.");
  const updated = vehicles.map((v, i) => (i === idx ? { ...v, ...patch } : v));
  setItem("vehicles", updated);
  return updated[idx];
}

export async function createVehicle(data) {
  await delay();
  const vehicles = seedIfEmpty();
  if (!data.assetNo) throw new Error("Asset No. is required.");
  if (vehicles.some((v) => v.id === data.assetNo)) {
    throw new Error("A vehicle with this Asset No. already exists.");
  }
  const vehicle = { id: data.assetNo, ...data };
  setItem("vehicles", [...vehicles, vehicle]);
  return vehicle;
}

export async function deleteVehicle(id) {
  await delay();
  const vehicles = seedIfEmpty();
  const updated = vehicles.filter((v) => v.id !== id);
  setItem("vehicles", updated);
}
