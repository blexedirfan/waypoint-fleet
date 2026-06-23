import { useState, useMemo } from "react";
import { Search, UserCircle2, Building2 } from "lucide-react";
import { C } from "@/constants/tokens";
import { useApp } from "@/context/AppContext";
import { useStagger } from "@/hooks/useStagger";
import { TopBarSlot } from "@/components/layout/TopBarSlot";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { VehicleIllustration } from "@/components/ui/VehicleIllustration";
import { EmptyState } from "@/components/ui/EmptyState";

export function VehiclesPage() {
  const { vehicles, setSelectedVehicleId, setPage } = useApp();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = useMemo(
    () =>
      vehicles.filter((v) => {
        const q = query.toLowerCase();
        const matchesQuery =
          v.model.toLowerCase().includes(q) ||
          v.assetNo.toLowerCase().includes(q) ||
          v.owner.toLowerCase().includes(q);
        return matchesQuery && (filter === "All" || v.status === filter);
      }),
    [vehicles, query, filter]
  );

  const delays = useStagger(filtered.length, 50);

  return (
    <div>
      <TopBarSlot title="Vehicles" subtitle={`${vehicles.length} vehicles across all departments`} />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div
          className="flex items-center gap-2.5 rounded-xl border bg-white px-3.5 py-2.5 flex-1 wp-input-glow"
          style={{ borderColor: C.line }}
        >
          <Search size={16} style={{ color: C.muted }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by model, owner, or asset no."
            className="w-full bg-transparent outline-none text-sm wp-body"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto wp-scrollbar">
          {["All", "Active", "Maintenance", "Inactive"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-xl px-3.5 py-2.5 text-sm font-medium border transition-all duration-200 ${
                filter === f ? "wp-btn-primary" : "wp-btn-ghost"
              }`}
              style={{
                borderColor: filter === f ? "transparent" : C.line,
                backgroundColor: filter === f ? undefined : "#fff",
                color: filter === f ? "#fff" : C.text,
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No vehicles match that search." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((v, i) => {
            const tint = v.colorHex === "#23262E" ? C.amber : v.colorHex;
            return (
              <button
                key={v.id}
                onClick={() => { setSelectedVehicleId(v.id); setPage("dashboard"); }}
                className="text-left rounded-2xl border bg-white p-5 wp-card-hover wp-anim-up group"
                style={{ borderColor: C.line, animationDelay: `${delays[i]}ms` }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 24px 60px -12px ${tint}55, 0 0 0 1.5px ${tint}35`; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ""; }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="wp-display font-semibold text-base" style={{ color: C.text }}>{v.model}</p>
                    <p className="text-xs wp-mono" style={{ color: C.muted }}>{v.assetNo}</p>
                  </div>
                  <StatusBadge status={v.status} />
                </div>

                <div
                  className="rounded-xl flex items-center justify-center py-4 my-3 relative overflow-hidden"
                  style={{ background: `radial-gradient(ellipse at center, ${tint}18 0%, ${C.paper} 68%)` }}
                >
                  <VehicleIllustration type={v.type} colorHex={v.colorHex} size={120} />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5" style={{ color: C.muted }}>
                    <UserCircle2 size={14} /> {v.owner}
                  </span>
                  <span className="flex items-center gap-1.5" style={{ color: C.muted }}>
                    <Building2 size={14} /> {v.department}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
