import { Bell, Menu, ChevronDown } from "lucide-react";
import { C } from "@/constants/tokens";
import { useApp } from "@/context/AppContext";
import { Avatar } from "@/components/ui/Avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function TopBarSlot({ title, subtitle, children }) {
  const { setPage, currentUser, unreadCount, setMobileOpen, isDark, setIsDark } = useApp();

  return (
    <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
      <div className="flex items-center gap-3 min-w-0">
        <button
          className="lg:hidden shrink-0 flex h-9 w-9 items-center justify-center rounded-lg border"
          style={{ borderColor: C.line }}
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={17} />
        </button>
        <div className="min-w-0">
          <h1
            className="wp-display text-xl sm:text-2xl font-semibold truncate"
            style={{ color: C.text }}
          >
            {title}
          </h1>
          <p className="text-sm truncate" style={{ color: C.muted }}>
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {children}

        <ThemeToggle isDark={isDark} onToggle={() => setIsDark((v) => !v)} />

        <button
          onClick={() => setPage("notifications")}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border bg-white wp-btn-ghost"
          style={{ borderColor: C.line }}
        >
          <Bell size={17} style={{ color: C.muted }} />
          {unreadCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full"
              style={{ backgroundColor: C.rose, boxShadow: `0 0 6px ${C.rose}` }}
            />
          )}
        </button>

        <button
          onClick={() => setPage("settings")}
          className="hidden sm:flex items-center gap-2 rounded-xl border bg-white pl-2 pr-3 py-1.5 wp-btn-ghost"
          style={{ borderColor: C.line }}
        >
          <Avatar name={currentUser.name} size={28} hue={222} />
          <span className="text-sm font-medium" style={{ color: C.text }}>
            {currentUser.name}
          </span>
          <ChevronDown size={13} style={{ color: C.muted }} />
        </button>
      </div>
    </div>
  );
}
