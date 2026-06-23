import { C } from "@/constants/tokens";

export function InputIcon({ icon: Icon, children }) {
  return (
    <div
      className="flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 wp-input-glow"
      style={{ borderColor: C.line, backgroundColor: C.card }}
    >
      <Icon size={16} style={{ color: C.muted }} />
      {children}
    </div>
  );
}
