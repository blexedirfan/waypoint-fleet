import { C } from "@/constants/tokens";

export function SignalDot({ color = C.emerald, size = 9 }) {
  return (
    <span
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <span
        className="absolute inline-flex rounded-full"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          animation: "wpPulseRing 1.8s cubic-bezier(0,0,0.2,1) infinite",
        }}
      />
      <span
        className="relative inline-flex rounded-full"
        style={{ width: size, height: size, backgroundColor: color }}
      />
    </span>
  );
}
