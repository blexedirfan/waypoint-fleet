import { C } from "@/constants/tokens";

export function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative h-6 w-11 rounded-full transition-colors shrink-0"
      style={{ backgroundColor: checked ? C.amber : C.slateSoft }}
    >
      <span
        className="absolute top-0.5 left-0 h-5 w-5 rounded-full bg-white shadow transition-transform"
        style={{ transform: checked ? "translateX(22px)" : "translateX(2px)" }}
      />
    </button>
  );
}
