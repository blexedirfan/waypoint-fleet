import { useState, useEffect, useCallback } from "react";
import * as vehicleService from "@/services/vehicleService";
import { VEHICLES } from "@/constants/data";

export function useVehicles() {
  const [vehicles, setVehicles] = useState(VEHICLES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    vehicleService
      .getVehicles()
      .then(setVehicles)
      .finally(() => setLoading(false));
  }, []);

  const updateVehicle = useCallback(async (id, patch) => {
    setSaving(true);
    try {
      const updated = await vehicleService.updateVehicle(id, patch);
      setVehicles((prev) => prev.map((v) => (v.id === id ? updated : v)));
      return updated;
    } finally {
      setSaving(false);
    }
  }, []);

  const createVehicle = useCallback(async (data) => {
    setSaving(true);
    try {
      const created = await vehicleService.createVehicle(data);
      setVehicles((prev) => [...prev, created]);
      return created;
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteVehicle = useCallback(async (id) => {
    setSaving(true);
    try {
      await vehicleService.deleteVehicle(id);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    } finally {
      setSaving(false);
    }
  }, []);

  return { vehicles, loading, saving, updateVehicle, createVehicle, deleteVehicle };
}
