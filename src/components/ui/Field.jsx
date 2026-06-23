import { C } from "@/constants/tokens";

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium mb-1.5 block" style={{ color: C.muted }}>
        {label}
      </span>
      {children}
    </label>
  );
}
