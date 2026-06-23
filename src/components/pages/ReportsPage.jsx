import { useMemo } from "react";
import { Car, CheckCircle2, Wrench, PauseCircle, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { C } from "@/constants/tokens";
import { useApp } from "@/context/AppContext";
import { TopBarSlot } from "@/components/layout/TopBarSlot";
import { CountUp } from "@/components/ui/CountUp";

export function ReportsPage() {
  const { vehicles } = useApp();

  const byDept = useMemo(() => {
    const map = {};
    vehicles.forEach((v) => { map[v.department] = (map[v.department] || 0) + 1; });
    return Object.entries(map).map(([department, count]) => ({ department, count }));
  }, [vehicles]);

  const active      = vehicles.filter((v) => v.status === "Active").length;
  const maintenance = vehicles.filter((v) => v.status === "Maintenance").length;
  const inactive    = vehicles.filter((v) => v.status === "Inactive").length;

  const tiles = [
    { label: "Total Vehicles",  value: vehicles.length, icon: Car,         tint: { fg: C.indigo,    soft: C.indigoSoft   } },
    { label: "Active",          value: active,          icon: CheckCircle2, tint: { fg: C.emerald,   soft: C.emeraldSoft  } },
    { label: "In Maintenance",  value: maintenance,     icon: Wrench,       tint: { fg: C.amberWarn, soft: C.amberWarnSoft} },
    { label: "Inactive",        value: inactive,        icon: PauseCircle,  tint: { fg: C.muted,     soft: C.slateSoft    } },
  ];

  const palette = [C.amber, C.teal, C.indigo, C.emerald, C.rose];

  return (
    <div>
      <TopBarSlot title="Reports" subtitle="Fleet composition and allocation breakdown" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl border bg-white p-4 wp-anim-up" style={{ borderColor: C.line }}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl mb-3" style={{ backgroundColor: t.tint.soft, color: t.tint.fg }}>
              <t.icon size={17} />
            </div>
            <p className="wp-display text-2xl font-semibold" style={{ color: C.text }}>
              <CountUp to={t.value} />
            </p>
            <p className="text-xs" style={{ color: C.muted }}>{t.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-white p-5 sm:p-6 wp-anim-up" style={{ borderColor: C.line }}>
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs font-bold tracking-wide" style={{ color: C.amberDeep }}>
            ALLOCATIONS BY DEPARTMENT
          </p>
          <span className="flex items-center gap-1.5 text-xs" style={{ color: C.muted }}>
            <TrendingUp size={13} /> Updated just now
          </span>
        </div>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={byDept} barSize={42}>
              <CartesianGrid vertical={false} stroke={C.line} />
              <XAxis dataKey="department" tick={{ fontSize: 12, fill: C.muted }} axisLine={{ stroke: C.line }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: C.muted }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: C.paper }} contentStyle={{ borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 13 }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {byDept.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
