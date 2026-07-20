import { useState, useEffect, useCallback } from "react";
import * as alarmService from "@/services/alarmService";

export function useAlarms(isAuthenticated) {
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refetch = useCallback(() => alarmService.getAlarms().then(setAlarms), []);

  useEffect(() => {
    if (!isAuthenticated) return;
    refetch().finally(() => setLoading(false));
  }, [isAuthenticated, refetch]);

  const acknowledgeAlarm = useCallback(async (id, data) => {
    setSaving(true);
    try {
      const updated = await alarmService.acknowledgeAlarm(id, data);
      setAlarms((prev) => prev.map((a) => (a.id === id ? updated : a)));
      return updated;
    } finally {
      setSaving(false);
    }
  }, []);

  return { alarms, loading, saving, acknowledgeAlarm, refetch };
}
