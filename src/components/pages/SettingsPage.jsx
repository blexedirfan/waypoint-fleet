import { useState } from "react";
import { User as UserIcon, Mail, Phone, Tag, CheckCircle2 } from "lucide-react";
import { C } from "@/constants/tokens";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/useToast";
import { TopBarSlot } from "@/components/layout/TopBarSlot";
import { Field } from "@/components/ui/Field";
import { InputIcon } from "@/components/ui/InputIcon";
import { Toggle } from "@/components/ui/Toggle";
import { LocationTag } from "@/components/ui/location-tag";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { getDeviceLocation } from "@/lib/deviceLocation";

export function SettingsPage() {
  const {
    currentUser,
    updateProfile,
    updateAvatar,
    savingProfile,
    vehicles,
    updateVehicle,
    savingVehicle,
    isAdmin,
    permissions,
    updatePermissions,
  } = useApp();

  const vehicle = vehicles.find((v) => v.createdBy === currentUser.id);
  const deviceLocation = getDeviceLocation();

  const [form, setForm] = useState({
    name:  currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone || "",
  });
  const [prefs, setPrefs] = useState({
    emailAlerts:          true,
    smsAlerts:            false,
    maintenanceReminders: true,
  });
  const [nickname, setNickname] = useState(vehicle?.nickname || "");
  const [toast, showToast] = useToast();

  const updateForm  = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const updatePref  = (key) => (v) => setPrefs((p) => ({ ...p, [key]: v }));

  const saveProfile = async () => {
    try {
      await updateProfile({ name: form.name, email: form.email, phone: form.phone });
      showToast("Profile settings saved");
    } catch (e) {
      showToast(e.message || "Could not save profile");
    }
  };

  const saveNickname = async () => {
    try {
      await updateVehicle(vehicle.id, { nickname });
      showToast("Vehicle updated");
    } catch (e) {
      showToast(e.message || "Could not save vehicle");
    }
  };

  const togglePermission = (key) => async (value) => {
    try {
      await updatePermissions({ [key]: value });
      showToast("Permissions updated");
    } catch (e) {
      showToast(e.message || "Could not update permissions");
    }
  };

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
            <ImageUpload value={currentUser.avatar} onChange={updateAvatar} size={64} shape="circle" label="Profile photo" />
            <div>
              <p className="wp-display font-semibold text-base" style={{ color: C.text }}>{form.name}</p>
              <p className="text-sm" style={{ color: C.muted }}>{form.email}</p>
            </div>
          </div>

          <div className="mb-6">
            <LocationTag city={deviceLocation.city} region={deviceLocation.region} timeZone={deviceLocation.timeZone} />
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
            onClick={saveProfile}
            disabled={savingProfile}
            className="mt-4 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${C.amber}, ${C.amberDeep})` }}
          >
            {savingProfile ? "Saving..." : "Save changes"}
          </button>
        </div>

        {/* My vehicle — only shown if the signed-in account actually owns one */}
        {vehicle && (
        <div
          className="rounded-2xl border bg-white p-5 sm:p-6 wp-anim-up"
          style={{ borderColor: C.line, animationDelay: "50ms" }}
        >
          <p className="text-xs font-bold tracking-wide mb-5" style={{ color: C.amberDeep }}>
            MY VEHICLE
          </p>

          <div className="flex items-center gap-4 mb-4">
            <ImageUpload
              value={vehicle.photo}
              onChange={(dataUrl) => updateVehicle(vehicle.id, { photo: dataUrl })}
              size={96}
              shape="rounded"
              label="Vehicle photo"
            />
            <div>
              <p className="wp-display font-semibold text-base" style={{ color: C.text }}>{vehicle.nickname || vehicle.model}</p>
              <p className="text-sm" style={{ color: C.muted }}>{vehicle.model} · {vehicle.assetNo}</p>
            </div>
          </div>

          <Field label="Nickname">
            <InputIcon icon={Tag}>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. My Sonata"
                className="w-full bg-transparent outline-none text-sm wp-body"
                style={{ color: C.text }}
              />
            </InputIcon>
          </Field>

          <button
            onClick={saveNickname}
            disabled={savingVehicle}
            className="mt-4 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${C.amber}, ${C.amberDeep})` }}
          >
            {savingVehicle ? "Saving..." : "Save changes"}
          </button>
        </div>
        )}

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

        {/* Member permissions (admin only) */}
        {isAdmin && (
          <div
            className="lg:col-span-3 rounded-2xl border bg-white p-5 sm:p-6 wp-anim-up"
            style={{ borderColor: C.line, animationDelay: "150ms" }}
          >
            <p className="text-xs font-bold tracking-wide mb-1" style={{ color: C.amberDeep }}>
              MEMBER PERMISSIONS
            </p>
            <p className="text-sm mb-5" style={{ color: C.muted }}>
              Control what non-admin accounts can do.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              {[
                { key: "membersCanEditVehicle",     label: "Edit vehicle specs",    desc: "Model, type, color, fuel, notes, etc." },
                { key: "membersCanEditAssignment",  label: "Edit assignment info",  desc: "Owner, assigned-to, department, person details" },
                { key: "membersCanAddVehicles",     label: "Add vehicles",          desc: "Create new vehicles in the fleet" },
                { key: "membersCanDeleteVehicles",  label: "Delete vehicles",       desc: "Remove a vehicle from the fleet permanently" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium" style={{ color: C.text }}>{label}</p>
                    <p className="text-xs" style={{ color: C.muted }}>{desc}</p>
                  </div>
                  <Toggle checked={permissions[key]} onChange={togglePermission(key)} />
                </div>
              ))}
            </div>
          </div>
        )}
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
