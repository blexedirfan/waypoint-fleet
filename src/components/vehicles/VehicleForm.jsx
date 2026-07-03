import { useState } from "react";
import {
  Car,
  Layers,
  CalendarDays,
  Hash,
  Calendar,
  Gauge,
  Palette,
  Fuel,
  Settings2,
  Armchair,
  FileText,
  UserCircle2,
  Users,
  Building2,
  Mail,
  Phone,
  Tag,
} from "lucide-react";
import { C } from "@/constants/tokens";
import { Field } from "@/components/ui/Field";
import { InputIcon } from "@/components/ui/InputIcon";
import { ImageUpload } from "@/components/ui/ImageUpload";

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <span className="text-xs font-medium mb-1.5 block" style={{ color: C.muted }}>
        {label}
      </span>
      <p className="text-sm px-3.5 py-2.5" style={{ color: C.text }}>
        {value || "—"}
      </p>
    </div>
  );
}

function SectionHeader({ children }) {
  return (
    <p className="text-xs font-bold tracking-wide mb-3 mt-6 first:mt-0" style={{ color: C.amberDeep }}>
      {children}
    </p>
  );
}

const emptyVehicle = {
  assetNo: "",
  model: "",
  type: "",
  modelYear: "",
  month: "",
  engineCC: "",
  color: "",
  colorHex: "#C7CBD4",
  fuelType: "Petrol",
  transmission: "Automatic",
  seating: "",
  status: "Active",
  notes: "",
  photo: "",
  owner: "",
  assignedTo: "",
  department: "",
  allocatedOn: "",
  person: {
    name: "",
    title: "",
    department: "",
    office: "",
    employeeId: "",
    email: "",
    contact: "",
    hue: 220,
  },
};

export function VehicleForm({
  initialValues,
  canEditVehicle,
  canEditAssignment,
  canEditPhoto,
  onSubmit,
  onCancel,
  submitLabel = "Save changes",
  isCreate = false,
  photoRequired = false,
  hideCancel = false,
}) {
  const [form, setForm] = useState(() => ({
    ...emptyVehicle,
    ...initialValues,
    person: { ...emptyVehicle.person, ...(initialValues?.person || {}) },
  }));
  const [photoError, setPhotoError] = useState("");

  const editVehicle = isCreate || canEditVehicle;
  const editAssignment = isCreate || canEditAssignment;
  // Photo follows ownership independent of the membersCanEditVehicle flag
  // (matches the backend's rule) — falls back to canEditVehicle only if the
  // caller didn't pass it explicitly, for backward compatibility.
  const editPhoto = isCreate || (canEditPhoto ?? canEditVehicle);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setPerson = (key) => (e) => setForm((f) => ({ ...f, person: { ...f.person, [key]: e.target.value } }));
  const setPhoto = (dataUrl) => { setForm((f) => ({ ...f, photo: dataUrl })); setPhotoError(""); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (photoRequired && !form.photo) {
      setPhotoError("A vehicle photo is required.");
      return;
    }
    const data = { ...form };
    if (!isCreate) delete data.assetNo;
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {isCreate && (
        <>
          <SectionHeader>NEW VEHICLE</SectionHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Asset No. (required)">
              <InputIcon icon={Hash}>
                <input
                  required
                  value={form.assetNo}
                  onChange={set("assetNo")}
                  placeholder="ARV-24-001"
                  className="w-full bg-transparent outline-none text-sm wp-body wp-mono"
                  style={{ color: C.text }}
                />
              </InputIcon>
            </Field>
          </div>
        </>
      )}

      <SectionHeader>VEHICLE</SectionHeader>

      <div className="mb-4">
        {editPhoto ? (
          <div className="flex items-center gap-3">
            <ImageUpload
              value={form.photo}
              onChange={setPhoto}
              size={80}
              shape="rounded"
              label={photoRequired ? "Vehicle photo (required)" : "Vehicle photo"}
            />
            {photoError && <span className="text-xs font-medium" style={{ color: C.rose }}>{photoError}</span>}
          </div>
        ) : form.photo ? (
          <div>
            <span className="text-xs font-medium mb-1.5 block" style={{ color: C.muted }}>Vehicle photo</span>
            <img src={form.photo} alt={form.model} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 14 }} />
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {editVehicle ? (
          <>
            <Field label="Model">
              <InputIcon icon={Layers}>
                <input value={form.model} onChange={set("model")} className="w-full bg-transparent outline-none text-sm wp-body" style={{ color: C.text }} />
              </InputIcon>
            </Field>
            <Field label="Type">
              <InputIcon icon={Car}>
                <input value={form.type} onChange={set("type")} placeholder="Sedan / SUV / EV / Pickup" className="w-full bg-transparent outline-none text-sm wp-body" style={{ color: C.text }} />
              </InputIcon>
            </Field>
            <Field label="Model Year">
              <InputIcon icon={CalendarDays}>
                <input value={form.modelYear} onChange={set("modelYear")} className="w-full bg-transparent outline-none text-sm wp-body" style={{ color: C.text }} />
              </InputIcon>
            </Field>
            <Field label="Month">
              <InputIcon icon={Calendar}>
                <input value={form.month} onChange={set("month")} placeholder="Jun-24" className="w-full bg-transparent outline-none text-sm wp-body" style={{ color: C.text }} />
              </InputIcon>
            </Field>
            <Field label="Engine / CC">
              <InputIcon icon={Gauge}>
                <input value={form.engineCC} onChange={set("engineCC")} className="w-full bg-transparent outline-none text-sm wp-body" style={{ color: C.text }} />
              </InputIcon>
            </Field>
            <Field label="Seating Capacity">
              <InputIcon icon={Armchair}>
                <input value={form.seating} onChange={set("seating")} placeholder="5 Seater" className="w-full bg-transparent outline-none text-sm wp-body" style={{ color: C.text }} />
              </InputIcon>
            </Field>
            <Field label="Color">
              <InputIcon icon={Palette}>
                <input value={form.color} onChange={set("color")} className="w-full bg-transparent outline-none text-sm wp-body" style={{ color: C.text }} />
                <input
                  type="color"
                  value={form.colorHex}
                  onChange={set("colorHex")}
                  className="shrink-0 h-6 w-8 rounded cursor-pointer border-0"
                />
              </InputIcon>
            </Field>
            <Field label="Fuel Type">
              <InputIcon icon={Fuel}>
                <input value={form.fuelType} onChange={set("fuelType")} placeholder="Petrol / Diesel / Electric" className="w-full bg-transparent outline-none text-sm wp-body" style={{ color: C.text }} />
              </InputIcon>
            </Field>
            <Field label="Transmission">
              <InputIcon icon={Settings2}>
                <input value={form.transmission} onChange={set("transmission")} placeholder="Automatic / Manual" className="w-full bg-transparent outline-none text-sm wp-body" style={{ color: C.text }} />
              </InputIcon>
            </Field>
            <Field label="Status">
              <InputIcon icon={Car}>
                <select
                  value={form.status}
                  onChange={set("status")}
                  className="w-full bg-transparent outline-none text-sm wp-body"
                  style={{ color: C.text }}
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </InputIcon>
            </Field>
          </>
        ) : (
          <>
            <ReadOnlyField label="Model" value={form.model} />
            <ReadOnlyField label="Type" value={form.type} />
            <ReadOnlyField label="Model Year" value={form.modelYear} />
            <ReadOnlyField label="Month" value={form.month} />
            <ReadOnlyField label="Engine / CC" value={form.engineCC} />
            <ReadOnlyField label="Seating Capacity" value={form.seating} />
            <ReadOnlyField label="Color" value={form.color} />
            <ReadOnlyField label="Fuel Type" value={form.fuelType} />
            <ReadOnlyField label="Transmission" value={form.transmission} />
            <ReadOnlyField label="Status" value={form.status} />
          </>
        )}
      </div>

      {editVehicle ? (
        <div className="mt-4">
          <Field label="Notes">
            <div className="flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 wp-input-glow" style={{ borderColor: C.line, backgroundColor: C.card }}>
              <FileText size={16} className="mt-0.5 shrink-0" style={{ color: C.muted }} />
              <textarea
                value={form.notes}
                onChange={set("notes")}
                rows={3}
                className="w-full bg-transparent outline-none text-sm wp-body resize-none"
                style={{ color: C.text }}
              />
            </div>
          </Field>
        </div>
      ) : (
        <div className="mt-4">
          <ReadOnlyField label="Notes" value={form.notes} />
        </div>
      )}

      <SectionHeader>ASSIGNMENT</SectionHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {editAssignment ? (
          <>
            <Field label="Owner">
              <InputIcon icon={UserCircle2}>
                <input value={form.owner} onChange={set("owner")} className="w-full bg-transparent outline-none text-sm wp-body" style={{ color: C.text }} />
              </InputIcon>
            </Field>
            <Field label="Assigned To">
              <InputIcon icon={Users}>
                <input value={form.assignedTo} onChange={set("assignedTo")} className="w-full bg-transparent outline-none text-sm wp-body" style={{ color: C.text }} />
              </InputIcon>
            </Field>
            <Field label="Department">
              <InputIcon icon={Building2}>
                <input value={form.department} onChange={set("department")} className="w-full bg-transparent outline-none text-sm wp-body" style={{ color: C.text }} />
              </InputIcon>
            </Field>
            <Field label="Allocated On">
              <InputIcon icon={Calendar}>
                <input value={form.allocatedOn} onChange={set("allocatedOn")} placeholder="Jun-24" className="w-full bg-transparent outline-none text-sm wp-body" style={{ color: C.text }} />
              </InputIcon>
            </Field>
            <Field label="Person Name">
              <InputIcon icon={UserCircle2}>
                <input value={form.person.name} onChange={setPerson("name")} className="w-full bg-transparent outline-none text-sm wp-body" style={{ color: C.text }} />
              </InputIcon>
            </Field>
            <Field label="Designation">
              <InputIcon icon={UserCircle2}>
                <input value={form.person.title} onChange={setPerson("title")} className="w-full bg-transparent outline-none text-sm wp-body" style={{ color: C.text }} />
              </InputIcon>
            </Field>
            <Field label="Person Department">
              <InputIcon icon={Building2}>
                <input value={form.person.department} onChange={setPerson("department")} className="w-full bg-transparent outline-none text-sm wp-body" style={{ color: C.text }} />
              </InputIcon>
            </Field>
            <Field label="Office">
              <InputIcon icon={Building2}>
                <input value={form.person.office} onChange={setPerson("office")} className="w-full bg-transparent outline-none text-sm wp-body" style={{ color: C.text }} />
              </InputIcon>
            </Field>
            <Field label="Employee ID">
              <InputIcon icon={Tag}>
                <input value={form.person.employeeId} onChange={setPerson("employeeId")} className="w-full bg-transparent outline-none text-sm wp-body wp-mono" style={{ color: C.text }} />
              </InputIcon>
            </Field>
            <Field label="Email">
              <InputIcon icon={Mail}>
                <input value={form.person.email} onChange={setPerson("email")} className="w-full bg-transparent outline-none text-sm wp-body" style={{ color: C.text }} />
              </InputIcon>
            </Field>
            <Field label="Contact">
              <InputIcon icon={Phone}>
                <input value={form.person.contact} onChange={setPerson("contact")} className="w-full bg-transparent outline-none text-sm wp-body" style={{ color: C.text }} />
              </InputIcon>
            </Field>
          </>
        ) : (
          <>
            <ReadOnlyField label="Owner" value={form.owner} />
            <ReadOnlyField label="Assigned To" value={form.assignedTo} />
            <ReadOnlyField label="Department" value={form.department} />
            <ReadOnlyField label="Allocated On" value={form.allocatedOn} />
            <ReadOnlyField label="Person Name" value={form.person.name} />
            <ReadOnlyField label="Designation" value={form.person.title} />
            <ReadOnlyField label="Person Department" value={form.person.department} />
            <ReadOnlyField label="Office" value={form.person.office} />
            <ReadOnlyField label="Employee ID" value={form.person.employeeId} />
            <ReadOnlyField label="Email" value={form.person.email} />
            <ReadOnlyField label="Contact" value={form.person.contact} />
          </>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 mt-6">
        {!hideCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold wp-btn-ghost border"
            style={{ borderColor: C.line, color: C.text }}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
          style={{ background: `linear-gradient(135deg, ${C.amber}, ${C.amberDeep})` }}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
