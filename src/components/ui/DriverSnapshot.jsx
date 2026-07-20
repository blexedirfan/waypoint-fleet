import { UserRound, Video } from "lucide-react";

// Alarm records are imported from a third-party dashcam feed (Howen VSS) —
// we don't have real driver-facing camera stills, so this draws a
// self-contained placeholder "frame" (no external image URL) with the
// alarm's own timestamp/speed burned in like a real dashcam snapshot would.
export function DriverSnapshot({ time, speed }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-xl flex items-center justify-center"
      style={{
        aspectRatio: "16 / 10",
        background: "radial-gradient(ellipse at 50% 35%, #3A3F4B 0%, #14161C 75%)",
      }}
    >
      <UserRound size={64} strokeWidth={1.3} color="#5A6070" />

      <span
        className="absolute top-2 left-2 flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold text-white/85"
        style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      >
        <Video size={11} /> LIVE CAM
      </span>

      {(time || speed) && (
        <div
          className="absolute bottom-0 left-0 right-0 px-2.5 py-1.5 flex items-center justify-between text-[10px] font-medium text-white/80"
          style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.55), transparent)" }}
        >
          <span>{time || ""}</span>
          <span>{speed || ""}</span>
        </div>
      )}
    </div>
  );
}
