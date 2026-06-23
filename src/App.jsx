import { useState, useEffect } from "react";
import { AppContext } from "@/context/AppContext";
import { AppShell } from "@/components/layout/AppShell";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { VEHICLES, INITIAL_NOTIFICATIONS } from "@/constants/data";
import { LIGHT_THEME, DARK_THEME, FONT_FACE } from "@/constants/tokens";

export default function App() {
  const [authenticated, setAuthenticated]       = useState(false);
  const [currentUser, setCurrentUser]           = useState({ name: "Ahmad Salman", email: "" });
  const [page, setPage]                         = useState("dashboard");
  const [selectedVehicleId, setSelectedVehicleId] = useState(VEHICLES[0].id);
  const [notifications, setNotifications]       = useState(INITIAL_NOTIFICATIONS);
  const [mobileOpen, setMobileOpen]             = useState(false);
  const [isDark, setIsDark]                     = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  /* Apply theme CSS variables to <html> whenever isDark changes */
  useEffect(() => {
    const tokens = isDark ? DARK_THEME : LIGHT_THEME;
    const root   = document.documentElement;
    Object.entries(tokens).forEach(([key, value]) => {
      root.style.setProperty(`--wp-${key}`, value);
    });
    root.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const logout = () => {
    setAuthenticated(false);
    setPage("dashboard");
    setMobileOpen(false);
  };

  const ctx = {
    currentUser,
    page,
    setPage,
    vehicles: VEHICLES,           /* swap with API data here */
    selectedVehicleId,
    setSelectedVehicleId,
    notifications,
    setNotifications,
    unreadCount,
    logout,
    mobileOpen,
    setMobileOpen,
    isDark,
    setIsDark,
  };

  return (
    <>
      <style>{FONT_FACE}</style>
      {!authenticated ? (
        <AuthScreen
          onAuthenticated={(user) => {
            setCurrentUser(user);
            setAuthenticated(true);
          }}
        />
      ) : (
        <AppContext.Provider value={ctx}>
          <AppShell />
        </AppContext.Provider>
      )}
    </>
  );
}
