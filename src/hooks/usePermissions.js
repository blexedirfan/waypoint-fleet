import { useState, useEffect, useCallback } from "react";
import * as permissionsService from "@/services/permissionsService";

export function usePermissions(isAuthenticated) {
  const [permissions, setPermissions] = useState({
    membersCanEditVehicle: true,
    membersCanEditAssignment: false,
    membersCanAddVehicles: false,
    membersCanDeleteVehicles: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    permissionsService.getPermissions().then(setPermissions);
  }, [isAuthenticated]);

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
