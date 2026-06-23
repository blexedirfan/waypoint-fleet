import { useState } from "react";
import {
  MapPin,
  Mail,
  Building2,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { C } from "@/constants/tokens";
import { Field } from "@/components/ui/Field";
import { InputIcon } from "@/components/ui/InputIcon";
import { SignalDot } from "@/components/ui/SignalDot";

function emailToName(email) {
  const part = (email || "").split("@")[0];
  if (!part) return "Guest";
  return (
    part
      .split(/[._\d]+/)
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ") || "Guest"
  );
}

export function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("signin");
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

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = () => {
    setError("");
    if (!form.email || !form.password) {
      setError("Please fill in email and password.");
      return;
    }
    if (mode === "signup") {
      if (!form.name) { setError("Please tell us your full name."); return; }
      if (form.password.length < 6) { setError("Password should be at least 6 characters."); return; }
      if (form.password !== form.confirm) { setError("Passwords don't match."); return; }
    }
    setSubmitting(true);
    setTimeout(() => {
      const name = mode === "signup" ? form.name : emailToName(form.email);
      onAuthenticated({ name, email: form.email });
      setSubmitting(false);
    }, 850);
  };

  const onKeyDown = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div className="min-h-screen w-full flex wp-body" style={{ backgroundColor: C.paper }}>
      {/* ── Left brand panel ── */}
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
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ opacity: 0.1 }}
          preserveAspectRatio="none"
        >
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
            <div className="absolute rounded-full border" style={{ width: 200, height: 200, borderColor: "rgba(255,255,255,0.08)" }} />
            <div className="absolute rounded-full border" style={{ width: 150, height: 150, borderColor: "rgba(255,255,255,0.10)" }} />
            <div className="absolute rounded-full border" style={{ width: 100, height: 100, borderColor: "rgba(255,255,255,0.14)" }} />
            <div className="absolute wp-sweep" style={{ width: 200, height: 200 }}>
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  width: 1,
                  height: "50%",
                  background: "linear-gradient(to bottom, rgba(242,153,74,0.85), transparent)",
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

      {/* ── Right form panel ── */}
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

          {/* Mode toggle */}
          <div
            className="relative grid grid-cols-2 mb-8 rounded-xl p-1"
            style={{ backgroundColor: C.slateSoft }}
          >
            <div
              className="absolute top-1 bottom-1 rounded-lg bg-white shadow-sm transition-transform duration-300 ease-out"
              style={{
                width: "calc(50% - 4px)",
                transform:
                  mode === "signin" ? "translateX(0%)" : "translateX(calc(100% + 8px))",
              }}
            />
            {["signin", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
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
                <label
                  className="flex items-center gap-2 cursor-pointer select-none"
                  style={{ color: C.muted }}
                >
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
