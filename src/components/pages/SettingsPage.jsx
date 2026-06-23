import { useState } from "react";
import { User as UserIcon, Mail, Phone, CheckCircle2 } from "lucide-react";
import { C } from "@/constants/tokens";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/useToast";
import { TopBarSlot } from "@/components/layout/TopBarSlot";
import { Avatar } from "@/components/ui/Avatar";
import { Field } from "@/components/ui/Field";
import { InputIcon } from "@/components/ui/InputIcon";
import { Toggle } from "@/components/ui/Toggle";
import { LocationTag } from "@/components/ui/location-tag";

export function SettingsPage() {
  const { currentUser } = useApp();
  const [form, setForm] = useState({
    name:  currentUser.name,
    email: currentUser.email || "you@company.com",
    phone: "+92 300 000 0000",
  });
  const [prefs, setPrefs] = useState({
    emailAlerts:          true,
    smsAlerts:            false,
    maintenanceReminders: true,
  });
  const [toast, showToast] = useToast();

  const updateForm  = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const updatePref  = (key) => (v) => setPrefs((p) => ({ ...p, [key]: v }));

  return (
    <div>
      <TopBarSlot title="Settings" subtitle="Manage your profile and notification preferences" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile */}
        <div
          className="lg:col-span-2 rounded-2xl border bg-white p-5 sm:p-6 wp-anim-up"
          style={{ borderColor: C.line }}
        >
          <p className="text-xs font-bold tracking-wide mb-5" style={{ color: C.amberDeep }}>
            PROFILE
          </p>

          <div className="flex items-center gap-4 mb-4">
            <Avatar name={form.name} size={64} hue={222} />
            <div>
              <p className="wp-display font-semibold text-base" style={{ color: C.text }}>{form.name}</p>
              <p className="text-sm" style={{ color: C.muted }}>{form.email}</p>
            </div>
          </div>

          <div className="mb-6">
            <LocationTag city="Riyadh" country="KSA" timezone="AST" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <Field label="Full name">
              <InputIcon icon={UserIcon}>
                <input value={form.name} onChange={updateForm("name")} className="w-full bg-transparent outline-none text-sm wp-body" style={{ color: C.text }} />
              </InputIcon>
            </Field>
            <Field label="Email">
              <InputIcon icon={Mail}>
                <input value={form.email} onChange={updateForm("email")} className="w-full bg-transparent outline-none text-sm wp-body" style={{ color: C.text }} />
              </InputIcon>
            </Field>
            <Field label="Phone">
              <InputIcon icon={Phone}>
                <input value={form.phone} onChange={updateForm("phone")} className="w-full bg-transparent outline-none text-sm wp-body" style={{ color: C.text }} />
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

        {/* Notification preferences */}
        <div
          className="rounded-2xl border bg-white p-5 sm:p-6 wp-anim-up"
          style={{ borderColor: C.line, animationDelay: "100ms" }}
        >
          <p className="text-xs font-bold tracking-wide mb-5" style={{ color: C.amberDeep }}>
            NOTIFICATION PREFERENCES
          </p>
          <div className="space-y-5">
            {[
              { key: "emailAlerts",          label: "Email alerts",          desc: "Allocation and status changes" },
              { key: "smsAlerts",            label: "SMS alerts",            desc: "Urgent fleet issues only"      },
              { key: "maintenanceReminders", label: "Maintenance reminders", desc: "Service due dates"            },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium" style={{ color: C.text }}>{label}</p>
                  <p className="text-xs" style={{ color: C.muted }}>{desc}</p>
                </div>
                <Toggle checked={prefs[key]} onChange={updatePref(key)} />
              </div>
            ))}
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
