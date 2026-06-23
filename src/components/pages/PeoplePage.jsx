import { useMemo } from "react";
import { Building2, Mail, Phone, Car } from "lucide-react";
import { C } from "@/constants/tokens";
import { useApp } from "@/context/AppContext";
import { useStagger } from "@/hooks/useStagger";
import { TopBarSlot } from "@/components/layout/TopBarSlot";
import { Avatar } from "@/components/ui/Avatar";

export function PeoplePage() {
  const { vehicles, setSelectedVehicleId, setPage } = useApp();

  const people = useMemo(() => {
    const map = new Map();
    vehicles.forEach((v) => {
      if (!map.has(v.person.employeeId)) {
        map.set(v.person.employeeId, { ...v.person, vehicle: v });
      }
    });
    return Array.from(map.values());
  }, [vehicles]);

  const delays = useStagger(people.length, 60);

  return (
    <div>
      <TopBarSlot title="People" subtitle={`${people.length} people currently assigned a vehicle`} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {people.map((p, i) => (
          <button
            key={p.employeeId}
            onClick={() => { setSelectedVehicleId(p.vehicle.id); setPage("dashboard"); }}
            className="text-left rounded-2xl border bg-white p-5 wp-card-hover wp-anim-up"
            style={{ borderColor: C.line, animationDelay: `${delays[i]}ms` }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Avatar name={p.name} hue={p.hue} size={48} />
              <div className="min-w-0">
                <p className="wp-display font-semibold text-sm truncate" style={{ color: C.text }}>{p.name}</p>
                <p className="text-xs truncate" style={{ color: C.teal }}>{p.title}</p>
              </div>
            </div>
            <div className="space-y-2 text-xs" style={{ color: C.muted }}>
              <p className="flex items-center gap-2"><Building2 size={13} /> {p.department} · {p.office}</p>
              <p className="flex items-center gap-2 wp-mono truncate"><Mail size={13} /> {p.email}</p>
              <p className="flex items-center gap-2 wp-mono"><Phone size={13} /> {p.contact}</p>
              <p className="flex items-center gap-2"><Car size={13} /> {p.vehicle.assetNo}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
