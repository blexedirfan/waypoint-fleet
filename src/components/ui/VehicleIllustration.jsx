import { Car, Truck, Zap, Bus } from "lucide-react";

const VEHICLE_ICONS = {
  Sedan:  Car,
  SUV:    Car,
  Pickup: Truck,
  EV:     Zap,
  Raya:   Bus,
};

export function VehicleIllustration({ type = "Sedan", colorHex = "#C7CBD4", size = 300 }) {
  const Icon     = VEHICLE_ICONS[type] || Car;
  const tint     = colorHex === "#23262E" ? "#6B7A90" : colorHex;
  const iconSize = Math.round(size * 0.38);
  const h        = Math.round(size * 0.5);

  return (
    <div
      style={{
        width: size,
        height: h,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "75%",
          height: "90%",
          borderRadius: "50%",
          background: `radial-gradient(ellipse at 50% 60%, ${tint}38 0%, transparent 72%)`,
          pointerEvents: "none",
        }}
      />
      <Icon
        size={iconSize}
        color={tint}
        strokeWidth={1.25}
        style={{ filter: `drop-shadow(0 6px 18px ${tint}55)` }}
      />
    </div>
  );
}
