import { useState, useCallback } from "react";
import * as profileService from "@/services/profileService";

/* Wraps the currently authenticated `user` (from useAuth). `onChange` is
   called with the updated record so the caller can sync it back into
   useAuth's state (keeps a single source of truth for the current user). */
export function useProfile(user, onChange) {
  const [saving, setSaving] = useState(false);

  const updateProfile = useCallback(
    async (patch) => {
      if (!user) return;
      setSaving(true);
      try {
        const updated = await profileService.updateProfile(user.id, patch);
        onChange?.(updated);
        return updated;
      } finally {
        setSaving(false);
      }
    },
    [user, onChange]
  );

  const updateAvatar = useCallback((dataUrl) => updateProfile({ avatar: dataUrl }), [updateProfile]);

  return { profile: user, saving, updateProfile, updateAvatar };
}
