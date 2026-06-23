import { CheckCircle2, Wrench, PauseCircle } from "lucide-react";
import { C } from "@/constants/tokens";

const STATUS_STYLE = {
  Active:      { fg: C.emerald,   bg: C.emeraldSoft,   icon: CheckCircle2 },
  Maintenance: { fg: C.amberWarn, bg: C.amberWarnSoft, icon: Wrench       },
  Inactive:    { fg: C.muted,     bg: C.slateSoft,     icon: PauseCircle  },
};

const BADGE_GLOW = {
  Active:      "wp-badge-active",
  Maintenance: "wp-badge-warn",
  Inactive:    "wp-badge-muted",
};

export function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.Inactive;
  const Icon = s.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold wp-body ${BADGE_GLOW[status] || ""}`}
      style={{
        color: s.fg,
        backgroundColor: s.bg,
        transition: "box-shadow 0.2s ease",
      }}
    >
      <Icon size={13} strokeWidth={2.5} />
      {status}
    </span>
  );
}
