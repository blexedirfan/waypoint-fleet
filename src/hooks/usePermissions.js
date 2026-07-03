import { useState, useEffect, useCallback } from "react";
import * as permissionsService from "@/services/permissionsService";

export function usePermissions() {
  const [permissions, setPermissions] = useState({
    membersCanEditVehicle: true,
    membersCanEditAssignment: false,
    membersCanAddVehicles: false,
    membersCanDeleteVehicles: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    permissionsService.getPermissions().then(setPermissions);
  }, []);

  const updatePermissions = useCallback(async (patch) => {
    setSaving(true);
    try {
      const updated = await permissionsService.updatePermissions(patch);
      setPermissions(updated);
      return updated;
    } finally {
      setSaving(false);
    }
  }, []);

  return { permissions, saving, updatePermissions };
}
