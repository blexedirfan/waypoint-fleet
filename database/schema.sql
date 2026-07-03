-- ============================================================================
-- Waypoint Fleet — database schema (PostgreSQL)
--
-- Mirrors the data shapes already promised by src/services/*.js's CONTRACT
-- comments, so the API layer built on top of this schema can satisfy those
-- contracts without changing anything in src/hooks or above.
--
-- Design notes:
--   - `vehicles.asset_no` is used as the natural primary key. The frontend
--     already treats it as immutable and as the record's `id` everywhere
--     (selectedVehicleId, list keys) — using it directly as the PK avoids a
--     surrogate-vs-natural-key mapping layer in the API.
--   - The assigned "person" fields stay flattened directly on `vehicles`
--     (person_*), matching vehicleService's Vehicle shape exactly. The
--     current UI (VehicleForm) edits owner/assignedTo/department and the
--     person_* fields as independent free-text inputs — there is no picker
--     that links a vehicle to a shared, reusable person record. See the
--     "Future normalization" note at the bottom before introducing a
--     separate `people` table.
--   - `permissions` is a single global config row, not per-user — matches
--     permissionsService's contract (admins configure it for everyone).
--   - `notifications.user_id` is nullable on purpose — see the note above
--     that table. The current frontend has no per-user notification
--     scoping; decide before launch whether that's the real model you want.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- for gen_random_uuid()

-- ----------------------------------------------------------------------------
-- users  ·  backs authService.js + profileService.js
-- ----------------------------------------------------------------------------
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(120)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash TEXT          NOT NULL,          -- hash it server-side; never store plain text
  phone         VARCHAR(40),
  avatar_url    TEXT,                             -- URL to uploaded avatar (blob storage), not base64
  role          VARCHAR(10)   NOT NULL DEFAULT 'member'
                CHECK (role IN ('admin', 'member')),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- The "first account ever created becomes admin" rule (authService.signUp)
-- is application logic, not a DB constraint — enforce it in the API handler
-- by checking `SELECT count(*) FROM users` before the insert.

-- ----------------------------------------------------------------------------
-- vehicles  ·  backs vehicleService.js
-- ----------------------------------------------------------------------------
CREATE TABLE vehicles (
  asset_no          VARCHAR(40)  PRIMARY KEY,     -- e.g. "ARV-24-791" — set once at creation, never edited
  model             VARCHAR(120) NOT NULL,
  type              VARCHAR(60)  NOT NULL,         -- free text (Sedan/SUV/EV/Pickup/...), not an enum —
                                                    -- the UI's illustration falls back gracefully on unknown values
  model_year        SMALLINT,
  allocation_month  DATE,                          -- render as "Jun-24" client-side
  engine_cc         INTEGER,                       -- NULL = "—" in the UI (e.g. electric vehicles)
  color             VARCHAR(40),
  color_hex         CHAR(7),                        -- e.g. "#EDEFF4"
  fuel_type         VARCHAR(40),                    -- free text, not an enum (matches the edit form)
  transmission      VARCHAR(40),                    -- free text, not an enum (matches the edit form)
  seating_capacity  SMALLINT,                        -- render as "{n} Seater" client-side
  status            VARCHAR(20) NOT NULL DEFAULT 'Active'
                    CHECK (status IN ('Active', 'Maintenance', 'Inactive')),

  -- assignment (free text — see design note above; no FK to a people table today)
  owner             VARCHAR(120),
  assigned_to       VARCHAR(120),                  -- NULL → render "Unassigned" client-side
  department        VARCHAR(120),
  allocated_on      DATE,
  notes             TEXT,

  -- user-editable extras added after the initial mock data
  nickname          VARCHAR(80),
  photo_url         TEXT,                            -- uploaded vehicle photo (blob storage URL), not base64

  -- the assigned person's contact card, shown on the Dashboard's "Person Details" panel
  person_name         VARCHAR(120),
  person_title        VARCHAR(120),
  person_department   VARCHAR(120),
  person_office       VARCHAR(120),
  person_employee_id  VARCHAR(40),
  person_email        VARCHAR(255),
  person_contact      VARCHAR(60),
  person_hue          SMALLINT,                      -- 0-360, seeds the Avatar component's gradient color

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vehicles_status              ON vehicles (status);
CREATE INDEX idx_vehicles_department           ON vehicles (department);
CREATE INDEX idx_vehicles_person_employee_id   ON vehicles (person_employee_id);
-- ^ used by the People page, which de-duplicates vehicles into one row per
--   unique person_employee_id (see src/components/pages/PeoplePage.jsx)

-- ----------------------------------------------------------------------------
-- permissions  ·  backs permissionsService.js — a single global config row
-- ----------------------------------------------------------------------------
CREATE TABLE permissions (
  id                          INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- enforces exactly one row
  members_can_edit_vehicle    BOOLEAN NOT NULL DEFAULT true,
  members_can_edit_assignment BOOLEAN NOT NULL DEFAULT false,
  members_can_add_vehicles    BOOLEAN NOT NULL DEFAULT false,
  members_can_delete_vehicles BOOLEAN NOT NULL DEFAULT false,
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO permissions (id) VALUES (1); -- seed the single row with defaults

-- ----------------------------------------------------------------------------
-- notifications  ·  backs notificationService.js
-- ----------------------------------------------------------------------------
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(160) NOT NULL,
  description TEXT         NOT NULL,               -- "desc" is a reserved word in some SQL dialects
  tone        VARCHAR(10)  NOT NULL CHECK (tone IN ('good', 'warn', 'muted')),
  read        BOOLEAN      NOT NULL DEFAULT false,
  user_id     UUID         REFERENCES users(id) ON DELETE CASCADE, -- NULL = fleet-wide broadcast; see note below
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_unread ON notifications (user_id, read);

-- OPEN DECISION for whoever wires up the real API:
-- Today's frontend has no per-user notification scoping — every signed-in
-- user in one browser session sees the same list. Decide before launch:
--   (a) Personal feed  — set user_id on every insert, filter WHERE user_id = :current_user
--       (a member shouldn't see activity on vehicles they can't access)
--   (b) Fleet-wide feed — leave user_id NULL always, everyone sees everything
--       (matches current frontend behavior exactly, simplest to ship first)
-- (b) is the faithful default if you want zero frontend changes at launch;
-- (a) is very likely what you actually want once real multi-tenant auth exists.

-- ============================================================================
-- Future normalization (not needed for the current API contract)
-- ============================================================================
-- If the People page grows from a read-only derived list into a real
-- management screen — reassigning a vehicle to an existing person via a
-- picker, rather than retyping their details — extract a `people` table:
--
--   CREATE TABLE people (
--     id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     employee_id  VARCHAR(40) UNIQUE NOT NULL,
--     name         VARCHAR(120) NOT NULL,
--     title        VARCHAR(120),
--     department   VARCHAR(120),
--     office       VARCHAR(120),
--     email        VARCHAR(255),
--     contact      VARCHAR(60),
--     hue          SMALLINT
--   );
--
-- ...and replace vehicles.person_* with `person_id UUID REFERENCES people(id)`.
-- This is a real migration (backfill people from existing vehicle rows,
-- dedupe by employee_id) — don't do it speculatively before the picker UI
-- that would actually use it exists.
