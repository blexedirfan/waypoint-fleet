import { useState } from "react";
import { MapPin } from "lucide-react";
import { C } from "@/constants/tokens";
import { VehicleForm } from "@/components/vehicles/VehicleForm";

export function AddVehicleOnboarding({ currentUser, createVehicle }) {
  const [error, setError] = useState("");

  const handleSubmit = async (data) => {
    try {
      await createVehicle(data);
    } catch (e) {
      setError(e.message || "Could not add your vehicle.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-start sm:items-center justify-center wp-body py-10 px-4" style={{ backgroundColor: C.paper }}>
      <div className="w-full" style={{ maxWidth: 720 }}>
        <div className="flex items-center gap-2.5 mb-6 justify-center">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: `linear-gradient(135deg, ${C.amber}, ${C.amberDeep})` }}
          >
            <MapPin size={18} color="#fff" strokeWidth={2.4} />
          </div>
          <span className="wp-display text-lg font-semibold" style={{ color: C.text }}>Waypoint</span>
        </div>

        <div className="rounded-2xl border bg-white p-6 sm:p-8 wp-anim-up" style={{ borderColor: C.line }}>
          <h1 className="wp-display text-2xl font-semibold mb-1" style={{ color: C.text }}>
            Welcome, {currentUser.name.split(" ")[0]} — add your vehicle
          </h1>
          <p className="text-sm mb-6" style={{ color: C.muted }}>
            Before you can access the fleet dashboard, tell us about your vehicle and add a photo. You can edit these details any time from Settings.
          </p>

          {error && (
            <p className="text-xs font-medium rounded-lg px-3 py-2 mb-4 wp-anim-in" style={{ color: C.rose, backgroundColor: C.roseSoft }}>
              {error}
            </p>
          )}

          <VehicleForm
            isCreate
            photoRequired
            initialValues={{
              status: "Active",
              fuelType: "Petrol",
              transmission: "Automatic",
              owner: currentUser.name,
              assignedTo: currentUser.name,
              person: { name: currentUser.name, email: currentUser.email },
            }}
            canEditVehicle
            canEditAssignment
            hideCancel
            submitLabel="Add my vehicle"
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
