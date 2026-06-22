import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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
  LayoutDashboard,
  ClipboardList,
  Bell,
  FileText,
  LogOut,
  Search,
  Plus,
  ChevronRight,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  X,
  Menu,
  MapPin,
  BarChart3,
  Settings as SettingsGear,
  Lock,
  User as UserIcon,
  Loader2,
  Wrench,
  PauseCircle,
  ChevronDown,
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

/* ============================== DESIGN TOKENS ============================== */

/* Colors that never change between themes */
const C = {
  ink:          "#0B1220",
  inkSoft:      "#141C2E",
  inkBorder:    "#222C42",
  inkText:      "#9AA6BD",
  amber:        "#F2994A",
  amberDeep:    "#C96A1B",
  teal:         "#129B8E",
  indigo:       "#5B5FEF",
  emerald:      "#1FA971",
  amberWarn:    "#D98B0E",
  rose:         "#E5484D",
  /* Theme-variable colors — resolved via CSS custom properties at runtime */
  paper:        "var(--wp-paper)",
  card:         "var(--wp-card)",
  line:         "var(--wp-line)",
  text:         "var(--wp-text)",
  muted:        "var(--wp-muted)",
  slateSoft:    "var(--wp-slateSoft)",
  amberSoft:    "var(--wp-amberSoft)",
  tealSoft:     "var(--wp-tealSoft)",
  indigoSoft:   "var(--wp-indigoSoft)",
  emeraldSoft:  "var(--wp-emeraldSoft)",
  amberWarnSoft:"var(--wp-amberWarnSoft)",
  roseSoft:     "var(--wp-roseSoft)",
};

const LIGHT_THEME = {
  paper: "#F3F5FA", card: "#FFFFFF", line: "#E7E9F2",
  text: "#10131A", muted: "#6B7280", slateSoft: "#EEF0F5",
  amberSoft: "#FCE8D6", tealSoft: "#D8F2EE", indigoSoft: "#E6E6FC",
  emeraldSoft: "#DBF5E7", amberWarnSoft: "#FCEFD3", roseSoft: "#FBE2E3",
  rowHover: "#F8F9FC",
};
const DARK_THEME = {
  paper: "#0D1117", card: "#161B22", line: "#30363D",
  text: "#E6EDF3", muted: "#8B949E", slateSoft: "#1C2128",
  amberSoft: "#2D1B0E", tealSoft: "#0D201E", indigoSoft: "#16163A",
  emeraldSoft: "#0D2116", amberWarnSoft: "#2A1A06", roseSoft: "#2A0D0F",
  rowHover: "#1C2128",
};

const STATUS_STYLE = {
  Active: { fg: C.emerald, bg: C.emeraldSoft, icon: CheckCircle2 },
  Maintenance: { fg: C.amberWarn, bg: C.amberWarnSoft, icon: Wrench },
  Inactive: { fg: C.muted, bg: C.slateSoft, icon: PauseCircle },
};

const FONT_FACE = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');

.wp-display { font-family: 'Space Grotesk', sans-serif; }
.wp-body { font-family: 'Inter', sans-serif; }
.wp-mono { font-family: 'JetBrains Mono', monospace; letter-spacing: 0.02em; }

@keyframes wpPulseRing {
  0% { transform: scale(0.75); opacity: 0.65; }
  70% { transform: scale(2.1); opacity: 0; }
  100% { transform: scale(2.1); opacity: 0; }
}
@keyframes wpFadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes wpFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes wpDash {
  to { stroke-dashoffset: -60; }
}
@keyframes wpGlow {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
}
@keyframes wpFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}
@keyframes wpSweep {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.wp-anim-up { animation: wpFadeUp 0.55s cubic-bezier(0.16,1,0.3,1) both; }
.wp-anim-in { animation: wpFadeIn 0.4s ease both; }
.wp-float { animation: wpFloat 4.5s ease-in-out infinite; }
.wp-dash { stroke-dasharray: 6 6; animation: wpDash 1.4s linear infinite; }
.wp-glow { animation: wpGlow 2.2s ease-in-out infinite; }
.wp-sweep { animation: wpSweep 3.5s linear infinite; transform-origin: center; }

.wp-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.wp-scrollbar::-webkit-scrollbar-thumb { background: #D7DBE6; border-radius: 999px; }
.wp-scrollbar::-webkit-scrollbar-track { background: transparent; }

.wp-row-hover:hover { background-color: #F8F9FC; }

@keyframes wpShimmer {
  0% { background-position: -300% center; }
  100% { background-position: 300% center; }
}
.wp-shimmer-gold {
  background: linear-gradient(90deg, #F2994A, #FFD89B, #C96A1B, #FFD89B, #F2994A);
  background-size: 250% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: wpShimmer 4s linear infinite;
}

@keyframes wpPageIn {
  from { opacity: 0; transform: translateY(12px) scale(0.984); }
  to   { opacity: 1; transform: translateY(0)    scale(1);     }
}
.wp-page-in { animation: wpPageIn 0.52s cubic-bezier(0.16,1,0.3,1) both; }

.wp-lift { transition: transform 0.22s ease, box-shadow 0.22s ease; }
.wp-lift:hover { transform: translateY(-4px); box-shadow: 0 18px 44px -10px rgba(0,0,0,0.14); }

@keyframes wpGlowBorder {
  0%, 100% { opacity: 0.45; }
  50%       { opacity: 1; }
}
.wp-glow-border { animation: wpGlowBorder 3s ease-in-out infinite; }

@keyframes wpNeonPulse {
  0%, 100% { box-shadow: 0 0 8px var(--glow-c, #F2994A88), 0 0 24px var(--glow-c, #F2994A44); }
  50%       { box-shadow: 0 0 18px var(--glow-c, #F2994Aaa), 0 0 48px var(--glow-c, #F2994A66); }
}
@keyframes wpBorderFlow {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes wpSlideRight {
  from { transform: translateX(-6px); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}
@keyframes wpParticle {
  0%   { transform: translateY(0) scale(1);   opacity: 0.6; }
  100% { transform: translateY(-60px) scale(0); opacity: 0; }
}

/* ── Glassmorphism card ── */
.wp-glass {
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
}

/* ── Card hover glow ── */
.wp-card-hover {
  transition: transform 0.26s cubic-bezier(0.16,1,0.3,1), box-shadow 0.26s ease, border-color 0.26s ease;
  cursor: pointer;
}
.wp-card-hover:hover {
  transform: translateY(-5px) scale(1.01);
  box-shadow: 0 24px 60px -12px rgba(0,0,0,0.18), 0 0 0 1px rgba(242,153,74,0.18);
  border-color: rgba(242,153,74,0.28) !important;
}

/* ── Glowing gradient button ── */
.wp-btn-primary {
  position: relative; overflow: hidden;
  background: linear-gradient(135deg, #F2994A, #C96A1B) !important;
  box-shadow: 0 4px 18px -4px rgba(242,153,74,0.45);
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
}
.wp-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px -6px rgba(242,153,74,0.65), 0 0 0 1px rgba(242,153,74,0.3);
  filter: brightness(1.08);
}
.wp-btn-primary:active { transform: scale(0.97) translateY(0); }
.wp-btn-primary::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.18), transparent 55%);
  pointer-events: none;
}

/* ── Secondary / ghost button ── */
.wp-btn-ghost {
  transition: all 0.18s ease;
}
.wp-btn-ghost:hover {
  background: rgba(242,153,74,0.08) !important;
  border-color: rgba(242,153,74,0.35) !important;
  color: #F2994A !important;
  box-shadow: 0 0 0 3px rgba(242,153,74,0.10);
  transform: translateY(-1px);
}
.wp-btn-ghost:active { transform: scale(0.97); }

/* ── Nav item hover ── */
.wp-nav-hover {
  transition: all 0.18s ease;
}
.wp-nav-hover:hover {
  background: rgba(242,153,74,0.10) !important;
  transform: translateX(3px);
  color: rgba(255,255,255,0.9) !important;
}

/* ── Input focus glow ── */
.wp-input-glow { transition: box-shadow 0.2s ease, border-color 0.2s ease; }
.wp-input-glow:focus-within {
  border-color: rgba(242,153,74,0.5) !important;
  box-shadow: 0 0 0 3px rgba(242,153,74,0.12), 0 0 16px rgba(242,153,74,0.08) !important;
}

/* ── Sidebar glow ── */
.wp-sidebar-shadow {
  box-shadow: 4px 0 40px rgba(0,0,0,0.5), inset -1px 0 0 rgba(255,255,255,0.04);
}

/* ── Table row ── */
.wp-row-hover:hover {
  background: linear-gradient(90deg, rgba(242,153,74,0.07), var(--wp-rowHover)) !important;
}

/* ── Stat badge glow ── */
.wp-badge-active  { box-shadow: 0 0 10px rgba(31,169,113,0.45),  0 0 28px rgba(31,169,113,0.18);  }
.wp-badge-warn    { box-shadow: 0 0 10px rgba(217,139,14,0.45),   0 0 28px rgba(217,139,14,0.18);  }
.wp-badge-muted   { box-shadow: 0 0 6px  rgba(107,114,128,0.3); }

/* ── Animated gradient border ── */
.wp-grad-border {
  background: linear-gradient(var(--bg,#fff), var(--bg,#fff)) padding-box,
              linear-gradient(135deg, #F2994A, #129B8E, #5B5FEF, #F2994A) border-box;
  border: 1.5px solid transparent;
  background-size: 200% 200%;
  animation: wpBorderFlow 5s ease infinite;
}
`;

/* ============================== MOCK DATA ============================== */

const VEHICLES = [
  {
    id: "ARV-24-791",
    image: "/cars/changan-oshan.svg",
    type: "Raya",
    model: "Changan Oshan",
    modelYear: 2024,
    assetNo: "ARV-24-791",
    month: "Jun-24",
    engineCC: "—",
    color: "White",
    colorHex: "#EDEFF4",
    fuelType: "Petrol",
    transmission: "Automatic",
    seating: "7 Seater",
    status: "Active",
    owner: "Ahmad Salman",
    assignedTo: "Ahmad Salman",
    department: "Supply Chain",
    allocatedOn: "Jun-24",
    person: {
      name: "Ahmad Salman",
      title: "Group Chief Supply Chain Officer",
      department: "Supply Chain",
      office: "Raya HQ",
      employeeId: "ARF",
      email: "ahmad.salman@raya.com",
      contact: "+966 50 123 4567",
      initials: "AS",
      hue: 222,
    },
    notes:
      "This vehicle is allocated for official use only. Please ensure proper maintenance and compliance with company policy.",
  },
  {
    id: "ARV-24-552",
    image: "/cars/toyota-camry.svg",
    type: "Sedan",
    model: "Toyota Camry",
    modelYear: 2023,
    assetNo: "ARV-24-552",
    month: "Mar-24",
    engineCC: "2500",
    color: "Black",
    colorHex: "#23262E",
    fuelType: "Petrol",
    transmission: "Automatic",
    seating: "5 Seater",
    status: "Maintenance",
    owner: "Lubna Haider",
    assignedTo: "Imran Qureshi",
    department: "Finance",
    allocatedOn: "Mar-24",
    person: {
      name: "Imran Qureshi",
      title: "Finance Manager",
      department: "Finance",
      office: "Lahore Branch",
      employeeId: "FIN-118",
      email: "imran.qureshi@raya.com",
      contact: "+92 300 555 1122",
      initials: "IQ",
      hue: 268,
    },
    notes:
      "Vehicle currently in service for scheduled maintenance. Expected back on the road within 3 business days.",
  },
  {
    id: "ARV-24-330",
    image: "/cars/hyundai-tucson.svg",
    type: "SUV",
    model: "Hyundai Tucson",
    modelYear: 2024,
    assetNo: "ARV-24-330",
    month: "Apr-24",
    engineCC: "2000",
    color: "Silver",
    colorHex: "#C7CBD4",
    fuelType: "Petrol",
    transmission: "Automatic",
    seating: "5 Seater",
    status: "Active",
    owner: "Sara Khan",
    assignedTo: "Sara Khan",
    department: "Marketing",
    allocatedOn: "Apr-24",
    person: {
      name: "Sara Khan",
      title: "Marketing Director",
      department: "Marketing",
      office: "Lisbon Office",
      employeeId: "MKT-044",
      email: "sara.khan@raya.com",
      contact: "+351 91 234 5678",
      initials: "SK",
      hue: 18,
    },
    notes:
      "Assigned for regional client visits. Mileage log must be submitted at the end of each month.",
  },
  {
    id: "ARV-24-198",
    image: "/cars/byd-atto3.svg",
    type: "EV",
    model: "BYD Atto 3",
    modelYear: 2024,
    assetNo: "ARV-24-198",
    month: "Feb-24",
    engineCC: "—",
    color: "Blue",
    colorHex: "#3F6FE0",
    fuelType: "Electric",
    transmission: "Automatic",
    seating: "5 Seater",
    status: "Active",
    owner: "Bilal Ahmed",
    assignedTo: "Bilal Ahmed",
    department: "Operations",
    allocatedOn: "Feb-24",
    person: {
      name: "Bilal Ahmed",
      title: "Operations Lead",
      department: "Operations",
      office: "Raya HQ",
      employeeId: "OPS-027",
      email: "bilal.ahmed@raya.com",
      contact: "+966 55 876 2210",
      initials: "BA",
      hue: 162,
    },
    notes:
      "Electric fleet unit — charge to at least 80% before long-distance trips. Home charging reimbursed monthly.",
  },
  {
    id: "ARV-23-905",
    image: "/cars/toyota-hilux.png",
    type: "Pickup",
    model: "Toyota Hilux",
    modelYear: 2023,
    assetNo: "ARV-23-905",
    month: "Nov-23",
    engineCC: "2800",
    color: "Grey",
    colorHex: "#7C828F",
    fuelType: "Diesel",
    transmission: "Manual",
    seating: "5 Seater",
    status: "Inactive",
    owner: "Hamza Tariq",
    assignedTo: "Unassigned",
    department: "Logistics",
    allocatedOn: "Nov-23",
    person: {
      name: "Hamza Tariq",
      title: "Logistics Coordinator",
      department: "Logistics",
      office: "Lahore Branch",
      employeeId: "LOG-061",
      email: "hamza.tariq@raya.com",
      contact: "+92 301 778 9043",
      initials: "HT",
      hue: 32,
    },
    notes:
      "Currently parked pending reassignment. Awaiting department clearance before next allocation.",
  },
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: "Maintenance due",
    desc: "ARV-24-552 (Toyota Camry) is in for scheduled service.",
    time: "2h ago",
    read: false,
    tone: "warn",
  },
  {
    id: 2,
    title: "New allocation",
    desc: "ARV-24-198 (BYD Atto 3) assigned to Bilal Ahmed — Operations.",
    time: "1d ago",
    read: false,
    tone: "good",
  },
  {
    id: 3,
    title: "Vehicle inactive",
    desc: "ARV-23-905 (Toyota Hilux) marked inactive, pending reassignment.",
    time: "3d ago",
    read: false,
    tone: "muted",
  },
  {
    id: 4,
    title: "Document expiring",
    desc: "Registration renewal for ARV-24-330 due in 12 days.",
    time: "5d ago",
    read: true,
    tone: "warn",
  },
];

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "vehicles", label: "Vehicles", icon: Car },
  { key: "allocations", label: "Allocations", icon: ClipboardList },
  { key: "people", label: "People", icon: Users },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "settings", label: "Settings", icon: SettingsGear },
];

/* ============================== HELPERS / HOOKS ============================== */

function emailToName(email) {
  const part = (email || "").split("@")[0];
  if (!part) return "Guest";
  return part
    .split(/[._\d]+/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ") || "Guest";
}

function initialsOf(name) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join("");
}

function useStagger(count, baseDelay = 55, start = 0) {
  return useMemo(
    () => Array.from({ length: count }, (_, i) => start + i * baseDelay),
    [count, baseDelay, start]
  );
}

function CountUp({ to, duration = 850 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [to, duration]);
  return val;
}

function useToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);
  const show = (message) => {
    setToast(message);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), 2400);
  };
  useEffect(() => () => timerRef.current && clearTimeout(timerRef.current), []);
  return [toast, show];
}

/* ============================== APP CONTEXT ============================== */

const AppContext = createContext(null);
function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

/* ============================== SHARED ATOMS ============================== */

function SignalDot({ color = C.emerald, size = 9 }) {
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

function Avatar({ name, hue = 220, size = 44 }) {
  const bg = `hsl(${hue}, 62%, 50%)`;
  const bg2 = `hsl(${hue + 28}, 70%, 42%)`;
  return (
    <div
      className="wp-display flex items-center justify-center rounded-full text-white font-semibold shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(135deg, ${bg}, ${bg2})`,
        boxShadow: `0 6px 16px -6px ${bg}, 0 0 0 2px ${bg}30`,
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 20px -4px ${bg}, 0 0 0 3px ${bg}55`; e.currentTarget.style.transform = "scale(1.06)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 6px 16px -6px ${bg}, 0 0 0 2px ${bg}30`; e.currentTarget.style.transform = "scale(1)"; }}
    >
      {initialsOf(name)}
    </div>
  );
}

const BADGE_GLOW = {
  Active:      "wp-badge-active",
  Maintenance: "wp-badge-warn",
  Inactive:    "wp-badge-muted",
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.Inactive;
  const Icon = s.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold wp-body ${BADGE_GLOW[status] || ""}`}
      style={{
        color: s.fg,
        backgroundColor: s.bg,
        transition: "box-shadow 0.2s ease",
      }}
    >
      <Icon size={13} strokeWidth={2.5} />
      {status}
    </span>
  );
}

function CarMark({ colorHex = C.amber, size = 220, animated = true, floatAnim = null, imageSrc = null }) {
  const body = colorHex === "#23262E" ? C.amber : colorHex;
  const uid = colorHex.replace(/[^a-zA-Z0-9]/g, "");
  const doFloat = floatAnim !== null ? floatAnim : animated;

  if (imageSrc) {
    return (
      <div
        className={doFloat ? "wp-float" : ""}
        style={{ width: size, height: (size * 230) / 400, position: "relative" }}
      >
        <img
          src={imageSrc}
          alt="Vehicle"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "center",
            filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.35))",
          }}
        />
      </div>
    );
  }

  const spokes = [0, 51, 102, 153, 204, 255, 306];

  return (
    <svg
      viewBox="0 0 400 230"
      width={size}
      height={(size * 230) / 400}
      className={doFloat ? "wp-float" : ""}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id={`shine_${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.52" />
          <stop offset="38%" stopColor="#fff" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id={`glass_${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D6EEFA" stopOpacity="0.92" />
          <stop offset="55%" stopColor="#6BBDE0" stopOpacity="0.74" />
          <stop offset="100%" stopColor="#2E82A8" stopOpacity="0.62" />
        </linearGradient>
        <radialGradient id={`rim_${uid}`} cx="38%" cy="32%" r="66%">
          <stop offset="0%" stopColor="#9CA8B8" />
          <stop offset="50%" stopColor="#3D4A5C" />
          <stop offset="100%" stopColor="#0D1219" />
        </radialGradient>
        <radialGradient id={`bodyglow_${uid}`} cx="50%" cy="0%" r="80%">
          <stop offset="0%" stopColor={body} stopOpacity="0.45" />
          <stop offset="100%" stopColor={body} stopOpacity="0" />
        </radialGradient>
        <filter id={`dropshadow_${uid}`} x="-10%" y="-10%" width="120%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000" floodOpacity="0.18" />
        </filter>
        <filter id={`glowblur_${uid}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>

      {/* Ground shadow ellipse */}
      <ellipse cx="200" cy="215" rx="168" ry="10" fill="#000" opacity="0.12" />

      {/* Color-matched undercar glow */}
      <ellipse
        cx="200" cy="210" rx="140" ry="14"
        fill={body} opacity="0.22"
        filter={`url(#glowblur_${uid})`}
      />

      {/* Body base */}
      <path
        d="M 26 155 C 18 140, 15 123, 25 111 L 52 93 C 66 82, 86 78, 106 77 L 128 59 C 139 47, 157 41, 175 41 L 236 41 C 261 41, 280 51, 291 68 L 310 88 C 326 92, 344 91, 356 92 L 374 102 C 384 115, 386 136, 382 155 L 378 163 L 348 163 C 346 144, 331 131, 312 131 C 293 131, 278 144, 276 163 L 126 163 C 124 144, 109 131, 90 131 C 71 131, 56 144, 54 163 L 28 163 Z"
        fill={body}
        filter={`url(#dropshadow_${uid})`}
      />

      {/* Shine gradient overlay for 3-D curvature */}
      <path
        d="M 26 155 C 18 140, 15 123, 25 111 L 52 93 C 66 82, 86 78, 106 77 L 128 59 C 139 47, 157 41, 175 41 L 236 41 C 261 41, 280 51, 291 68 L 310 88 C 326 92, 344 91, 356 92 L 374 102 C 384 115, 386 136, 382 155 L 378 163 L 348 163 C 346 144, 331 131, 312 131 C 293 131, 278 144, 276 163 L 126 163 C 124 144, 109 131, 90 131 C 71 131, 56 144, 54 163 L 28 163 Z"
        fill={`url(#shine_${uid})`}
      />

      {/* Windshield + rear window glass area */}
      <path
        d="M 134 59 C 142 48, 158 41, 175 41 L 236 41 C 258 41, 277 51, 288 67 L 306 90 L 140 90 Z"
        fill={`url(#glass_${uid})`}
      />

      {/* Glass reflection highlight */}
      <path
        d="M 158 58 L 185 42 L 216 42 L 200 58 Z"
        fill="#fff" opacity="0.24"
      />

      {/* B-pillar divider */}
      <line x1="206" y1="41" x2="206" y2="90" stroke={body} strokeWidth="5" strokeOpacity="0.45" />

      {/* Door character / crease line */}
      <path
        d="M 70 120 Q 190 109, 348 117"
        fill="none" stroke="#fff" strokeWidth="2" strokeOpacity="0.18" strokeLinecap="round"
      />

      {/* Lower body shadow accent */}
      <path
        d="M 32 151 C 60 158, 140 162, 202 162 C 264 162, 330 158, 376 151"
        fill="none" stroke="#000" strokeWidth="5" strokeOpacity="0.1" strokeLinecap="round"
      />

      {/* Side mirror */}
      <path d="M 106 85 L 119 82 L 121 91 L 107 93 Z" fill={body} opacity="0.9" />
      <path d="M 118 83 L 120 90" stroke="#fff" strokeWidth="0.8" strokeOpacity="0.22" />

      {/* Door handles */}
      <rect x="160" y="118" width="16" height="4" rx="2" fill="#000" opacity="0.18" />
      <rect x="160" y="118" width="16" height="4" rx="2" fill="#fff" opacity="0.09" />
      <rect x="268" y="118" width="16" height="4" rx="2" fill="#000" opacity="0.18" />
      <rect x="268" y="118" width="16" height="4" rx="2" fill="#fff" opacity="0.09" />

      {/* Front headlight cluster */}
      <path d="M 26 113 L 47 103 L 58 113 L 43 124 Z" fill="#FFFBE0" opacity="0.96" />
      <path d="M 26 113 L 47 103 L 58 113 L 43 124 Z" fill="#F5CC00" opacity="0.38" />
      {/* DRL strip */}
      <path d="M 34 106 L 52 98" stroke="#FFE666" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
      {/* Headlight beam (subtle) */}
      <path d="M 20 115 L 0 122 L 0 128 L 20 120 Z" fill="#FFF9DC" opacity="0.28" />

      {/* Rear taillight cluster */}
      <path d="M 374 106 L 384 115 L 384 145 L 376 145 L 372 132 Z" fill="#FF2222" opacity="0.88" />
      <path d="M 374 106 L 384 115 L 384 128 L 378 128 L 374 118 Z" fill="#FF7777" opacity="0.55" />

      {/* ── FRONT WHEEL ── */}
      <circle cx="90" cy="171" r="36" fill="#15202E" />
      <circle cx="90" cy="171" r="31" fill="#0C1016" />
      <g>
        <circle cx="90" cy="171" r="22" fill={`url(#rim_${uid})`} />
        {spokes.map((deg) => {
          const r = (deg * Math.PI) / 180;
          return (
            <line
              key={`fw-${deg}`}
              x1={90 + Math.cos(r) * 7} y1={171 + Math.sin(r) * 7}
              x2={90 + Math.cos(r) * 21} y2={171 + Math.sin(r) * 21}
              stroke="#A0AABA" strokeWidth="2.5" strokeLinecap="round"
            />
          );
        })}
        <circle cx="90" cy="171" r="5.5" fill="#D1D8E0" />
        <circle cx="90" cy="171" r="2.5" fill="#6B7A90" />
        {animated && <animateTransform attributeName="transform" type="rotate" from="0 90 171" to="360 90 171" dur="2.4s" repeatCount="indefinite" />}
      </g>
      {/* Tire highlight */}
      <path d="M 62 153 A 30 30 0 0 1 84 145" fill="none" stroke="#fff" strokeWidth="3" strokeOpacity="0.1" strokeLinecap="round" />

      {/* ── REAR WHEEL ── */}
      <circle cx="312" cy="171" r="36" fill="#15202E" />
      <circle cx="312" cy="171" r="31" fill="#0C1016" />
      <g>
        <circle cx="312" cy="171" r="22" fill={`url(#rim_${uid})`} />
        {spokes.map((deg) => {
          const r = (deg * Math.PI) / 180;
          return (
            <line
              key={`rw-${deg}`}
              x1={312 + Math.cos(r) * 7} y1={171 + Math.sin(r) * 7}
              x2={312 + Math.cos(r) * 21} y2={171 + Math.sin(r) * 21}
              stroke="#A0AABA" strokeWidth="2.5" strokeLinecap="round"
            />
          );
        })}
        <circle cx="312" cy="171" r="5.5" fill="#D1D8E0" />
        <circle cx="312" cy="171" r="2.5" fill="#6B7A90" />
        {animated && <animateTransform attributeName="transform" type="rotate" from="0 312 171" to="360 312 171" dur="2.4s" repeatCount="indefinite" />}
      </g>
      <path d="M 284 153 A 30 30 0 0 1 306 145" fill="none" stroke="#fff" strokeWidth="3" strokeOpacity="0.1" strokeLinecap="round" />

      {/* Animated road dashes */}
      <line x1="0" y1="218" x2="42" y2="218" stroke={C.amber} strokeWidth="3" strokeLinecap="round" className="wp-dash" />
      <line x1="358" y1="218" x2="400" y2="218" stroke={C.amber} strokeWidth="3" strokeLinecap="round" className="wp-dash" />
    </svg>
  );
}

function MiniStat({ icon: Icon, label, value, tint }) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl border bg-white px-4 py-3"
      style={{ borderColor: C.line }}
    >
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
        style={{ backgroundColor: tint.soft, color: tint.fg }}
      >
        <Icon size={17} strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <p className="wp-body text-xs" style={{ color: C.muted }}>
          {label}
        </p>
        <p className="wp-display text-sm font-semibold truncate" style={{ color: C.text }}>
          {value}
        </p>
      </div>
    </div>
  );
}

function SpecRow({ icon: Icon, label, value, mono }) {
  return (
    <div
      className="flex items-center justify-between py-3 border-b last:border-b-0"
      style={{ borderColor: C.line }}
    >
      <div className="flex items-center gap-2.5" style={{ color: C.muted }}>
        <Icon size={16} strokeWidth={2} />
        <span className="wp-body text-sm">{label}</span>
      </div>
      <span
        className={`text-sm font-semibold ${mono ? "wp-mono" : "wp-body"}`}
        style={{ color: C.text }}
      >
        {value}
      </span>
    </div>
  );
}

/* ============================== AUTH SCREEN ============================== */

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    password: "",
    confirm: "",
    remember: true,
  });

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = () => {
    setError("");
    if (!form.email || !form.password) {
      setError("Please fill in email and password.");
      return;
    }
    if (mode === "signup") {
      if (!form.name) {
        setError("Please tell us your full name.");
        return;
      }
      if (form.password.length < 6) {
        setError("Password should be at least 6 characters.");
        return;
      }
      if (form.password !== form.confirm) {
        setError("Passwords don't match.");
        return;
      }
    }
    setSubmitting(true);
    setTimeout(() => {
      const name = mode === "signup" ? form.name : emailToName(form.email);
      onAuthenticated({ name, email: form.email });
      setSubmitting(false);
    }, 850);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen w-full flex wp-body" style={{ backgroundColor: C.paper }}>
      {/* Left brand panel */}
      <div
        className="hidden lg:flex relative overflow-hidden flex-col justify-between p-12"
        style={{ backgroundColor: C.ink, width: "44%" }}
      >
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 22%, rgba(242,153,74,0.18), transparent 40%), radial-gradient(circle at 80% 75%, rgba(18,155,142,0.22), transparent 45%)",
          }}
        />
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.1 }} preserveAspectRatio="none">
          <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#FFFFFF" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <div className="relative flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: `linear-gradient(135deg, ${C.amber}, ${C.amberDeep})` }}
          >
            <MapPin size={18} color="#fff" strokeWidth={2.4} />
          </div>
          <span className="wp-display text-lg font-semibold text-white tracking-tight">
            Waypoint
          </span>
        </div>

        <div className="relative">
          <div className="relative mb-10 flex items-center justify-center" style={{ height: 200 }}>
            <div
              className="absolute rounded-full border"
              style={{ width: 200, height: 200, borderColor: "rgba(255,255,255,0.08)" }}
            />
            <div
              className="absolute rounded-full border"
              style={{ width: 150, height: 150, borderColor: "rgba(255,255,255,0.10)" }}
            />
            <div
              className="absolute rounded-full border"
              style={{ width: 100, height: 100, borderColor: "rgba(255,255,255,0.14)" }}
            />
            <div className="absolute wp-sweep" style={{ width: 200, height: 200 }}>
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  width: 1,
                  height: "50%",
                  background:
                    "linear-gradient(to bottom, rgba(242,153,74,0.85), transparent)",
                }}
              />
            </div>
            <SignalDot color={C.amber} size={14} />
          </div>
          <h1 className="wp-display text-3xl font-semibold text-white leading-tight mb-3">
            Every vehicle,
            <br />
            one live picture.
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: C.inkText, maxWidth: 360 }}>
            Track allocations, assigned drivers, and fleet health across every
            office — updated the moment something changes.
          </p>
        </div>

        <div className="relative flex items-center gap-6 text-xs" style={{ color: C.inkText }}>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} /> Encrypted by default
          </span>
          <span className="flex items-center gap-1.5">
            <SignalDot color={C.teal} size={7} /> Live GPS sync
          </span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm wp-anim-up">
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: `linear-gradient(135deg, ${C.amber}, ${C.amberDeep})` }}
            >
              <MapPin size={18} color="#fff" strokeWidth={2.4} />
            </div>
            <span className="wp-display text-lg font-semibold" style={{ color: C.text }}>
              Waypoint
            </span>
          </div>

          <div
            className="relative grid grid-cols-2 mb-8 rounded-xl p-1"
            style={{ backgroundColor: C.slateSoft }}
          >
            <div
              className="absolute top-1 bottom-1 rounded-lg bg-white shadow-sm transition-transform duration-300 ease-out"
              style={{
                width: "calc(50% - 4px)",
                transform: mode === "signin" ? "translateX(0%)" : "translateX(calc(100% + 8px))",
              }}
            />
            {["signin", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError("");
                }}
                className="relative z-10 py-2 text-sm font-semibold wp-body rounded-lg transition-colors"
                style={{ color: mode === m ? C.text : C.muted }}
              >
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <h2 className="wp-display text-2xl font-semibold mb-1" style={{ color: C.text }}>
            {mode === "signin" ? "Welcome back" : "Set up your workspace"}
          </h2>
          <p className="text-sm mb-7" style={{ color: C.muted }}>
            {mode === "signin"
              ? "Sign in to view your fleet allocations."
              : "A few details and you're tracking your fleet."}
          </p>

          <div key={mode} className="space-y-4 wp-anim-in">
            {mode === "signup" && (
              <Field label="Full name">
                <InputIcon icon={UserIcon}>
                  <input
                    value={form.name}
                    onChange={update("name")}
                    onKeyDown={onKeyDown}
                    placeholder="Ahmad Salman"
                    className="w-full bg-transparent outline-none text-sm wp-body"
                    style={{ color: C.text }}
                  />
                </InputIcon>
              </Field>
            )}

            <Field label="Work email">
              <InputIcon icon={Mail}>
                <input
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                  onKeyDown={onKeyDown}
                  placeholder="you@company.com"
                  className="w-full bg-transparent outline-none text-sm wp-body"
                  style={{ color: C.text }}
                />
              </InputIcon>
            </Field>

            {mode === "signup" && (
              <Field label="Company">
                <InputIcon icon={Building2}>
                  <input
                    value={form.company}
                    onChange={update("company")}
                    onKeyDown={onKeyDown}
                    placeholder="Raya"
                    className="w-full bg-transparent outline-none text-sm wp-body"
                    style={{ color: C.text }}
                  />
                </InputIcon>
              </Field>
            )}

            <Field label="Password">
              <InputIcon icon={Lock}>
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={update("password")}
                  onKeyDown={onKeyDown}
                  placeholder="••••••••"
                  className="w-full bg-transparent outline-none text-sm wp-body"
                  style={{ color: C.text }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="shrink-0"
                  style={{ color: C.muted }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </InputIcon>
            </Field>

            {mode === "signup" && (
              <Field label="Confirm password">
                <InputIcon icon={Lock}>
                  <input
                    type={showPw ? "text" : "password"}
                    value={form.confirm}
                    onChange={update("confirm")}
                    onKeyDown={onKeyDown}
                    placeholder="••••••••"
                    className="w-full bg-transparent outline-none text-sm wp-body"
                    style={{ color: C.text }}
                  />
                </InputIcon>
              </Field>
            )}

            {mode === "signin" && (
              <div className="flex items-center justify-between text-sm pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none" style={{ color: C.muted }}>
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={(e) => setForm((f) => ({ ...f, remember: e.target.checked }))}
                    className="rounded"
                  />
                  Remember me
                </label>
                <button className="font-medium" style={{ color: C.amberDeep }}>
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <p
                className="text-xs font-medium rounded-lg px-3 py-2 wp-anim-in"
                style={{ color: C.rose, backgroundColor: C.roseSoft }}
              >
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-70 wp-btn-primary"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  {mode === "signin" ? "Sign in" : "Create account"}
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: C.muted }}>
            {mode === "signin" ? "New to Waypoint?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-semibold"
              style={{ color: C.amberDeep }}
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium mb-1.5 block" style={{ color: C.muted }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function InputIcon({ icon: Icon, children }) {
  return (
    <div
      className="flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 wp-input-glow"
      style={{ borderColor: C.line, backgroundColor: C.card }}
    >
      <Icon size={16} style={{ color: C.muted }} />
      {children}
    </div>
  );
}

/* ============================== SIDEBAR ============================== */

function Sidebar({ mobileOpen, setMobileOpen }) {
  const { page, setPage, logout, unreadCount } = useApp();

  const body = (
    <div className="flex h-full flex-col" style={{ backgroundColor: C.ink }}>
      {/* Ambient top glow */}
      <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% -10%, rgba(242,153,74,0.12) 0%, transparent 65%)` }} />

      <div className="relative flex items-center gap-2.5 px-6 py-6">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0 wp-btn-primary"
          style={{ boxShadow: `0 4px 16px rgba(242,153,74,0.45)` }}
        >
          <MapPin size={18} color="#fff" strokeWidth={2.4} />
        </div>
        <span className="wp-display text-lg font-semibold text-white tracking-tight">
          Waypoint
        </span>
      </div>

      <nav className="relative flex-1 px-3 space-y-0.5 mt-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = page === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                setPage(item.key);
                setMobileOpen(false);
              }}
              className={`relative w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium wp-nav-hover ${active ? "" : ""}`}
              style={{
                color: active ? "#fff" : C.inkText,
                backgroundColor: active ? "rgba(242,153,74,0.14)" : "transparent",
                boxShadow: active ? "inset 0 0 24px rgba(242,153,74,0.06), 0 0 0 1px rgba(242,153,74,0.14)" : "none",
              }}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full"
                  style={{
                    backgroundColor: C.amber,
                    boxShadow: `0 0 10px ${C.amber}, 0 0 20px ${C.amber}88`,
                  }}
                />
              )}
              <span
                className="flex items-center justify-center h-7 w-7 rounded-lg shrink-0"
                style={{
                  backgroundColor: active ? `${C.amber}22` : "transparent",
                  transition: "background 0.18s ease",
                }}
              >
                <Icon size={16} strokeWidth={2} style={{ color: active ? C.amber : "inherit" }} />
              </span>
              <span className="wp-body">{item.label}</span>
              {item.key === "notifications" && unreadCount > 0 && (
                <span
                  className="ml-auto font-bold rounded-full px-1.5 py-0.5"
                  style={{
                    backgroundColor: C.amber,
                    color: "#1A1206",
                    fontSize: "10px",
                    boxShadow: `0 0 8px ${C.amber}88`,
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="relative px-3 pb-6">
        <div className="h-px mb-4 mx-2" style={{ background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)` }} />
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium wp-nav-hover"
          style={{ color: C.inkText }}
        >
          <span className="flex items-center justify-center h-7 w-7 rounded-lg" style={{ backgroundColor: "transparent", transition: "background 0.18s ease" }}>
            <LogOut size={16} strokeWidth={2} />
          </span>
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 wp-sidebar-shadow relative overflow-hidden">{body}</aside>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 h-full wp-anim-in">{body}</div>
          <button
            className="flex-1 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
        </div>
      )}
    </>
  );
}

/* ============================== TOP BAR ============================== */

function TopBar({ title, subtitle, setMobileOpen }) {
  const { currentUser, setPage, unreadCount } = useApp();
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3 min-w-0">
        <button
          className="lg:hidden shrink-0 flex h-9 w-9 items-center justify-center rounded-lg border"
          style={{ borderColor: C.line }}
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={17} />
        </button>
        <div className="min-w-0">
          <h1 className="wp-display text-xl sm:text-2xl font-semibold truncate" style={{ color: C.text }}>
            {title}
          </h1>
          <p className="text-sm truncate" style={{ color: C.muted }}>
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setPage("notifications")}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border bg-white wp-btn-ghost"
          style={{ borderColor: C.line }}
        >
          <Bell size={17} style={{ color: C.muted }} />
          {unreadCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full"
              style={{ backgroundColor: C.rose, boxShadow: `0 0 6px ${C.rose}` }}
            />
          )}
        </button>
        <button
          onClick={() => setPage("settings")}
          className="hidden sm:flex items-center gap-2.5 rounded-xl border bg-white pl-2 pr-3 py-1.5 wp-btn-ghost"
          style={{ borderColor: C.line }}
        >
          <Avatar name={currentUser.name} size={30} hue={222} />
          <span className="text-sm font-medium" style={{ color: C.text }}>
            {currentUser.name}
          </span>
          <ChevronDown size={14} style={{ color: C.muted }} />
        </button>
      </div>
    </div>
  );
}

/* ============================== DASHBOARD PAGE ============================== */

function DashboardPage() {
  const { vehicles, selectedVehicleId } = useApp();
  const vehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
  const bodyColor = vehicle.colorHex === "#23262E" ? C.amber : vehicle.colorHex;
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
    { name: "Active",     value: vehicles.filter((v) => v.status === "Active").length,      color: C.emerald  },
    { name: "In Service", value: vehicles.filter((v) => v.status === "Maintenance").length,  color: C.amberWarn },
    { name: "Inactive",   value: vehicles.filter((v) => v.status === "Inactive").length,     color: "#B8BFCC"  },
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
    { icon: UserCircle2, label: "Vehicle Owner", value: vehicle.owner, tint: { fg: C.indigo, soft: C.indigoSoft } },
    { icon: Users, label: "Assigned To", value: vehicle.assignedTo, tint: { fg: C.emerald, soft: C.emeraldSoft } },
    { icon: CalendarDays, label: "Model Year", value: String(vehicle.modelYear), tint: { fg: "#8B5CF6", soft: "#EEE7FD" } },
    { icon: Car, label: "Vehicle Type", value: vehicle.type, tint: { fg: C.amberDeep, soft: C.amberSoft } },
    { icon: Hash, label: "Asset No.", value: vehicle.assetNo, tint: { fg: C.teal, soft: C.tealSoft } },
  ];

  const delays = useStagger(statCards.length);

  const specs = [
    { icon: Car, label: "Vehicle Type", value: vehicle.type },
    { icon: Layers, label: "Model", value: vehicle.model },
    { icon: CalendarDays, label: "Model Year", value: vehicle.modelYear },
    { icon: Hash, label: "Registration / Asset No.", value: vehicle.assetNo, mono: true },
    { icon: Calendar, label: "Month", value: vehicle.month },
    { icon: Gauge, label: "Engine / CC", value: vehicle.engineCC },
    { icon: Palette, label: "Color", value: vehicle.color },
    { icon: Fuel, label: "Fuel Type", value: vehicle.fuelType },
    { icon: Settings2, label: "Transmission", value: vehicle.transmission },
    { icon: Armchair, label: "Seating Capacity", value: vehicle.seating },
  ];

  const timelineSteps = [
    { icon: UserCircle2, label: "Vehicle Owner", value: vehicle.owner },
    { icon: Users, label: "Assigned To", value: vehicle.assignedTo },
    { icon: Building2, label: "Department", value: vehicle.department },
    { icon: CalendarDays, label: "Allocated On", value: vehicle.allocatedOn },
    { icon: Hash, label: "Allocation ID", value: vehicle.assetNo },
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
      </TopBarSlot>

      {/* ── HERO CARD ── */}
      <div
        className="relative rounded-3xl overflow-hidden mb-6 wp-anim-up"
        style={{
          background: `linear-gradient(140deg, #080E1C 0%, #101828 55%, #0A1220 100%)`,
          border: `1px solid rgba(242,153,74,0.15)`,
          boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px -20px rgba(0,0,0,0.55), 0 0 60px -20px rgba(242,153,74,0.12)`,
        }}
      >
        {/* Dot-grid background pattern */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity: 0.055 }}
          preserveAspectRatio="none"
        >
          <pattern id="hgrid" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#fff" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#hgrid)" />
        </svg>

        {/* Ambient color glow matching vehicle */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "70%",
            height: "85%",
            background: `radial-gradient(ellipse at center bottom, ${bodyColor}50 0%, transparent 66%)`,
          }}
        />

        {/* Top-right glow accent */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: 0,
            right: 0,
            width: "40%",
            height: "60%",
            background: `radial-gradient(ellipse at top right, ${bodyColor}18 0%, transparent 65%)`,
          }}
        />

        <div className="relative flex flex-col md:flex-row items-center">
          {/* 3-D Car showcase — mouse-tilt interactive */}
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
                transition: tilt.x === 0 && tilt.y === 0
                  ? "transform 0.65s cubic-bezier(0.16,1,0.3,1)"
                  : "transform 0.07s linear",
                willChange: "transform",
              }}
            >
              <CarMark colorHex={vehicle.colorHex} imageSrc={vehicle.image} size={310} animated={true} floatAnim={false} />
            </div>
          </div>

          {/* Vehicle info panel */}
          <div
            className="md:w-72 shrink-0 px-6 pb-8 pt-2 md:pt-8 md:pr-10 text-center md:text-left"
          >
            <div className="mb-4">
              <StatusBadge status={vehicle.status} />
            </div>

            <h2
              className="wp-display text-3xl font-bold leading-tight mb-1 wp-shimmer-gold"
            >
              {vehicle.model}
            </h2>
            <p className="text-sm font-medium mb-5" style={{ color: C.inkText }}>
              {vehicle.type} · {vehicle.modelYear}
            </p>

            <div className="space-y-3 mb-6">
              {[
                { icon: UserCircle2, value: vehicle.owner, label: "Owner" },
                { icon: Building2, value: vehicle.department, label: "Department" },
                { icon: Hash, value: vehicle.assetNo, label: "Asset No.", mono: true },
              ].map(({ icon: Icon, value, label, mono }) => (
                <div
                  key={label}
                  className="flex items-center justify-center md:justify-start gap-3"
                >
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0"
                    style={{ background: `${C.amber}22`, border: `1px solid ${C.amber}30` }}
                  >
                    <Icon size={13} style={{ color: C.amber }} />
                  </div>
                  <span
                    className={`text-sm ${mono ? "wp-mono" : "wp-body"}`}
                    style={{ color: C.inkText }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Fleet utilization bar */}
            <div
              className="mb-5 rounded-xl p-3"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
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
                <span
                  key={tag}
                  className="text-xs font-medium rounded-full px-3 py-1"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    color: C.inkText,
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom border glow strip */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px"
          style={{
            width: "60%",
            background: `linear-gradient(90deg, transparent, ${bodyColor}70, transparent)`,
          }}
        />
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {statCards.map((s, i) => (
          <div
            key={s.label}
            className="wp-anim-up rounded-2xl border bg-white p-4 flex items-center gap-3 wp-card-hover group"
            style={{ borderColor: C.line, animationDelay: `${delays[i]}ms` }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 20px 50px -12px ${s.tint.fg}40, 0 0 0 1px ${s.tint.fg}28`; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0 transition-all duration-200 group-hover:scale-110"
              style={{
                backgroundColor: s.tint.soft,
                color: s.tint.fg,
                boxShadow: `0 4px 12px ${s.tint.fg}30`,
              }}
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
        <div
          className="rounded-2xl border bg-white p-5 wp-anim-up wp-card-hover"
          style={{ borderColor: C.line, animationDelay: "80ms" }}
        >
          <p className="text-xs font-bold tracking-wide mb-0.5" style={{ color: C.amberDeep }}>FLEET STATUS</p>
          <p className="text-xs mb-3" style={{ color: C.muted }}>{vehicles.length} vehicles registered</p>
          <div className="relative" style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData} cx="50%" cy="50%"
                  innerRadius={46} outerRadius={68}
                  paddingAngle={4} dataKey="value"
                  startAngle={90} endAngle={-270} stroke="none"
                >
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 12 }}
                />
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
                <span className="text-xs font-bold wp-mono" style={{ color: C.text }}>
                  <CountUp to={s.value} />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Allocation — horizontal bar */}
        <div
          className="rounded-2xl border bg-white p-5 wp-anim-up wp-card-hover"
          style={{ borderColor: C.line, animationDelay: "140ms" }}
        >
          <p className="text-xs font-bold tracking-wide mb-0.5" style={{ color: C.amberDeep }}>BY DEPARTMENT</p>
          <p className="text-xs mb-3" style={{ color: C.muted }}>Vehicles per department</p>
          <div style={{ height: 210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} barSize={22} layout="vertical">
                <CartesianGrid horizontal={false} stroke={C.line} />
                <XAxis
                  type="number" allowDecimals={false}
                  tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false}
                />
                <YAxis
                  type="category" dataKey="department" width={76}
                  tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: C.paper }}
                  contentStyle={{ borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 12 }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {deptData.map((_, i) => (
                    <Cell key={i} fill={[C.amber, C.teal, C.indigo, C.emerald, C.rose][i % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Type Donut */}
        <div
          className="rounded-2xl border bg-white p-5 wp-anim-up wp-card-hover"
          style={{ borderColor: C.line, animationDelay: "200ms" }}
        >
          <p className="text-xs font-bold tracking-wide mb-0.5" style={{ color: C.amberDeep }}>VEHICLE TYPES</p>
          <p className="text-xs mb-3" style={{ color: C.muted }}>Fleet composition by type</p>
          <div className="relative" style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData} cx="50%" cy="50%"
                  innerRadius={46} outerRadius={68}
                  paddingAngle={4} dataKey="value"
                  startAngle={90} endAngle={-270} stroke="none"
                >
                  {typeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 12 }}
                />
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
        {/* Vehicle specs card */}
        <div
          className="lg:col-span-2 rounded-2xl border bg-white p-5 sm:p-6 wp-anim-up"
          style={{ borderColor: C.line, animationDelay: "120ms" }}
        >
          <p className="text-xs font-bold tracking-wide mb-5" style={{ color: C.amberDeep }}>
            VEHICLE SPECIFICATIONS
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div
                className="rounded-2xl flex items-center justify-center py-8 mb-4 relative overflow-hidden"
                style={{ backgroundColor: C.paper }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at center, ${bodyColor}22 0%, transparent 70%)`,
                  }}
                />
                <CarMark colorHex={vehicle.colorHex} imageSrc={vehicle.image} size={200} animated={false} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MiniStat icon={Calendar} label="Model Year" value={vehicle.modelYear} tint={{ fg: C.indigo, soft: C.indigoSoft }} />
                <MiniStat icon={Car} label="Type" value={vehicle.type} tint={{ fg: C.amberDeep, soft: C.amberSoft }} />
                <MiniStat icon={Layers} label="Model" value={vehicle.model} tint={{ fg: C.teal, soft: C.tealSoft }} />
                <MiniStat icon={Hash} label="Asset No." value={vehicle.assetNo} tint={{ fg: C.emerald, soft: C.emeraldSoft }} />
              </div>
            </div>

            <div>
              {specs.map((row) => (
                <SpecRow key={row.label} {...row} />
              ))}
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

        {/* Person details card */}
        <div
          className="rounded-2xl border bg-white p-5 sm:p-6 wp-anim-up"
          style={{ borderColor: C.line, animationDelay: "180ms" }}
        >
          <p className="text-xs font-bold tracking-wide mb-4" style={{ color: C.amberDeep }}>
            PERSON DETAILS
          </p>

          <div className="flex flex-col items-center text-center mb-5">
            <Avatar name={vehicle.person.name} hue={vehicle.person.hue} size={84} />
            <h3 className="wp-display text-lg font-semibold mt-3" style={{ color: C.text }}>
              {vehicle.person.name}
            </h3>
            <p className="text-sm font-medium mt-0.5" style={{ color: C.teal }}>
              {vehicle.person.title}
            </p>
            <p className="text-sm mt-0.5" style={{ color: C.muted }}>
              {vehicle.person.department}
            </p>
            <span
              className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ backgroundColor: C.paper, color: C.muted }}
            >
              <Building2 size={12} />
              {vehicle.person.office}
            </span>
          </div>

          <div className="border-t pt-4 space-y-3" style={{ borderColor: C.line }}>
            <PersonRow icon={Building2} label="Department" value={vehicle.person.department} />
            <PersonRow icon={UserCircle2} label="Designation" value={vehicle.person.title} />
            <PersonRow icon={Hash} label="Employee ID" value={vehicle.person.employeeId} mono />
            <PersonRow icon={Mail} label="Email" value={vehicle.person.email} mono accent />
            <PersonRow icon={Phone} label="Contact" value={vehicle.person.contact} mono />
          </div>
        </div>
      </div>

      {/* ── ALLOCATION TIMELINE + NOTES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div
          className="lg:col-span-2 rounded-2xl border bg-white p-5 sm:p-6 wp-anim-up"
          style={{ borderColor: C.line, animationDelay: "240ms" }}
        >
          <p className="text-xs font-bold tracking-wide mb-5" style={{ color: C.amberDeep }}>
            ALLOCATION INFORMATION
          </p>
          <div className="flex flex-wrap items-start gap-y-5 gap-x-2">
            {timelineSteps.map((step, i) => (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center text-center w-24">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-full mb-2"
                    style={{
                      background: `linear-gradient(135deg, ${C.amberSoft}, ${C.paper})`,
                      color: C.amberDeep,
                      border: `1px solid ${C.line}`,
                    }}
                  >
                    <step.icon size={18} />
                  </div>
                  <p className="text-xs" style={{ color: C.muted }}>{step.label}</p>
                  <p className="text-sm font-semibold truncate w-full" style={{ color: C.text }}>{step.value}</p>
                </div>
                {i < timelineSteps.length - 1 && (
                  <ChevronRight size={16} className="mt-4 shrink-0" style={{ color: C.line }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div
          className="rounded-2xl border p-5 sm:p-6 wp-anim-up relative overflow-hidden"
          style={{ borderColor: "#F0D4B0", backgroundColor: C.amberSoft, animationDelay: "300ms" }}
        >
          {/* Subtle glow in corner */}
          <div
            className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
            style={{
              background: `radial-gradient(circle at top right, ${C.amber}35, transparent 70%)`,
            }}
          />
          <p className="text-xs font-bold tracking-wide mb-3" style={{ color: C.amberDeep }}>
            ADDITIONAL NOTES
          </p>
          <div className="flex gap-3">
            <FileText size={18} className="shrink-0 mt-0.5" style={{ color: C.amberDeep }} />
            <p className="text-sm leading-relaxed" style={{ color: "#5C3A12" }}>
              {vehicle.notes}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

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

/* shared topbar slot wrapper so each page can add right-side controls */
function TopBarSlot({ title, subtitle, children }) {
  const { setPage, currentUser, unreadCount, setMobileOpen, isDark, setIsDark } = useApp();
  return (
    <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
      <div className="flex items-center gap-3 min-w-0">
        <button
          className="lg:hidden shrink-0 flex h-9 w-9 items-center justify-center rounded-lg border"
          style={{ borderColor: C.line }}
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={17} />
        </button>
        <div className="min-w-0">
          <h1 className="wp-display text-xl sm:text-2xl font-semibold truncate" style={{ color: C.text }}>
            {title}
          </h1>
          <p className="text-sm truncate" style={{ color: C.muted }}>
            {subtitle}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {children}
        <ThemeToggle isDark={isDark} onToggle={() => setIsDark((v) => !v)} />
        <button
          onClick={() => setPage("notifications")}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border bg-white wp-btn-ghost"
          style={{ borderColor: C.line }}
        >
          <Bell size={17} style={{ color: C.muted }} />
          {unreadCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full"
              style={{ backgroundColor: C.rose, boxShadow: `0 0 6px ${C.rose}` }}
            />
          )}
        </button>
        <button
          onClick={() => setPage("settings")}
          className="hidden sm:flex items-center gap-2 rounded-xl border bg-white pl-2 pr-3 py-1.5 wp-btn-ghost"
          style={{ borderColor: C.line }}
        >
          <Avatar name={currentUser.name} size={28} hue={222} />
          <span className="text-sm font-medium" style={{ color: C.text }}>
            {currentUser.name}
          </span>
          <ChevronDown size={13} style={{ color: C.muted }} />
        </button>
      </div>
    </div>
  );
}

/* ============================== VEHICLES PAGE ============================== */

function VehiclesPage() {
  const { vehicles, setSelectedVehicleId, setPage } = useApp();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesQuery =
        v.model.toLowerCase().includes(query.toLowerCase()) ||
        v.assetNo.toLowerCase().includes(query.toLowerCase()) ||
        v.owner.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === "All" || v.status === filter;
      return matchesQuery && matchesFilter;
    });
  }, [vehicles, query, filter]);

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
              className={`shrink-0 rounded-xl px-3.5 py-2.5 text-sm font-medium border transition-all duration-200 ${filter === f ? "wp-btn-primary" : "wp-btn-ghost"}`}
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
          {filtered.map((v, i) => (
            <button
              key={v.id}
              onClick={() => {
                setSelectedVehicleId(v.id);
                setPage("dashboard");
              }}
              className="text-left rounded-2xl border bg-white p-5 wp-card-hover wp-anim-up group"
              style={{ borderColor: C.line, animationDelay: `${delays[i]}ms` }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 24px 60px -12px ${v.colorHex === "#23262E" ? C.amber : v.colorHex}55, 0 0 0 1.5px ${v.colorHex === "#23262E" ? C.amber : v.colorHex}35`; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="wp-display font-semibold text-base" style={{ color: C.text }}>
                    {v.model}
                  </p>
                  <p className="text-xs wp-mono" style={{ color: C.muted }}>
                    {v.assetNo}
                  </p>
                </div>
                <StatusBadge status={v.status} />
              </div>
              <div
                className="rounded-xl flex items-center justify-center py-4 my-3 relative overflow-hidden"
                style={{
                  background: `radial-gradient(ellipse at center, ${v.colorHex === "#23262E" ? C.amber : v.colorHex}18 0%, ${C.paper} 68%)`,
                }}
              >
                <CarMark colorHex={v.colorHex === "#23262E" ? C.amber : v.colorHex} imageSrc={v.image} size={120} animated={false} />
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
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div
      className="rounded-2xl border border-dashed flex flex-col items-center justify-center py-16 text-center"
      style={{ borderColor: C.line }}
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full mb-3"
        style={{ backgroundColor: C.paper, color: C.muted }}
      >
        <Search size={20} />
      </div>
      <p className="text-sm" style={{ color: C.muted }}>
        {message}
      </p>
    </div>
  );
}

/* ============================== ALLOCATIONS PAGE ============================== */

function AllocationsPage() {
  const { vehicles, setSelectedVehicleId, setPage } = useApp();

  return (
    <div>
      <TopBarSlot title="Allocations" subtitle="Every vehicle, its assigned person, and department" />
      <div className="rounded-2xl border bg-white overflow-hidden wp-anim-up" style={{ borderColor: C.line }}>
        <div className="overflow-x-auto wp-scrollbar">
          <table className="w-full text-sm" style={{ minWidth: "720px" }}>
            <thead>
              <tr className="border-b text-left" style={{ borderColor: C.line, color: C.muted }}>
                {["Asset No.", "Vehicle", "Owner", "Assigned To", "Department", "Allocated On", "Status"].map((h) => (
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
                  onClick={() => {
                    setSelectedVehicleId(v.id);
                    setPage("dashboard");
                  }}
                  className="border-b last:border-b-0 cursor-pointer wp-row-hover transition-colors"
                  style={{ borderColor: C.line }}
                >
                  <td className="px-5 py-3.5 wp-mono font-medium" style={{ color: C.text }}>
                    {v.assetNo}
                  </td>
                  <td className="px-5 py-3.5" style={{ color: C.text }}>
                    {v.model}
                  </td>
                  <td className="px-5 py-3.5" style={{ color: C.muted }}>
                    {v.owner}
                  </td>
                  <td className="px-5 py-3.5" style={{ color: C.muted }}>
                    {v.assignedTo}
                  </td>
                  <td className="px-5 py-3.5" style={{ color: C.muted }}>
                    {v.department}
                  </td>
                  <td className="px-5 py-3.5" style={{ color: C.muted }}>
                    {v.allocatedOn}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={v.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================== PEOPLE PAGE ============================== */

function PeoplePage() {
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
            onClick={() => {
              setSelectedVehicleId(p.vehicle.id);
              setPage("dashboard");
            }}
            className="text-left rounded-2xl border bg-white p-5 wp-card-hover wp-anim-up group"
            style={{ borderColor: C.line, animationDelay: `${delays[i]}ms` }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Avatar name={p.name} hue={p.hue} size={48} />
              <div className="min-w-0">
                <p className="wp-display font-semibold text-sm truncate" style={{ color: C.text }}>
                  {p.name}
                </p>
                <p className="text-xs truncate" style={{ color: C.teal }}>
                  {p.title}
                </p>
              </div>
            </div>
            <div className="space-y-2 text-xs" style={{ color: C.muted }}>
              <p className="flex items-center gap-2">
                <Building2 size={13} /> {p.department} · {p.office}
              </p>
              <p className="flex items-center gap-2 wp-mono truncate">
                <Mail size={13} /> {p.email}
              </p>
              <p className="flex items-center gap-2 wp-mono">
                <Phone size={13} /> {p.contact}
              </p>
              <p className="flex items-center gap-2">
                <Car size={13} /> {p.vehicle.assetNo}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================== REPORTS PAGE ============================== */

function ReportsPage() {
  const { vehicles } = useApp();

  const byDept = useMemo(() => {
    const map = {};
    vehicles.forEach((v) => {
      map[v.department] = (map[v.department] || 0) + 1;
    });
    return Object.entries(map).map(([department, count]) => ({ department, count }));
  }, [vehicles]);

  const active = vehicles.filter((v) => v.status === "Active").length;
  const maintenance = vehicles.filter((v) => v.status === "Maintenance").length;
  const inactive = vehicles.filter((v) => v.status === "Inactive").length;

  const tiles = [
    { label: "Total Vehicles", value: vehicles.length, icon: Car, tint: { fg: C.indigo, soft: C.indigoSoft } },
    { label: "Active", value: active, icon: CheckCircle2, tint: { fg: C.emerald, soft: C.emeraldSoft } },
    { label: "In Maintenance", value: maintenance, icon: Wrench, tint: { fg: C.amberWarn, soft: C.amberWarnSoft } },
    { label: "Inactive", value: inactive, icon: PauseCircle, tint: { fg: C.muted, soft: C.slateSoft } },
  ];

  const palette = [C.amber, C.teal, C.indigo, C.emerald, C.rose];

  return (
    <div>
      <TopBarSlot title="Reports" subtitle="Fleet composition and allocation breakdown" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl border bg-white p-4 wp-anim-up" style={{ borderColor: C.line }}>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl mb-3"
              style={{ backgroundColor: t.tint.soft, color: t.tint.fg }}
            >
              <t.icon size={17} />
            </div>
            <p className="wp-display text-2xl font-semibold" style={{ color: C.text }}>
              <CountUp to={t.value} />
            </p>
            <p className="text-xs" style={{ color: C.muted }}>
              {t.label}
            </p>
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
              <Tooltip
                cursor={{ fill: C.paper }}
                contentStyle={{ borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 13 }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {byDept.map((_, i) => (
                  <Cell key={i} fill={palette[i % palette.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ============================== NOTIFICATIONS PAGE ============================== */

const TONE_COLOR = {
  warn: { fg: C.amberWarn, bg: C.amberWarnSoft },
  good: { fg: C.emerald, bg: C.emeraldSoft },
  muted: { fg: C.muted, bg: C.slateSoft },
};

function NotificationsPage() {
  const { notifications, setNotifications } = useApp();

  const markAllRead = () =>
    setNotifications((list) => list.map((n) => ({ ...n, read: true })));

  const toggleRead = (id) =>
    setNotifications((list) =>
      list.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );

  const delays = useStagger(notifications.length, 50);

  return (
    <div>
      <TopBarSlot title="Notifications" subtitle="Fleet activity and reminders">
        <button
          onClick={markAllRead}
          className="text-sm font-medium rounded-xl border bg-white px-3.5 py-2"
          style={{ borderColor: C.line, color: C.text }}
        >
          Mark all as read
        </button>
      </TopBarSlot>

      <div className="space-y-3">
        {notifications.map((n, i) => {
          const tone = TONE_COLOR[n.tone] || TONE_COLOR.muted;
          return (
            <button
              key={n.id}
              onClick={() => toggleRead(n.id)}
              className="w-full text-left flex items-start gap-4 rounded-2xl border bg-white p-4 sm:p-5 wp-anim-up"
              style={{
                borderColor: C.line,
                opacity: n.read ? 0.6 : 1,
                animationDelay: `${delays[i]}ms`,
              }}
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full shrink-0"
                style={{ backgroundColor: tone.bg, color: tone.fg }}
              >
                <Bell size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold" style={{ color: C.text }}>
                    {n.title}
                  </p>
                  <span className="text-xs shrink-0" style={{ color: C.muted }}>
                    {n.time}
                  </span>
                </div>
                <p className="text-sm mt-0.5" style={{ color: C.muted }}>
                  {n.desc}
                </p>
              </div>
              {!n.read && <SignalDot color={C.amber} size={8} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================== SETTINGS PAGE ============================== */

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative h-6 w-11 rounded-full transition-colors shrink-0"
      style={{ backgroundColor: checked ? C.amber : C.slateSoft }}
    >
      <span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
        style={{ transform: checked ? "translateX(22px)" : "translateX(2px)" }}
      />
    </button>
  );
}

function SettingsPage() {
  const { currentUser } = useApp();
  const [form, setForm] = useState({
    name: currentUser.name,
    email: currentUser.email || "you@company.com",
    phone: "+92 300 000 0000",
  });
  const [prefs, setPrefs] = useState({
    emailAlerts: true,
    smsAlerts: false,
    maintenanceReminders: true,
  });
  const [toast, showToast] = useToast();

  return (
    <div>
      <TopBarSlot title="Settings" subtitle="Manage your profile and notification preferences" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border bg-white p-5 sm:p-6 wp-anim-up" style={{ borderColor: C.line }}>
          <p className="text-xs font-bold tracking-wide mb-5" style={{ color: C.amberDeep }}>
            PROFILE
          </p>
          <div className="flex items-center gap-4 mb-6">
            <Avatar name={form.name} size={64} hue={222} />
            <div>
              <p className="wp-display font-semibold text-base" style={{ color: C.text }}>
                {form.name}
              </p>
              <p className="text-sm" style={{ color: C.muted }}>
                {form.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <Field label="Full name">
              <InputIcon icon={UserIcon}>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-transparent outline-none text-sm wp-body"
                  style={{ color: C.text }}
                />
              </InputIcon>
            </Field>
            <Field label="Email">
              <InputIcon icon={Mail}>
                <input
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full bg-transparent outline-none text-sm wp-body"
                  style={{ color: C.text }}
                />
              </InputIcon>
            </Field>
            <Field label="Phone">
              <InputIcon icon={Phone}>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full bg-transparent outline-none text-sm wp-body"
                  style={{ color: C.text }}
                />
              </InputIcon>
            </Field>
          </div>

          <button
            onClick={() => showToast("Profile settings saved")}
            className="mt-4 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: `linear-gradient(135deg, ${C.amber}, ${C.amberDeep})` }}
          >
            Save changes
          </button>
        </div>

        <div className="rounded-2xl border bg-white p-5 sm:p-6 wp-anim-up" style={{ borderColor: C.line, animationDelay: "100ms" }}>
          <p className="text-xs font-bold tracking-wide mb-5" style={{ color: C.amberDeep }}>
            NOTIFICATION PREFERENCES
          </p>
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium" style={{ color: C.text }}>
                  Email alerts
                </p>
                <p className="text-xs" style={{ color: C.muted }}>
                  Allocation and status changes
                </p>
              </div>
              <Toggle checked={prefs.emailAlerts} onChange={(v) => setPrefs((p) => ({ ...p, emailAlerts: v }))} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium" style={{ color: C.text }}>
                  SMS alerts
                </p>
                <p className="text-xs" style={{ color: C.muted }}>
                  Urgent fleet issues only
                </p>
              </div>
              <Toggle checked={prefs.smsAlerts} onChange={(v) => setPrefs((p) => ({ ...p, smsAlerts: v }))} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium" style={{ color: C.text }}>
                  Maintenance reminders
                </p>
                <p className="text-xs" style={{ color: C.muted }}>
                  Service due dates
                </p>
              </div>
              <Toggle
                checked={prefs.maintenanceReminders}
                onChange={(v) => setPrefs((p) => ({ ...p, maintenanceReminders: v }))}
              />
            </div>
          </div>
        </div>
      </div>

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

/* ============================== APP SHELL ============================== */

function AppShell() {
  const { page, mobileOpen, setMobileOpen } = useApp();

  const PAGES = {
    dashboard: DashboardPage,
    vehicles: VehiclesPage,
    allocations: AllocationsPage,
    people: PeoplePage,
    reports: ReportsPage,
    notifications: NotificationsPage,
    settings: SettingsPage,
  };
  const Page = PAGES[page] || DashboardPage;

  return (
    <div className="min-h-screen flex wp-body" style={{ backgroundColor: C.paper }}>
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        <div key={page} className="wp-page-in">
          <Page />
        </div>
      </main>
    </div>
  );
}

/* ============================== ROOT APP ============================== */

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState({ name: "Ahmad Salman", email: "" });
  const [page, setPage] = useState("dashboard");
  const [selectedVehicleId, setSelectedVehicleId] = useState(VEHICLES[0].id);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const tokens = isDark ? DARK_THEME : LIGHT_THEME;
    const root = document.documentElement;
    Object.entries(tokens).forEach(([key, value]) => {
      root.style.setProperty(`--wp-${key}`, value);
    });
    root.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const logout = () => {
    setAuthenticated(false);
    setPage("dashboard");
    setMobileOpen(false);
  };

  const ctxValue = {
    currentUser,
    page,
    setPage,
    vehicles: VEHICLES,
    selectedVehicleId,
    setSelectedVehicleId,
    notifications,
    setNotifications,
    unreadCount,
    logout,
    mobileOpen,
    setMobileOpen,
    isDark,
    setIsDark,
  };

  return (
    <>
      <style>{FONT_FACE}</style>
      {!authenticated ? (
        <AuthScreen
          onAuthenticated={(user) => {
            setCurrentUser(user);
            setAuthenticated(true);
          }}
        />
      ) : (
        <AppContext.Provider value={ctxValue}>
          <AppShell />
        </AppContext.Provider>
      )}
    </>
  );
}
