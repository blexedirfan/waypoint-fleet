import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Calendar,
  Building2,
  Tag,
  Activity,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  Bell,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Filter as FilterIcon,
} from "lucide-react";
import { C } from "@/constants/tokens";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/useToast";
import { TopBarSlot } from "@/components/layout/TopBarSlot";
import { InputIcon } from "@/components/ui/InputIcon";
import { Field } from "@/components/ui/Field";
import { MiniStat } from "@/components/ui/MiniStat";
import { EmptyState } from "@/components/ui/EmptyState";
import { AlarmDetailsPanel } from "@/components/alarms/AlarmDetailsPanel";
import { formatAlarmDateTime, toDateInputValue } from "@/lib/alarmFormat";

const ALL_FLEETS = "All Fleets";
const ALL_TYPES = "All Types";

const COLUMNS = [
  "Device Name (ID)", "Driver Name", "Alarm Type", "Fleet", "Alarm Status",
  "Begin Time", "Start Position", "Start Speed", "Reporting Time",
  "Process User", "Process Time", "Process Driver", "Remark", "Action",
];

const STATUS_TONE = {
  Pending:      { fg: C.amberWarn, bg: C.amberWarnSoft },
  Acknowledged: { fg: C.emerald,   bg: C.emeraldSoft   },
};

const selectClass = "w-full bg-transparent outline-none text-sm wp-body";

export function AlarmDashboardPage() {
  const { alarms, acknowledgeAlarm, savingAlarm, refetchAlarms } = useApp();
  const [toast, showToast] = useToast();

  const [query, setQuery] = useState("");
  const [fleetFilter, setFleetFilter] = useState(ALL_FLEETS);
  const [typeFilter, setTypeFilter] = useState(ALL_TYPES);
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fleets = useMemo(() => [ALL_FLEETS, ...new Set(alarms.map((a) => a.fleet).filter(Boolean))], [alarms]);
  const types = useMemo(() => [ALL_TYPES, ...new Set(alarms.map((a) => a.alarmType).filter(Boolean))], [alarms]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return alarms.filter((a) => {
      const matchesQuery = !q || [a.deviceId, a.driverName, a.alarmType].some((v) => (v || "").toLowerCase().includes(q));
      const matchesFleet = fleetFilter === ALL_FLEETS || a.fleet === fleetFilter;
      const matchesType = typeFilter === ALL_TYPES || a.alarmType === typeFilter;
      const matchesStatus = statusFilter === "All" || a.status === statusFilter;
      const matchesDate = !dateFilter || toDateInputValue(a.beginTime) === dateFilter;
      return matchesQuery && matchesFleet && matchesType && matchesStatus && matchesDate;
    });
  }, [alarms, query, fleetFilter, typeFilter, statusFilter, dateFilter]);

  useEffect(() => { setPage(1); }, [query, fleetFilter, typeFilter, statusFilter, dateFilter]);

  // Default to the most recent pending alert, same as the screenshot —
  // once the previously-selected row falls out of the current data (e.g.
  // it was just acknowledged and no longer exists after a refetch), pick
  // a sensible new default instead of leaving the panel pointed at nothing.
  useEffect(() => {
    if (alarms.length === 0) return;
    if (alarms.some((a) => a.id === selectedId)) return;
    const firstPending = alarms.find((a) => a.status === "Pending");
    setSelectedId((firstPending || alarms[0]).id);
  }, [alarms, selectedId]);

  const selected = alarms.find((a) => a.id === selectedId) || null;

  const pendingCount = filtered.filter((a) => a.status === "Pending").length;
  const acknowledgedCount = filtered.filter((a) => a.status === "Acknowledged").length;
  const criticalType = (filtered.find((a) => a.status === "Pending") || filtered[0])?.alarmType || "—";

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageClamped = Math.min(page, totalPages);
  const paged = filtered.slice((pageClamped - 1) * pageSize, pageClamped * pageSize);

  const clearAll = () => {
    setQuery("");
    setFleetFilter(ALL_FLEETS);
    setTypeFilter(ALL_TYPES);
    setStatusFilter("All");
    setDateFilter("");
  };

  const handleAcknowledge = async (memo) => {
    if (!selected) return;
    try {
      await acknowledgeAlarm(selected.id, { remark: memo || "Correct alarm", processMemo: memo });
      showToast("Alarm acknowledged");
    } catch (e) {
      showToast(e.message || "Could not acknowledge alarm");
    }
  };

  const handleExport = () => {
    const rows = filtered.map((a) => [
      a.deviceId, a.driverName || "-", a.alarmType, a.fleet, a.alarmStatus,
      formatAlarmDateTime(a.beginTime), a.startPosition, a.startSpeed, formatAlarmDateTime(a.reportingTime),
      a.status, a.processUser || "-", a.processTime ? formatAlarmDateTime(a.processTime) : "-",
      a.processDriver || "-", a.status === "Pending" ? "Pending" : (a.remark || "-"),
    ]);
    const csv = [COLUMNS.slice(0, -1), ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `alarms-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <TopBarSlot title="Alarm Dashboard" subtitle="Alarm records imported from Howen VSS">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white wp-btn-primary"
        >
          <Download size={15} /> Export
        </button>
      </TopBarSlot>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1">
          <InputIcon icon={Search}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by device ID, driver, alarm type…"
              className="w-full bg-transparent outline-none text-sm wp-body"
            />
          </InputIcon>
        </div>
        <div className="w-full sm:w-48">
          <InputIcon icon={Calendar}>
            <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className={selectClass} style={{ color: C.text }} />
          </InputIcon>
        </div>
        <div className="w-full sm:w-44">
          <InputIcon icon={Building2}>
            <select value={fleetFilter} onChange={(e) => setFleetFilter(e.target.value)} className={selectClass} style={{ color: C.text }}>
              {fleets.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </InputIcon>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <MiniStat icon={Bell} label="Total Alerts" value={filtered.length} tint={{ fg: C.indigo, soft: C.indigoSoft }} />
        <MiniStat icon={Clock} label="Pending" value={pendingCount} tint={{ fg: C.amberWarn, soft: C.amberWarnSoft }} />
        <MiniStat icon={CheckCircle2} label="Acknowledged / Processed" value={acknowledgedCount} tint={{ fg: C.emerald, soft: C.emeraldSoft }} />
        <MiniStat icon={AlertTriangle} label="Critical Type" value={criticalType} tint={{ fg: C.rose, soft: C.roseSoft }} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[220px_1fr] gap-5 items-start">
        <div className="rounded-2xl border bg-white p-4 wp-anim-up" style={{ borderColor: C.line }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: C.text }}>
              <FilterIcon size={14} /> Filters
            </p>
            <button onClick={clearAll} className="text-xs font-medium" style={{ color: C.amber }}>
              Clear All
            </button>
          </div>
          <div className="space-y-3">
            <Field label="Fleet">
              <InputIcon icon={Building2}>
                <select value={fleetFilter} onChange={(e) => setFleetFilter(e.target.value)} className={selectClass} style={{ color: C.text }}>
                  {fleets.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </InputIcon>
            </Field>
            <Field label="Alarm Type">
              <InputIcon icon={Tag}>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={selectClass} style={{ color: C.text }}>
                  {types.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </InputIcon>
            </Field>
            <Field label="Status">
              <InputIcon icon={Activity}>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass} style={{ color: C.text }}>
                  <option value="All">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Acknowledged">Acknowledged</option>
                </select>
              </InputIcon>
            </Field>
            <Field label="Date">
              <InputIcon icon={Calendar}>
                <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className={selectClass} style={{ color: C.text }} />
              </InputIcon>
            </Field>
          </div>
        </div>

        <div className="grid grid-cols-1 2xl:grid-cols-[1fr_360px] gap-5 items-start">
          <div className="rounded-2xl border bg-white overflow-hidden wp-anim-up" style={{ borderColor: C.line }}>
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b flex-wrap" style={{ borderColor: C.line }}>
              <p className="text-sm font-semibold" style={{ color: C.text }}>Alerts ({filtered.length})</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={refetchAlarms}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border wp-btn-ghost"
                  style={{ borderColor: C.line, color: C.muted }}
                  aria-label="Refresh"
                >
                  <RefreshCw size={14} />
                </button>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="text-xs rounded-lg border px-2 py-1.5 outline-none"
                  style={{ borderColor: C.line, color: C.text }}
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="p-6"><EmptyState message="No alerts match these filters." /></div>
            ) : (
              <div className="overflow-x-auto wp-scrollbar">
                <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.line}` }}>
                      {COLUMNS.map((c) => (
                        <th key={c} className="text-left font-semibold px-4 py-3 whitespace-nowrap" style={{ color: C.muted, fontSize: 12 }}>
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((a) => {
                      const isSelected = a.id === selectedId;
                      const tone = STATUS_TONE[a.status] || STATUS_TONE.Pending;
                      return (
                        <tr
                          key={a.id}
                          onClick={() => setSelectedId(a.id)}
                          className="cursor-pointer wp-row-hover"
                          style={{
                            borderBottom: `1px solid ${C.line}`,
                            borderLeft: `3px solid ${isSelected ? C.amber : "transparent"}`,
                            backgroundColor: isSelected ? C.amberSoft : "transparent",
                          }}
                        >
                          <td className="px-4 py-3 whitespace-nowrap wp-mono text-xs" style={{ color: C.text }}>{a.deviceId}</td>
                          <td className="px-4 py-3 whitespace-nowrap" style={{ color: C.text }}>{a.driverName || "-"}</td>
                          <td className="px-4 py-3 whitespace-nowrap" style={{ color: C.text }}>{a.alarmType}</td>
                          <td className="px-4 py-3 whitespace-nowrap" style={{ color: C.text }}>{a.fleet}</td>
                          <td className="px-4 py-3 whitespace-nowrap" style={{ color: C.muted }}>{a.alarmStatus}</td>
                          <td className="px-4 py-3 whitespace-nowrap" style={{ color: C.text }}>{formatAlarmDateTime(a.beginTime)}</td>
                          <td className="px-4 py-3 whitespace-nowrap wp-mono text-xs" style={{ color: C.muted }}>{a.startPosition}</td>
                          <td className="px-4 py-3 whitespace-nowrap" style={{ color: C.text }}>{a.startSpeed}</td>
                          <td className="px-4 py-3 whitespace-nowrap" style={{ color: C.text }}>{formatAlarmDateTime(a.reportingTime)}</td>
                          <td className="px-4 py-3 whitespace-nowrap" style={{ color: C.text }}>{a.processUser || "-"}</td>
                          <td className="px-4 py-3 whitespace-nowrap" style={{ color: C.text }}>{a.processTime ? formatAlarmDateTime(a.processTime) : "-"}</td>
                          <td className="px-4 py-3 whitespace-nowrap" style={{ color: C.text }}>{a.processDriver || "-"}</td>
                          <td className="px-4 py-3 whitespace-nowrap" style={{ color: C.text }}>{a.status === "Pending" ? "Pending" : (a.remark || "-")}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
                                style={{ color: tone.fg, backgroundColor: tone.bg }}
                              >
                                {a.status}
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedId(a.id); }}
                                className="text-xs font-semibold rounded-lg px-2.5 py-1.5 border wp-btn-ghost whitespace-nowrap"
                                style={{ borderColor: C.line, color: C.text }}
                              >
                                {a.status === "Pending" ? "Acknowledge" : "View"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {filtered.length > 0 && (
              <div className="flex items-center justify-between px-5 py-3 border-t text-xs flex-wrap gap-2" style={{ borderColor: C.line, color: C.muted }}>
                <span>
                  Showing {(pageClamped - 1) * pageSize + 1} to {Math.min(pageClamped * pageSize, filtered.length)} of {filtered.length} entries
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={pageClamped <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border disabled:opacity-40 wp-btn-ghost"
                    style={{ borderColor: C.line }}
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <span className="px-2 font-semibold" style={{ color: C.text }}>{pageClamped}</span>
                  <button
                    disabled={pageClamped >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border disabled:opacity-40 wp-btn-ghost"
                    style={{ borderColor: C.line }}
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {selected && (
            <AlarmDetailsPanel
              alarm={selected}
              onClose={() => setSelectedId(null)}
              onAcknowledge={handleAcknowledge}
              saving={savingAlarm}
            />
          )}
        </div>
      </div>

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg wp-anim-up"
          style={{ backgroundColor: C.ink }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
