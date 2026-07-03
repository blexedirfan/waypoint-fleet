import { useRef, useState, useMemo } from "react";
import {
  Car,
  Calendar,
  CalendarDays,
  Hash,
  Layers,
  Gauge,
  Palette,
  Fuel,
  Settings2,
  Armchair,
  Users,
  UserCircle2,
  Mail,
  Phone,
  Building2,
  FileText,
  ChevronRight,
  CheckCircle2,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { C } from "@/constants/tokens";
import { useApp } from "@/context/AppContext";
import { useStagger } from "@/hooks/useStagger";
import { useToast } from "@/hooks/useToast";
import { TopBarSlot } from "@/components/layout/TopBarSlot";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { VehicleIllustration } from "@/components/ui/VehicleIllustration";
import { Avatar } from "@/components/ui/Avatar";
import { MiniStat } from "@/components/ui/MiniStat";
import { SpecRow } from "@/components/ui/SpecRow";
import { CountUp } from "@/components/ui/CountUp";
import { Modal } from "@/components/ui/Modal";
import { VehicleForm } from "@/components/vehicles/VehicleForm";

function PersonRow({ icon: Icon, label, value, mono, accent }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5" style={{ color: C.muted }}>
        <Icon size={15} />
        <span className="text-sm">{label}</span>
      </div>
      <span
        className={`text-sm font-medium text-right truncate ${mono ? "wp-mono" : "wp-body"}`}
        style={{ color: accent ? C.teal : C.text, maxWidth: "60%" }}
      >
        {value}
      </span>
    </div>
  );
}

export function DashboardPage() {
  const {
    vehicles,
    selectedVehicleId,
    setSelectedVehicleId,
    setPage,
    isAdmin,
    permissions,
    updateVehicle,
    deleteVehicle,
  } = useApp();
  const vehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
  const bodyColor = vehicle.colorHex === "#23262E" ? C.amber : vehicle.colorHex;

  const [editOpen, setEditOpen] = useState(false);
  const [toast, showToast] = useToast();

  const canEditVehicle = isAdmin || permissions.membersCanEditVehicle;
  const canEditAssignment = isAdmin || permissions.membersCanEditAssignment;
  const canDelete = (isAdmin || permissions.membersCanDeleteVehicles) && vehicles.length > 1;

  const handleDelete = async () => {
    if (!confirm(`Delete ${vehicle.model} (${vehicle.assetNo})? This cannot be undone.`)) return;
    await deleteVehicle(vehicle.id);
    const remaining = vehicles.filter((v) => v.id !== vehicle.id);
    setSelectedVehicleId(remaining[0]?.id);
    setPage("vehicles");
  };

  const tiltRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const onCarMove = (e) => {
    if (!tiltRef.current) return;
    const r = tiltRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    setTilt({ x: y * -9, y: x * 14 });
  };
  const onCarLeave = () => setTilt({ x: 0, y: 0 });

  const activeCount = vehicles.filter((v) => v.status === "Active").length;
  const utilRate = Math.round((activeCount / vehicles.length) * 100);

  const statusData = useMemo(() => [
    { name: "Active",     value: vehicles.filter((v) => v.status === "Active").length,      color: C.emerald   },
    { name: "In Service", value: vehicles.filter((v) => v.status === "Maintenance").length,  color: C.amberWarn },
    { name: "Inactive",   value: vehicles.filter((v) => v.status === "Inactive").length,     color: "#B8BFCC"   },
  ], [vehicles]);

  const typeData = useMemo(() => {
    const map = {};
    vehicles.forEach((v) => { map[v.type] = (map[v.type] || 0) + 1; });
    const pal = [C.indigo, C.teal, C.amber, C.rose, C.emerald];
    return Object.entries(map).map(([name, value], i) => ({ name, value, color: pal[i % pal.length] }));
  }, [vehicles]);

  const deptData = useMemo(() => {
    const map = {};
    vehicles.forEach((v) => { map[v.department] = (map[v.department] || 0) + 1; });
    return Object.entries(map).map(([department, count]) => ({ department, count }));
  }, [vehicles]);

  const statCards = [
    { icon: UserCircle2, label: "Vehicle Owner",  value: vehicle.owner,              tint: { fg: C.indigo,    soft: C.indigoSoft   } },
    { icon: Users,       label: "Assigned To",    value: vehicle.assignedTo,         tint: { fg: C.emerald,   soft: C.emeraldSoft  } },
    { icon: CalendarDays,label: "Model Year",     value: String(vehicle.modelYear),  tint: { fg: "#8B5CF6",   soft: "#EEE7FD"      } },
    { icon: Car,         label: "Vehicle Type",   value: vehicle.type,               tint: { fg: C.amberDeep, soft: C.amberSoft    } },
    { icon: Hash,        label: "Asset No.",      value: vehicle.assetNo,            tint: { fg: C.teal,      soft: C.tealSoft     } },
  ];
  const delays = useStagger(statCards.length);

  const specs = [
    { icon: Car,         label: "Vehicle Type",            value: vehicle.type           },
    { icon: Layers,      label: "Model",                   value: vehicle.model          },
    { icon: CalendarDays,label: "Model Year",              value: vehicle.modelYear      },
    { icon: Hash,        label: "Registration / Asset No.", value: vehicle.assetNo, mono: true },
    { icon: Calendar,    label: "Month",                   value: vehicle.month          },
    { icon: Gauge,       label: "Engine / CC",             value: vehicle.engineCC       },
    { icon: Palette,     label: "Color",                   value: vehicle.color          },
    { icon: Fuel,        label: "Fuel Type",               value: vehicle.fuelType       },
    { icon: Settings2,   label: "Transmission",            value: vehicle.transmission   },
    { icon: Armchair,    label: "Seating Capacity",        value: vehicle.seating        },
  ];

  const timelineSteps = [
    { icon: UserCircle2, label: "Vehicle Owner", value: vehicle.owner          },
    { icon: Users,       label: "Assigned To",  value: vehicle.assignedTo     },
    { icon: Building2,   label: "Department",   value: vehicle.department     },
    { icon: CalendarDays,label: "Allocated On", value: vehicle.allocatedOn    },
    { icon: Hash,        label: "Allocation ID",value: vehicle.assetNo        },
  ];

  return (
    <div>
      <TopBarSlot title="Dashboard" subtitle="Vehicle allocation and fleet overview">
        <span
          className="hidden sm:flex items-center gap-2 rounded-xl border bg-white px-3.5 py-2 text-sm font-medium"
          style={{ borderColor: C.line, color: C.text }}
        >
          <CalendarDays size={15} style={{ color: C.muted }} />
          {vehicle.month}
        </span>
        <button
          onClick={() => setEditOpen(true)}
          title="Edit vehicle"
          className="flex h-9 w-9 items-center justify-center rounded-xl border bg-white wp-btn-ghost"
          style={{ borderColor: C.line, color: C.muted }}
        >
          <Pencil size={15} />
        </button>
        {canDelete && (
          <button
            onClick={handleDelete}
            title="Delete vehicle"
            className="flex h-9 w-9 items-center justify-center rounded-xl border bg-white wp-btn-ghost"
            style={{ borderColor: C.line, color: C.rose }}
          >
            <Trash2 size={15} />
          </button>
        )}
      </TopBarSlot>

      {/* ── HERO CARD ── */}
      <div
        className="relative rounded-3xl overflow-hidden mb-6 wp-anim-up"
        style={{
          background: "linear-gradient(140deg, #080E1C 0%, #101828 55%, #0A1220 100%)",
          border: "1px solid rgba(242,153,74,0.15)",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px -20px rgba(0,0,0,0.55), 0 0 60px -20px rgba(242,153,74,0.12)",
        }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.055 }} preserveAspectRatio="none">
          <pattern id="hgrid" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#fff" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#hgrid)" />
        </svg>

        <div className="absolute pointer-events-none" style={{ bottom: 0, left: "50%", transform: "translateX(-50%)", width: "70%", height: "85%", background: `radial-gradient(ellipse at center bottom, ${bodyColor}50 0%, transparent 66%)` }} />
        <div className="absolute pointer-events-none" style={{ top: 0, right: 0, width: "40%", height: "60%", background: `radial-gradient(ellipse at top right, ${bodyColor}18 0%, transparent 65%)` }} />

        <div className="relative flex flex-col md:flex-row items-center">
          {/* 3D tilt car */}
          <div
            ref={tiltRef}
            onMouseMove={onCarMove}
            onMouseLeave={onCarLeave}
            className="flex-1 flex items-center justify-center py-10 px-6"
            style={{ cursor: "crosshair" }}
          >
            <div
              style={{
                transform: `perspective(720px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition:
                  tilt.x === 0 && tilt.y === 0
                    ? "transform 0.65s cubic-bezier(0.16,1,0.3,1)"
                    : "transform 0.07s linear",
                willChange: "transform",
              }}
            >
              {vehicle.photo ? (
                <img src={vehicle.photo} alt={vehicle.model} style={{ width: 310, height: 310, objectFit: "cover", borderRadius: 24 }} />
              ) : (
                <VehicleIllustration type={vehicle.type} colorHex={vehicle.colorHex} size={310} />
              )}
            </div>
          </div>

          {/* Info panel */}
          <div className="md:w-72 shrink-0 px-6 pb-8 pt-2 md:pt-8 md:pr-10 text-center md:text-left">
            <div className="mb-4">
              <StatusBadge status={vehicle.status} />
            </div>
            <h2 className="wp-display text-3xl font-bold leading-tight mb-1 wp-shimmer-gold">
              {vehicle.model}
            </h2>
            {vehicle.nickname && (
              <p className="text-sm italic" style={{ color: C.amber }}>"{vehicle.nickname}"</p>
            )}
            <p className="text-sm font-medium mb-5" style={{ color: C.inkText }}>
              {vehicle.type} · {vehicle.modelYear}
            </p>

            <div className="space-y-3 mb-6">
              {[
                { icon: UserCircle2, value: vehicle.owner,      label: "Owner"       },
                { icon: Building2,   value: vehicle.department, label: "Department"  },
                { icon: Hash,        value: vehicle.assetNo,    label: "Asset No.", mono: true },
              ].map(({ icon: Icon, value, label, mono }) => (
                <div key={label} className="flex items-center justify-center md:justify-start gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0" style={{ background: `${C.amber}22`, border: `1px solid ${C.amber}30` }}>
                    <Icon size={13} style={{ color: C.amber }} />
                  </div>
                  <span className={`text-sm ${mono ? "wp-mono" : "wp-body"}`} style={{ color: C.inkText }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Fleet utilization bar */}
            <div className="mb-5 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs" style={{ color: C.inkText }}>Fleet Utilization</span>
                <span className="text-xs font-bold wp-mono" style={{ color: C.amber }}>{utilRate}%</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${utilRate}%`,
                    background: `linear-gradient(90deg, ${C.amber}, ${C.amberDeep})`,
                    boxShadow: `0 0 10px ${C.amber}88, 0 0 20px ${C.amber}44`,
                    transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)",
                  }}
                />
              </div>
              <p className="text-xs mt-1.5" style={{ color: C.inkText }}>
                {activeCount} of {vehicles.length} vehicles active
              </p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              {[vehicle.fuelType, vehicle.transmission, vehicle.seating, vehicle.color].map((tag) => (
                <span key={tag} className="text-xs font-medium rounded-full px-3 py-1" style={{ background: "rgba(255,255,255,0.07)", color: C.inkText, border: "1px solid rgba(255,255,255,0.1)" }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px" style={{ width: "60%", background: `linear-gradient(90deg, transparent, ${bodyColor}70, transparent)` }} />
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {statCards.map((s, i) => (
          <div
            key={s.label}
            className="wp-anim-up rounded-2xl border bg-white p-4 flex items-center gap-3 wp-card-hover group"
            style={{ borderColor: C.line, animationDelay: `${delays[i]}ms` }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 20px 50px -12px ${s.tint.fg}40, 0 0 0 1px ${s.tint.fg}28`; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ""; }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0 transition-all duration-200 group-hover:scale-110"
              style={{ backgroundColor: s.tint.soft, color: s.tint.fg, boxShadow: `0 4px 12px ${s.tint.fg}30` }}
            >
              <s.icon size={18} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <p className="text-xs" style={{ color: C.muted }}>{s.label}</p>
              <p className="wp-display text-sm font-semibold truncate" style={{ color: C.text }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        {/* Fleet Status Donut */}
        <div className="rounded-2xl border bg-white p-5 wp-anim-up wp-card-hover" style={{ borderColor: C.line, animationDelay: "80ms" }}>
          <p className="text-xs font-bold tracking-wide mb-0.5" style={{ color: C.amberDeep }}>FLEET STATUS</p>
          <p className="text-xs mb-3" style={{ color: C.muted }}>{vehicles.length} vehicles registered</p>
          <div className="relative" style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={46} outerRadius={68} paddingAngle={4} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="wp-display text-2xl font-bold" style={{ color: C.text }}>{vehicles.length}</span>
              <span className="text-xs" style={{ color: C.muted }}>Total</span>
            </div>
          </div>
          <div className="space-y-2.5 mt-3">
            {statusData.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: s.color, flexShrink: 0 }} />
                  <span className="text-xs wp-body" style={{ color: C.muted }}>{s.name}</span>
                </div>
                <span className="text-xs font-bold wp-mono" style={{ color: C.text }}><CountUp to={s.value} /></span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Allocation */}
        <div className="rounded-2xl border bg-white p-5 wp-anim-up wp-card-hover" style={{ borderColor: C.line, animationDelay: "140ms" }}>
          <p className="text-xs font-bold tracking-wide mb-0.5" style={{ color: C.amberDeep }}>BY DEPARTMENT</p>
          <p className="text-xs mb-3" style={{ color: C.muted }}>Vehicles per department</p>
          <div style={{ height: 210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} barSize={22} layout="vertical">
                <CartesianGrid horizontal={false} stroke={C.line} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="department" width={76} tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: C.paper }} contentStyle={{ borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 12 }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {deptData.map((_, i) => <Cell key={i} fill={[C.amber, C.teal, C.indigo, C.emerald, C.rose][i % 5]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Types Donut */}
        <div className="rounded-2xl border bg-white p-5 wp-anim-up wp-card-hover" style={{ borderColor: C.line, animationDelay: "200ms" }}>
          <p className="text-xs font-bold tracking-wide mb-0.5" style={{ color: C.amberDeep }}>VEHICLE TYPES</p>
          <p className="text-xs mb-3" style={{ color: C.muted }}>Fleet composition by type</p>
          <div className="relative" style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" innerRadius={46} outerRadius={68} paddingAngle={4} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                  {typeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2.5 mt-1">
            {typeData.map((t) => (
              <div key={t.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: t.color, flexShrink: 0 }} />
                  <span className="text-xs wp-body" style={{ color: C.muted }}>{t.name}</span>
                </div>
                <span className="text-xs font-bold wp-mono" style={{ color: C.text }}>{t.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── VEHICLE DETAILS + PERSON ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Specs card */}
        <div className="lg:col-span-2 rounded-2xl border bg-white p-5 sm:p-6 wp-anim-up" style={{ borderColor: C.line, animationDelay: "120ms" }}>
          <p className="text-xs font-bold tracking-wide mb-5" style={{ color: C.amberDeep }}>VEHICLE SPECIFICATIONS</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="rounded-2xl flex items-center justify-center py-8 mb-4 relative overflow-hidden" style={{ backgroundColor: C.paper }}>
                <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at center, ${bodyColor}22 0%, transparent 70%)` }} />
                {vehicle.photo ? (
                  <img src={vehicle.photo} alt={vehicle.model} style={{ width: 200, height: 200, objectFit: "cover", borderRadius: 16 }} />
                ) : (
                  <VehicleIllustration type={vehicle.type} colorHex={vehicle.colorHex} size={200} />
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MiniStat icon={Calendar}    label="Model Year" value={vehicle.modelYear} tint={{ fg: C.indigo,    soft: C.indigoSoft  }} />
                <MiniStat icon={Car}         label="Type"       value={vehicle.type}      tint={{ fg: C.amberDeep, soft: C.amberSoft    }} />
                <MiniStat icon={Layers}      label="Model"      value={vehicle.model}     tint={{ fg: C.teal,      soft: C.tealSoft     }} />
                <MiniStat icon={Hash}        label="Asset No."  value={vehicle.assetNo}   tint={{ fg: C.emerald,   soft: C.emeraldSoft  }} />
              </div>
            </div>
            <div>
              {specs.map((row) => <SpecRow key={row.label} {...row} />)}
              <div className="flex items-center justify-between pt-3">
                <div className="flex items-center gap-2.5" style={{ color: C.muted }}>
                  <CheckCircle2 size={16} />
                  <span className="text-sm">Status</span>
                </div>
                <StatusBadge status={vehicle.status} />
              </div>
            </div>
          </div>
        </div>

        {/* Person card */}
        <div className="rounded-2xl border bg-white p-5 sm:p-6 wp-anim-up" style={{ borderColor: C.line, animationDelay: "180ms" }}>
          <p className="text-xs font-bold tracking-wide mb-4" style={{ color: C.amberDeep }}>PERSON DETAILS</p>
          <div className="flex flex-col items-center text-center mb-5">
            <Avatar name={vehicle.person.name} hue={vehicle.person.hue} size={84} />
            <h3 className="wp-display text-lg font-semibold mt-3" style={{ color: C.text }}>{vehicle.person.name}</h3>
            <p className="text-sm font-medium mt-0.5" style={{ color: C.teal }}>{vehicle.person.title}</p>
            <p className="text-sm mt-0.5" style={{ color: C.muted }}>{vehicle.person.department}</p>
            <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: C.paper, color: C.muted }}>
              <Building2 size={12} /> {vehicle.person.office}
            </span>
          </div>
          <div className="border-t pt-4 space-y-3" style={{ borderColor: C.line }}>
            <PersonRow icon={Building2}   label="Department"   value={vehicle.person.department}  />
            <PersonRow icon={UserCircle2} label="Designation"  value={vehicle.person.title}       />
            <PersonRow icon={Hash}        label="Employee ID"  value={vehicle.person.employeeId}  mono />
            <PersonRow icon={Mail}        label="Email"        value={vehicle.person.email}        mono accent />
            <PersonRow icon={Phone}       label="Contact"      value={vehicle.person.contact}      mono />
          </div>
        </div>
      </div>

      {/* ── ALLOCATION TIMELINE + NOTES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border bg-white p-5 sm:p-6 wp-anim-up" style={{ borderColor: C.line, animationDelay: "240ms" }}>
          <p className="text-xs font-bold tracking-wide mb-5" style={{ color: C.amberDeep }}>ALLOCATION INFORMATION</p>
          <div className="flex flex-wrap items-start gap-y-5 gap-x-2">
            {timelineSteps.map((step, i) => (
              <div key={step.label} className="flex items-start gap-1">
                <div className="flex flex-col items-center text-center w-24">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-full mb-2"
                    style={{ background: `linear-gradient(135deg, ${C.amberSoft}, ${C.paper})`, color: C.amberDeep, border: `1px solid ${C.line}` }}
                  >
                    <step.icon size={18} />
                  </div>
                  <p className="text-xs" style={{ color: C.muted }}>{step.label}</p>
                  <p className="text-sm font-semibold truncate w-full" style={{ color: C.text }}>{step.value}</p>
                </div>
                {i < timelineSteps.length - 1 && (
                  <ChevronRight size={16} className="mt-4 shrink-0" style={{ color: C.line }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-2xl border p-5 sm:p-6 wp-anim-up relative overflow-hidden"
          style={{ borderColor: "#F0D4B0", backgroundColor: C.amberSoft, animationDelay: "300ms" }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${C.amber}35, transparent 70%)` }} />
          <p className="text-xs font-bold tracking-wide mb-3" style={{ color: C.amberDeep }}>ADDITIONAL NOTES</p>
          <div className="flex gap-3">
            <FileText size={18} className="shrink-0 mt-0.5" style={{ color: C.amberDeep }} />
            <p className="text-sm leading-relaxed" style={{ color: "#5C3A12" }}>{vehicle.notes}</p>
          </div>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit vehicle">
        <VehicleForm
          initialValues={vehicle}
          canEditVehicle={canEditVehicle}
          canEditAssignment={canEditAssignment}
          submitLabel="Save changes"
          onCancel={() => setEditOpen(false)}
          onSubmit={async (patch) => {
            try {
              await updateVehicle(vehicle.id, patch);
              setEditOpen(false);
              showToast("Vehicle updated");
            } catch (e) {
              showToast(e.message || "Could not update vehicle");
            }
          }}
        />
      </Modal>

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg wp-anim-up"
          style={{ backgroundColor: C.ink }}
        >
          <CheckCircle2 size={16} style={{ color: C.emerald }} />
          {toast}
        </div>
      )}
    </div>
  );
}
