import { C } from "@/constants/tokens";
import { useApp } from "@/context/AppContext";
import { TopBarSlot } from "@/components/layout/TopBarSlot";
import { StatusBadge } from "@/components/ui/StatusBadge";

const HEADERS = ["Asset No.", "Vehicle", "Owner", "Assigned To", "Department", "Allocated On", "Status"];

export function AllocationsPage() {
  const { vehicles, setSelectedVehicleId, setPage } = useApp();

  return (
    <div>
      <TopBarSlot title="Allocations" subtitle="Every vehicle, its assigned person, and department" />

      <div className="rounded-2xl border bg-white overflow-hidden wp-anim-up" style={{ borderColor: C.line }}>
        <div className="overflow-x-auto wp-scrollbar">
          <table className="w-full text-sm" style={{ minWidth: "720px" }}>
            <thead>
              <tr className="border-b text-left" style={{ borderColor: C.line, color: C.muted }}>
                {HEADERS.map((h) => (
                  <th key={h} className="px-5 py-3 font-medium text-xs uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => { setSelectedVehicleId(v.id); setPage("dashboard"); }}
                  className="border-b last:border-b-0 cursor-pointer wp-row-hover transition-colors"
                  style={{ borderColor: C.line }}
                >
                  <td className="px-5 py-3.5 wp-mono font-medium" style={{ color: C.text }}>{v.assetNo}</td>
                  <td className="px-5 py-3.5" style={{ color: C.text }}>{v.model}</td>
                  <td className="px-5 py-3.5" style={{ color: C.muted }}>{v.owner}</td>
                  <td className="px-5 py-3.5" style={{ color: C.muted }}>{v.assignedTo}</td>
                  <td className="px-5 py-3.5" style={{ color: C.muted }}>{v.department}</td>
                  <td className="px-5 py-3.5" style={{ color: C.muted }}>{v.allocatedOn}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={v.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
