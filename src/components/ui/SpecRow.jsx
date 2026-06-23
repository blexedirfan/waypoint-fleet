import { C } from "@/constants/tokens";

export function SpecRow({ icon: Icon, label, value, mono }) {
  return (
    <div
      className="flex items-center justify-between py-3 border-b last:border-b-0"
      style={{ borderColor: C.line }}
    >
      <div className="flex items-center gap-2.5" style={{ color: C.muted }}>
        <Icon size={16} strokeWidth={2} />
        <span className="wp-body text-sm">{label}</span>
      </div>
      <span
        className={`text-sm font-semibold ${mono ? "wp-mono" : "wp-body"}`}
        style={{ color: C.text }}
      >
        {value}
      </span>
    </div>
  );
}
