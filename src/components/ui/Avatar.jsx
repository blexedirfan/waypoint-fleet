function initialsOf(name) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join("");
}

export function Avatar({ name, hue = 220, size = 44, src }) {
  const bg  = `hsl(${hue}, 62%, 50%)`;
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
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 8px 20px -4px ${bg}, 0 0 0 3px ${bg}55`;
        e.currentTarget.style.transform = "scale(1.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 6px 16px -6px ${bg}, 0 0 0 2px ${bg}30`;
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{
            width: size,
            height: size,
            objectFit: "cover",
            borderRadius: "50%",
          }}
        />
      ) : (
        initialsOf(name)
      )}
    </div>
  );
}
