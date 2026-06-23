import { C } from "@/constants/tokens";

export function MiniStat({ icon: Icon, label, value, tint }) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl border bg-white px-4 py-3"
      style={{ borderColor: C.line }}
    >
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
        style={{ backgroundColor: tint.soft, color: tint.fg }}
      >
        <Icon size={17} strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <p className="wp-body text-xs" style={{ color: C.muted }}>
          {label}
        </p>
        <p className="wp-display text-sm font-semibold truncate" style={{ color: C.text }}>
          {value}
        </p>
      </div>
    </div>
  );
}
