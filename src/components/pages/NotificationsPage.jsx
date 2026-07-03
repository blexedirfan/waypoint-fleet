import { Bell } from "lucide-react";
import { C } from "@/constants/tokens";
import { useApp } from "@/context/AppContext";
import { useStagger } from "@/hooks/useStagger";
import { formatRelativeTime } from "@/lib/relativeTime";
import { TopBarSlot } from "@/components/layout/TopBarSlot";
import { SignalDot } from "@/components/ui/SignalDot";
import { EmptyState } from "@/components/ui/EmptyState";

const TONE_COLOR = {
  warn:  { fg: C.amberWarn, bg: C.amberWarnSoft },
  good:  { fg: C.emerald,   bg: C.emeraldSoft   },
  muted: { fg: C.muted,     bg: C.slateSoft     },
};

export function NotificationsPage() {
  const { notifications, toggleRead, markAllRead } = useApp();

  const delays = useStagger(notifications.length, 50);

  return (
    <div>
      <TopBarSlot title="Notifications" subtitle="Fleet activity and reminders">
        <button
          onClick={markAllRead}
          className="text-sm font-medium rounded-xl border bg-white px-3.5 py-2"
          style={{ borderColor: C.line, color: C.text }}
        >
          Mark all as read
        </button>
      </TopBarSlot>

      {notifications.length === 0 ? (
        <EmptyState message="No notifications yet — activity on your fleet will show up here." />
      ) : (
      <div className="space-y-3">
        {notifications.map((n, i) => {
          const tone = TONE_COLOR[n.tone] || TONE_COLOR.muted;
          return (
            <button
              key={n.id}
              onClick={() => toggleRead(n.id)}
              className="w-full text-left flex items-start gap-4 rounded-2xl border bg-white p-4 sm:p-5 wp-anim-up"
              style={{
                borderColor: C.line,
                opacity: n.read ? 0.6 : 1,
                animationDelay: `${delays[i]}ms`,
              }}
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full shrink-0"
                style={{ backgroundColor: tone.bg, color: tone.fg }}
              >
                <Bell size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold" style={{ color: C.text }}>{n.title}</p>
                  <span className="text-xs shrink-0" style={{ color: C.muted }}>{formatRelativeTime(n.time)}</span>
                </div>
                <p className="text-sm mt-0.5" style={{ color: C.muted }}>{n.desc}</p>
              </div>
              {!n.read && <SignalDot color={C.amber} size={8} />}
            </button>
          );
        })}
      </div>
      )}
    </div>
  );
}
