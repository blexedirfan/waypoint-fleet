import { useRef, useState } from "react";
import { ImagePlus, Camera } from "lucide-react";
import { C } from "@/constants/tokens";

const MAX_BYTES = 2 * 1024 * 1024;

export function ImageUpload({ value, onChange, size = 96, shape = "circle", label }) {
  const inputRef = useRef(null);
  const [hover, setHover] = useState(false);
  const [error, setError] = useState("");

  const radius = shape === "circle" ? "50%" : 14;

  function openPicker() {
    inputRef.current?.click();
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image under 2MB.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Please choose an image under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setError("");
      onChange?.(reader.result);
    };
    reader.onerror = () => {
      setError("Please choose an image under 2MB.");
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="inline-flex flex-col items-start gap-1.5">
      <div
        role="button"
        tabIndex={0}
        title={value ? "Change photo" : "Add photo"}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="relative flex items-center justify-center shrink-0 cursor-pointer overflow-hidden"
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          background: value ? "transparent" : C.slateSoft,
          border: `1px solid ${C.line}`,
          transition: "box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease",
          boxShadow: hover ? "0 8px 20px -6px rgba(0,0,0,0.25)" : "none",
          transform: hover ? "translateY(-2px)" : "none",
        }}
      >
        {value ? (
          <img
            src={value}
            alt="Preview"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <ImagePlus size={size * 0.34} color={C.muted} strokeWidth={1.75} />
        )}

        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: "rgba(10,14,22,0.55)",
            opacity: hover ? 1 : 0,
            transition: "opacity 0.2s ease",
            pointerEvents: "none",
          }}
        >
          <Camera size={size * 0.3} color="#fff" strokeWidth={1.75} />
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: "hidden",
            clip: "rect(0,0,0,0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        />
      </div>

      {label && (
        <span className="text-xs font-medium" style={{ color: C.muted }}>
          {label}
        </span>
      )}

      {error && (
        <span className="text-xs font-medium" style={{ color: C.rose }}>
          {error}
        </span>
      )}
    </div>
  );
}
