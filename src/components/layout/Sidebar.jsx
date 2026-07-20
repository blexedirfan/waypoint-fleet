import {
  LayoutDashboard,
  ShieldAlert,
  Car,
  ClipboardList,
  Users,
  BarChart3,
  Bell,
  Settings as SettingsGear,
  MapPin,
  LogOut,
} from "lucide-react";
import { C } from "@/constants/tokens";
import { useApp } from "@/context/AppContext";

const NAV_ITEMS = [
  { key: "dashboard",     label: "Dashboard",     Icon: LayoutDashboard },
  { key: "alarms",        label: "Alarms",        Icon: ShieldAlert     },
  { key: "vehicles",      label: "Vehicles",      Icon: Car             },
  { key: "allocations",   label: "Allocations",   Icon: ClipboardList   },
  { key: "people",        label: "People",        Icon: Users           },
  { key: "reports",       label: "Reports",       Icon: BarChart3       },
  { key: "notifications", label: "Notifications", Icon: Bell            },
  { key: "settings",      label: "Settings",      Icon: SettingsGear    },
];

function SidebarBody({ setMobileOpen }) {
  const { page, setPage, logout, unreadCount } = useApp();

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: C.ink }}>
      <div
        className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% -10%, rgba(242,153,74,0.12) 0%, transparent 65%)",
        }}
      />

      <div className="relative flex items-center gap-2.5 px-6 py-6">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0 wp-btn-primary"
          style={{ boxShadow: "0 4px 16px rgba(242,153,74,0.45)" }}
        >
          <MapPin size={18} color="#fff" strokeWidth={2.4} />
        </div>
        <span className="wp-display text-lg font-semibold text-white tracking-tight">
          Waypoint
        </span>
      </div>

      <nav className="relative flex-1 px-3 space-y-0.5 mt-2">
        {NAV_ITEMS.map(({ key, label, Icon }) => {
          const active = page === key;
          return (
            <button
              key={key}
              onClick={() => {
                setPage(key);
                setMobileOpen(false);
              }}
              className="relative w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium wp-nav-hover"
              style={{
                color: active ? "#fff" : C.inkText,
                backgroundColor: active
                  ? "rgba(242,153,74,0.14)"
                  : "transparent",
                boxShadow: active
                  ? "inset 0 0 24px rgba(242,153,74,0.06), 0 0 0 1px rgba(242,153,74,0.14)"
                  : "none",
              }}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full"
                  style={{
                    backgroundColor: C.amber,
                    boxShadow: `0 0 10px ${C.amber}, 0 0 20px ${C.amber}88`,
                  }}
                />
              )}
              <span
                className="flex items-center justify-center h-7 w-7 rounded-lg shrink-0"
                style={{
                  backgroundColor: active ? `${C.amber}22` : "transparent",
                  transition: "background 0.18s ease",
                }}
              >
                <Icon
                  size={16}
                  strokeWidth={2}
                  style={{ color: active ? C.amber : "inherit" }}
                />
              </span>
              <span className="wp-body">{label}</span>
              {key === "notifications" && unreadCount > 0 && (
                <span
                  className="ml-auto font-bold rounded-full px-1.5 py-0.5"
                  style={{
                    backgroundColor: C.amber,
                    color: "#1A1206",
                    fontSize: "10px",
                    boxShadow: `0 0 8px ${C.amber}88`,
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="relative px-3 pb-6">
        <div
          className="h-px mb-4 mx-2"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)",
          }}
        />
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium wp-nav-hover"
          style={{ color: C.inkText }}
        >
          <span
            className="flex items-center justify-center h-7 w-7 rounded-lg"
            style={{ transition: "background 0.18s ease" }}
          >
            <LogOut size={16} strokeWidth={2} />
          </span>
          Logout
        </button>
      </div>
    </div>
  );
}

export function Sidebar({ mobileOpen, setMobileOpen }) {
  return (
    <>
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 wp-sidebar-shadow relative overflow-hidden">
        <SidebarBody setMobileOpen={setMobileOpen} />
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 h-full wp-anim-in">
            <SidebarBody setMobileOpen={setMobileOpen} />
          </div>
          <button
            className="flex-1 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
        </div>
      )}
    </>
  );
}
