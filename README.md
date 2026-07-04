# Waypoint Fleet

A fleet management dashboard: sign in, view/edit vehicles and their assignments, manage notifications, and (as an admin) control what regular users are allowed to do. Backed by a real Express + PostgreSQL API — not just a frontend demo.

This document explains how the app is put together — specifically the **data layer** (services → hooks → context → pages, and now a real API + database underneath) — so anyone new to the codebase can find their way around.

---

## 1. Tech stack

**Frontend**
- **React 19** + **Vite** (dev server, build tool)
- **Tailwind CSS v4** for layout utilities, combined with inline `style={{...}}` using a small design-token object (`src/constants/tokens.js`) for colors — this app does **not** use Tailwind's color classes, only the `C` token object
- **Recharts** for the dashboard/reports charts
- **lucide-react** for icons
- No router — page switching is a plain string in React state (`page`), not URL-based

**Backend** (`server/`)
- **Express** — routing
- **PostgreSQL** via **`pg`** — real relational database, same engine locally (Docker) and in production (Render managed Postgres)
- **bcryptjs** — password hashing (pure JS, no native compilation)
- **jsonwebtoken** — issues/verifies the auth token
- **cors** — allows the Vite dev server to call the API cross-origin

## 2. Getting started

Requires Docker (for local Postgres) alongside Node.

```bash
npm install               # frontend deps (root)
npm --prefix server install   # backend deps
npm run dev:all           # brings up local Postgres (docker compose), then Vite (5173) + API (4000)
```

`npm run dev:all` is the one command you want day-to-day — it runs `npm run db:up` (starts the `docker-compose.yml` Postgres container) before starting both servers. Tables are created and seeded automatically on first boot — no manual migration step. Individually: `npm run dev` (frontend only) / `npm run dev:server` (backend only) / `npm run db:up` / `npm run db:down`.

```bash
npm run build     # production build (frontend)
npm run lint      # eslint
```

On Windows PowerShell, if `npm` is blocked by execution policy, use `npm.cmd` instead, or run:
`Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

## 3. Project structure

```
src/
├── App.jsx                    # Root component — composes all hooks, builds AppContext value
├── context/
│   └── AppContext.jsx         # Plain React context + useApp() accessor hook
├── services/                  # Talk to the real API over fetch() — see §5
│   ├── authService.js         # signUp / signIn / signOut / getSession
│   ├── profileService.js      # getProfile / updateProfile
│   ├── vehicleService.js      # getVehicles / createVehicle / updateVehicle / deleteVehicle
│   ├── permissionsService.js  # getPermissions / updatePermissions
│   └── notificationService.js # getNotifications / addNotification / toggleRead / markAllRead
├── hooks/                     # Wrap services, own loading/saving state — pages call these
│   ├── useAuth.js
│   ├── useProfile.js
│   ├── useVehicles.js
│   ├── usePermissions.js
│   ├── useNotifications.js
│   ├── useToast.js             # (UI-only, not data)
│   └── useStagger.js           # (UI-only, staggered animation delays)
├── lib/
│   ├── apiClient.js            # apiFetch() — attaches the JWT, throws on non-2xx; every service uses this
│   ├── relativeTime.js         # "2h ago"-style formatting for notification timestamps
│   ├── deviceLocation.js       # Derives city/region/timezone from the browser (Settings page)
│   └── utils.js                # `cn()` classname helper
├── components/
│   ├── auth/AuthScreen.jsx      # Sign in / sign up screen
│   ├── layout/
│   │   ├── AppShell.jsx         # Maps the `page` string to a page component
│   │   ├── Sidebar.jsx          # Left nav
│   │   └── TopBarSlot.jsx       # Shared page header (title, theme toggle, notif bell, account chip)
│   ├── pages/                   # One file per nav item (Dashboard, Vehicles, Allocations, People, Reports, Notifications, Settings)
│   ├── vehicles/VehicleForm.jsx # Shared add/edit vehicle form (used by Dashboard + Vehicles)
│   └── ui/                      # Reusable presentational primitives (Avatar, Modal, ImageUpload, Toggle, StatusBadge, etc.)
├── constants/
│   ├── data.js                  # Only used as an initial placeholder before the real fetch resolves
│   └── tokens.js                 # Color tokens (`C`), light/dark theme variables, global CSS/animations
└── main.jsx

server/                         # the real backend
└── src/
    ├── index.js                 # Express app: cors, json body parsing, mounts routes, listens on PORT
    ├── db.js                    # pg Pool + CREATE TABLE IF NOT EXISTS, seeds permissions + mock fleet
    ├── asyncHandler.js          # wraps async route handlers so thrown errors reach Express's error middleware
    ├── seedVehicles.js          # the same 5-vehicle demo fleet, ported from src/constants/data.js
    ├── middleware/auth.js       # requireAuth: verifies the Bearer JWT, attaches req.user = {id, role}
    └── routes/                  # auth.js, profile.js, vehicles.js, permissions.js, notifications.js

docker-compose.yml               # local Postgres container (matches production engine)
```

## 4. Architecture: the 3-layer data system

Every feature that touches data (auth, profile, vehicles, permissions, notifications) follows the **same three-layer pattern**:

```
Component/Page
      │  calls hook functions, reads hook state
      ▼
   Hook (src/hooks/*.js)
      │  owns React state (loading/saving/the data itself)
      │  calls service functions, updates local state with the result
      ▼
   Service (src/services/*.js)
      │  pure async functions — no React, no local state
      │  calls apiFetch() (src/lib/apiClient.js), which attaches the JWT
      ▼
   Express API (server/src/routes/*.js)
      │  requireAuth middleware, then real permission checks, then a query
      ▼
  PostgreSQL (docker-compose locally, Render managed Postgres in production)
```

This used to end at `localStorage` — every service now hits the real API instead, with the exact same function signatures, so nothing above the service layer changed when the backend was built.

**Why split hooks and services?** The service is the *only* thing that talks to the API — its function signatures and return shapes are a fixed contract. The hook layer (React state, loading flags) and every component above it never need to know or care that the backend changed from `localStorage` to a real server, because they only ever depend on the hook's public shape.

**Where hooks are called:** every hook above is called **exactly once**, in `App.jsx`. Their returned values (data + functions) are combined into one object (`ctx`) and passed down via `<AppContext.Provider value={ctx}>`. Every page/component reads from this single context via `useApp()` — no page calls a hook directly. This avoids duplicate/out-of-sync state (e.g. two independent `useAuth()` calls would each have their own copy of `user`).

Three hooks (`useVehicles`, `usePermissions`, `useNotifications`) take `isAuthenticated` as a parameter and only fetch once it's `true` — since the API now requires a valid session, fetching before login would just 401 and never retry.

## 5. The services (frontend) ↔ routes (backend)

Each file in `src/services/` has a `CONTRACT` comment at the top. All are `async` and call `apiFetch()` (`src/lib/apiClient.js`), which prepends `VITE_API_URL`, attaches `Authorization: Bearer <token>` from the one remaining `localStorage` key (`wp:token`), and throws `new Error(body.error)` on a non-2xx response — callers `catch` and display `.message` exactly as before (e.g. "Invalid email or password.", "An account with this email already exists.").

| Service | Backend route file | Functions |
|---|---|---|
| `authService.js` | `server/src/routes/auth.js` | `signUp({name,email,password})`, `signIn({email,password})`, `signOut()`, `getSession()` |
| `profileService.js` | `server/src/routes/profile.js` | `getProfile(userId)`, `updateProfile(userId, patch)` — `userId` is accepted for signature compatibility but unused; the server always acts on the caller identified by their JWT |
| `vehicleService.js` | `server/src/routes/vehicles.js` | `getVehicles()`, `createVehicle(data)`, `updateVehicle(id, patch)`, `deleteVehicle(id)` |
| `permissionsService.js` | `server/src/routes/permissions.js` | `getPermissions()`, `updatePermissions(patch)` |
| `notificationService.js` | `server/src/routes/notifications.js` | `getNotifications()`, `addNotification({title,desc,tone})`, `toggleRead(id)`, `markAllRead()` |

**Server-side enforcement, not just UI gating.** `PATCH /api/vehicles/:assetNo` diffs the request against the existing row and classifies which *changed* fields are "vehicle spec" vs "assignment" (same grouping as `VehicleForm.jsx`'s two sections), then checks `isAdmin || permissions.<flag>` for whichever group actually changed — a 403 from the API means the account genuinely isn't allowed to make that change, independent of what the UI shows. Same idea for add/delete (`membersCanAddVehicles`/`membersCanDeleteVehicles`) and for `PATCH /api/permissions` (admin-only, full stop).

`server/src/db.js` seeds the `vehicles` table from `server/src/seedVehicles.js` (a port of the old mock `VEHICLES` array) the first time it's empty, so a fresh database still boots with the same demo fleet.

## 6. The hooks

| Hook | Wraps | Returns |
|---|---|---|
| `useAuth()` | `authService` | `{ user, isAuthenticated, loading, signIn, signUp, signOut, setUser }` — restores the session from storage on mount |
| `useProfile(user, onChange)` | `profileService` | `{ profile, saving, updateProfile, updateAvatar }` — `onChange` is wired to `useAuth`'s `setUser` so the current user stays in sync after a profile edit |
| `useVehicles()` | `vehicleService` | `{ vehicles, loading, saving, updateVehicle, createVehicle, deleteVehicle }` |
| `usePermissions()` | `permissionsService` | `{ permissions, saving, updatePermissions }` |
| `useNotifications()` | `notificationService` | `{ notifications, unreadCount, addNotification, toggleRead, markAllRead }` |

`App.jsx` additionally wraps the vehicle mutators from `useVehicles()` so that every create/status-change/reassign/delete **automatically produces a notification** (see `handleCreateVehicle` / `handleUpdateVehicle` / `handleDeleteVehicle` in `App.jsx`) — this composition happens at the `App.jsx` level, not inside the hooks themselves, keeping `useVehicles`/`useNotifications` independently reusable.

## 7. Auth, roles, and permissions

- **Sign up / sign in** — `AuthScreen.jsx` calls `signIn`/`signUp` (passed down as props from `App.jsx`), catches thrown errors, and shows them inline. On success, the server returns `{ user, token }`; the frontend stores the JWT (`wp:token` in `localStorage`) and `App.jsx`'s `isAuthenticated` flips, rendering `<AppShell>`. The token is sent as `Authorization: Bearer <token>` on every subsequent request; `GET /api/auth/session` is what restores a session on page reload.
- **Roles** — every user has `role: "admin" | "member"`. The **very first account ever created** (when the `users` table is empty) automatically becomes `"admin"`; everyone after that is `"member"`. There's no invite/promotion flow beyond that — an admin can only be created by being first.
- **Permissions (the "admin decides" system)** — a single global (not per-user) row in the `permissions` table:
  ```js
  {
    membersCanEditVehicle: true,     // vehicle specs: model, type, color, fuel, notes, etc.
    membersCanEditAssignment: false, // owner, assigned-to, department, person details
    membersCanAddVehicles: false,
    membersCanDeleteVehicles: false,
  }
  ```
  Admins are **never** gated by these flags — they can always do everything. Every capability check in the UI follows the same pattern: `isAdmin || permissions.<flag>`. Admins toggle these for everyone else from **Settings → Member Permissions** (only visible to admins).
- **`VehicleForm.jsx`** (used by both the Dashboard "Edit vehicle" modal and the Vehicles page "Add vehicle" modal) takes `canEditVehicle`/`canEditAssignment` booleans as props — the caller computes them via the rule above; the form itself has no role/permission logic.

## 8. AppContext shape

Everything above is composed once in `App.jsx` into a single context value. Any component can do `const { ... } = useApp();` (from `src/context/AppContext.jsx`) to get:

```js
{
  // auth / profile
  currentUser, updateProfile, updateAvatar, savingProfile, isAdmin, logout,

  // permissions
  permissions, updatePermissions,

  // vehicles
  vehicles, updateVehicle, createVehicle, deleteVehicle, savingVehicle,
  selectedVehicleId, setSelectedVehicleId,

  // notifications
  notifications, unreadCount, toggleRead, markAllRead,

  // navigation / UI state
  page, setPage, mobileOpen, setMobileOpen, isDark, setIsDark,
}
```

## 9. Pages at a glance

| Page | File | Notes |
|---|---|---|
| Dashboard | `DashboardPage.jsx` | Shows the vehicle matching `selectedVehicleId`; "Edit vehicle" opens `VehicleForm` in a `Modal`; admins (or opted-in members) get a Delete button |
| Vehicles | `VehiclesPage.jsx` | Grid of all vehicles, search/status filter; "Add vehicle" gated by permissions |
| Allocations | `AllocationsPage.jsx` | Read-only table derived live from `vehicles` |
| People | `PeoplePage.jsx` | Read-only list, one entry per unique `person.employeeId`, derived live from `vehicles` |
| Reports | `ReportsPage.jsx` | Tiles + department bar chart, computed live from `vehicles` |
| Notifications | `NotificationsPage.jsx` | Event-driven feed (see §6); empty state when there's nothing yet |
| Settings | `SettingsPage.jsx` | Profile edit + avatar upload; "My Vehicle" nickname/photo; "Member Permissions" card (admin-only) |

Allocations, People, and Reports have **no local data of their own** — they all derive from the same live `vehicles` array, so any edit anywhere shows up everywhere immediately.

## 10. Database: PostgreSQL everywhere

Local dev and production both run real PostgreSQL — no SQLite anywhere anymore, so there's no dev/prod drift:

- **Local**: `docker-compose.yml` runs a `postgres:16-alpine` container; `npm run dev:all` starts it automatically (`npm run db:up`). Connection string lives in `server/.env` as `DATABASE_URL`.
- **Production (Render)**: `render.yaml` provisions a managed Postgres database alongside the API service and injects its connection string into the API's `DATABASE_URL` env var automatically (`fromDatabase`).
- **Schema**: `server/src/db.js` still owns the schema directly (`CREATE TABLE IF NOT EXISTS ...` + a couple of `information_schema`-checked migrations), run automatically on server boot — there's no separate migration tool yet. `database/schema.sql` is a stale early design doc (different column names/types, e.g. `seating_capacity` vs the `seating` actually used) and does **not** reflect the live schema; treat `db.js` as the source of truth, or delete/rewrite that file to match.
- **Route files unchanged in shape**: `server/src/db.js` exports a `db.prepare(sql).get/all/run(...)` adapter that rewrites `?` placeholders to Postgres's `$1, $2, ...` under the hood, so every route file's SQL text is identical to the old SQLite version — the only diff per route was adding `async`/`await` and wrapping handlers in `asyncHandler` (`server/src/asyncHandler.js`), since Express 4 doesn't catch rejected promises on its own.

## 11. Known limitations

- **Passwords are hashed** (bcrypt) — no longer plain text now that a real backend exists.
- **`database/schema.sql` is stale** — it predates the Postgres migration and uses different column names/types than what `server/src/db.js` actually creates. Don't run it against the database; update or remove it.
- **The JWT lives in `localStorage`**, not an `httpOnly` cookie — simpler to wire up (no cookie/CORS credential dance) but technically more exposed to XSS than a cookie-based session would be. Reasonable for this stage; revisit if this ever handles real user data.
- **Notifications are a single fleet-wide feed**, not scoped per-user — matches the frontend's original design, but means every signed-in account sees every notification. See the comment in `server/src/db.js` if you want to scope it later.
- `assetNo`/`id` on a vehicle is immutable after creation (it's the primary key referenced by `selectedVehicleId` and list keys throughout the app, and the actual database primary key too) — the Edit form intentionally shows it read-only.
- No automated tests yet.
