import { useState, useEffect } from "react";
import { AppContext } from "@/context/AppContext";
import { AppShell } from "@/components/layout/AppShell";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { AddVehicleOnboarding } from "@/components/onboarding/AddVehicleOnboarding";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useVehicles } from "@/hooks/useVehicles";
import { usePermissions } from "@/hooks/usePermissions";
import { useNotifications } from "@/hooks/useNotifications";
import { LIGHT_THEME, DARK_THEME, FONT_FACE } from "@/constants/tokens";

const STATUS_TONE = { Active: "good", Maintenance: "warn", Inactive: "muted" };

export default function App() {
  const { user, isAuthenticated, loading, signIn, signUp, signOut, setUser } = useAuth();
  const { saving: savingProfile, updateProfile, updateAvatar } = useProfile(user, setUser);
  const { vehicles, loading: vehiclesLoading, saving: savingVehicle, updateVehicle, createVehicle, deleteVehicle } = useVehicles(isAuthenticated);
  const { permissions, updatePermissions } = usePermissions(isAuthenticated);
  const { notifications, unreadCount, addNotification, toggleRead, markAllRead } = useNotifications(isAuthenticated);
  const isAdmin = user?.role === "admin";
  const ownsAVehicle = vehicles.some((v) => v.createdBy === user?.id);
  const needsOnboarding = isAuthenticated && !isAdmin && !vehiclesLoading && !ownsAVehicle;

  const [page, setPage]                         = useState("dashboard");
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [mobileOpen, setMobileOpen]             = useState(false);
  const [isDark, setIsDark]                     = useState(false);

  // Once real vehicles have loaded, make sure selectedVehicleId points at
  // something that actually exists — defaulting to the signed-in member's
  // own vehicle if they have one. The old approach (hardcoding the first
  // mock vehicle's id) silently broke once that seed vehicle was ever
  // deleted, quietly falling back to an unrelated vehicle instead.
  useEffect(() => {
    if (vehiclesLoading || vehicles.length === 0) return;
    const stillExists = vehicles.some((v) => v.id === selectedVehicleId);
    if (stillExists) return;
    const own = vehicles.find((v) => v.createdBy === user?.id);
    setSelectedVehicleId((own || vehicles[0]).id);
  }, [vehiclesLoading, vehicles, user?.id, selectedVehicleId]);

  const handleCreateVehicle = async (data) => {
    const created = await createVehicle(data);
    setSelectedVehicleId(created.id);
    addNotification({
      title: "Vehicle added",
      desc: `${created.model} (${created.assetNo}) added to the fleet.`,
      tone: "good",
    });
    return created;
  };

  const handleUpdateVehicle = async (id, patch) => {
    const before = vehicles.find((v) => v.id === id);
    const updated = await updateVehicle(id, patch);
    if (before && patch.status && patch.status !== before.status) {
      addNotification({
        title: "Status changed",
        desc: `${updated.model} (${updated.assetNo}) marked ${updated.status}.`,
        tone: STATUS_TONE[updated.status] || "muted",
      });
    }
    if (before && patch.assignedTo && patch.assignedTo !== before.assignedTo) {
      addNotification({
        title: "Reassigned",
        desc: `${updated.model} (${updated.assetNo}) now assigned to ${updated.assignedTo}.`,
        tone: "good",
      });
    }
    return updated;
  };

  const handleDeleteVehicle = async (id) => {
    const before = vehicles.find((v) => v.id === id);
    await deleteVehicle(id);
    if (before) {
      addNotification({
        title: "Vehicle removed",
        desc: `${before.model} (${before.assetNo}) removed from the fleet.`,
        tone: "muted",
      });
    }
  };

  /* Apply theme CSS variables to <html> whenever isDark changes */
  useEffect(() => {
    const tokens = isDark ? DARK_THEME : LIGHT_THEME;
    const root   = document.documentElement;
    Object.entries(tokens).forEach(([key, value]) => {
      root.style.setProperty(`--wp-${key}`, value);
    });
    root.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const ctx = {
    currentUser: user,
    updateProfile,
    updateAvatar,
    savingProfile,
    isAdmin,
    permissions,
    updatePermissions,
    page,
    setPage,
    vehicles,
    updateVehicle: handleUpdateVehicle,
    createVehicle: handleCreateVehicle,
    deleteVehicle: handleDeleteVehicle,
    savingVehicle,
    selectedVehicleId,
    setSelectedVehicleId,
    notifications,
    toggleRead,
    markAllRead,
    unreadCount,
    logout: signOut,
    mobileOpen,
    setMobileOpen,
    isDark,
    setIsDark,
  };

  // While a signed-in member's vehicle list is still loading, we don't yet
  // know whether they need onboarding — hold here instead of briefly
  // flashing the normal dashboard before possibly redirecting.
  if (loading || (isAuthenticated && !isAdmin && vehiclesLoading)) {
    return (
      <>
        <style>{FONT_FACE}</style>
        <div className="flex items-center justify-center min-h-screen text-sm">
          Loading…
        </div>
      </>
    );
  }

  return (
    <>
      <style>{FONT_FACE}</style>
      {!isAuthenticated ? (
        <AuthScreen signIn={signIn} signUp={signUp} />
      ) : needsOnboarding ? (
        <AddVehicleOnboarding currentUser={user} createVehicle={handleCreateVehicle} />
      ) : (
        <AppContext.Provider value={ctx}>
          <AppShell />
        </AppContext.Provider>
      )}
    </>
  );
}
