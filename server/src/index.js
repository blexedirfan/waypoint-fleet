import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { profileRouter } from "./routes/profile.js";
import { vehiclesRouter } from "./routes/vehicles.js";
import { permissionsRouter } from "./routes/permissions.js";
import { notificationsRouter } from "./routes/notifications.js";

const app = express();

// Accept both localhost and 127.0.0.1 (and whatever CORS_ORIGIN adds) — a
// mismatch here (e.g. the page opened via 127.0.0.1 while this only allowed
// localhost) is the single most common cause of a browser-side
// "Failed to fetch" in local dev, since a blocked CORS response makes
// fetch() reject with that generic error.
const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim()) : []),
]);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
}));
// Default body-parser limit is 100kb — way too small for a base64-encoded
// photo (ImageUpload.jsx allows up to 2MB raw, ~2.7MB once base64-encoded).
// Without this, any real photo/avatar upload gets rejected outright.
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/vehicles", vehiclesRouter);
app.use("/api/permissions", permissionsRouter);
app.use("/api/notifications", notificationsRouter);

app.get("/api/health", (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Waypoint Fleet API listening on http://localhost:${port}`);
});
