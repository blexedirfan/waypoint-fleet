import { useState, useEffect } from "react";
import { X, ShieldCheck, ShieldAlert } from "lucide-react";
import { C } from "@/constants/tokens";
import { DriverSnapshot } from "@/components/ui/DriverSnapshot";
import { formatAlarmDateTime } from "@/lib/alarmFormat";

const STATUS_TONE = {
  Pending:      { fg: C.amberWarn, bg: C.amberWarnSoft, Icon: ShieldAlert },
  Acknowledged: { fg: C.emerald,   bg: C.emeraldSoft,    Icon: ShieldCheck },
};

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
      <span style={{ color: C.muted }}>{label}</span>
      <span className="text-right break-all" style={{ color: C.text }}>{value || "-"}</span>
    </div>
  );
}

export function AlarmDetailsPanel({ alarm, onClose, onAcknowledge, saving }) {
  const [memo, setMemo] = useState(alarm.processMemo || "");

  useEffect(() => {
    setMemo(alarm.processMemo || "");
  }, [alarm.id]);

  const tone = STATUS_TONE[alarm.status] || STATUS_TONE.Pending;
  const isPending = alarm.status === "Pending";

  return (
    <div className="rounded-2xl border bg-white flex flex-col wp-anim-up" style={{ borderColor: C.line }}>
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b" style={{ borderColor: C.line }}>
        <div className="flex items-center gap-2.5">
          <h3 className="wp-display text-base font-semibold" style={{ color: C.text }}>Alarm Details</h3>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={{ color: tone.fg, backgroundColor: tone.bg }}
          >
            <tone.Icon size={12} /> {alarm.status}
          </span>
        </div>
        <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg wp-btn-ghost" style={{ color: C.muted }}>
          <X size={15} />
        </button>
      </div>

      <div className="px-5 py-4 overflow-y-auto wp-scrollbar" style={{ maxHeight: 560 }}>
        <p className="text-xs mb-0.5" style={{ color: C.muted }}>Device</p>
        <p className="text-sm font-medium mb-3 break-all wp-mono" style={{ color: C.text }}>{alarm.deviceId}</p>

        <p className="text-xs mb-0.5" style={{ color: C.muted }}>Alarm Type</p>
        <p className="text-sm font-bold mb-4" style={{ color: C.rose }}>{alarm.alarmType}</p>

        <p className="text-xs font-semibold mb-2" style={{ color: C.text }}>Driver Snapshot</p>
        <DriverSnapshot time={formatAlarmDateTime(alarm.beginTime)} speed={alarm.startSpeed} />

        <p className="text-xs font-semibold mt-5 mb-1" style={{ color: C.text }}>Additional Information</p>
        <div className="divide-y" style={{ borderColor: C.line }}>
          <InfoRow label="Geofence Name" value={alarm.geofenceName} />
          <InfoRow label="End Time" value={formatAlarmDateTime(alarm.endTime)} />
          <InfoRow label="End Position" value={alarm.endPosition} />
          <InfoRow label="End Speed" value={alarm.endSpeed} />
          <InfoRow label="Re-upload" value={alarm.reUpload} />
          <InfoRow label="Start Details" value={alarm.startDetails} />
          <InfoRow label="End Details" value={alarm.endDetails} />
          <InfoRow label="Alarm Duration" value={alarm.alarmDuration} />
        </div>

        <p className="text-xs font-semibold mt-5 mb-1.5" style={{ color: C.text }}>Process Memo</p>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value.slice(0, 1000))}
          disabled={!isPending}
          placeholder="Enter process memo…"
          rows={3}
          className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none resize-none wp-input-glow disabled:opacity-60"
          style={{ borderColor: C.line, color: C.text, backgroundColor: isPending ? "transparent" : C.paper }}
        />
        <p className="text-xs text-right mt-1" style={{ color: C.muted }}>{memo.length} / 1000</p>
      </div>

      <div className="px-5 py-4 border-t shrink-0" style={{ borderColor: C.line }}>
        {isPending ? (
          <button
            onClick={() => onAcknowledge(memo)}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white wp-btn-primary disabled:opacity-60"
          >
            <ShieldCheck size={15} /> {saving ? "Confirming…" : "Confirm Acknowledge"}
          </button>
        ) : (
          <div
            className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
            style={{ color: C.emerald, backgroundColor: C.emeraldSoft }}
          >
            <ShieldCheck size={15} /> Acknowledged by {alarm.processUser || "—"}
          </div>
        )}
      </div>
    </div>
  );
}
