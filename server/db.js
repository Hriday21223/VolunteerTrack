import pg from 'pg'

const { Pool } = pg

// Single shared pool. DATABASE_URL is required for the server-backed features
// (accounts, school dashboards). When it is unset the server still boots and
// the email-only endpoints keep working, but the data API returns 503.
let pool = null

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL)
}

export function getPool() {
  if (!hasDatabase()) return null
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Managed Postgres (Render/Neon/etc.) requires TLS; local dev does not.
      ssl: process.env.PGSSL === 'disable' ? false : { rejectUnauthorized: false },
    })
  }
  return pool
}

export async function query(text, params) {
  const p = getPool()
  if (!p) throw new Error('DATABASE_URL is not configured.')
  return p.query(text, params)
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS schools (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  pin             TEXT UNIQUE NOT NULL,
  contact_email   TEXT,
  payment_status  TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('paid','unpaid')),
  payment_notes   TEXT,
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  role          TEXT NOT NULL CHECK (role IN ('admin','school','student','volunteer')),
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  school_id     TEXT REFERENCES schools(id) ON DELETE SET NULL,
  grade         TEXT,
  sync_pin      TEXT UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS logs (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  activity    TEXT,
  category    TEXT,
  hours       NUMERIC NOT NULL DEFAULT 0,
  notes       TEXT,
  verified_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS goals (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label      TEXT,
  target     NUMERIC NOT NULL DEFAULT 0,
  period     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pdf_uploads (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school_id     TEXT REFERENCES schools(id) ON DELETE SET NULL,
  filename      TEXT NOT NULL,
  file_data     TEXT NOT NULL,
  file_type     TEXT NOT NULL DEFAULT 'application/pdf',
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  notes         TEXT,
  reviewed_by   TEXT REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_school_id ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_logs_user_id    ON logs(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id   ON goals(user_id);
CREATE TABLE IF NOT EXISTS public_tasks (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  location        TEXT NOT NULL,
  date            DATE NOT NULL,
  time            TEXT,
  slots_total     INTEGER NOT NULL DEFAULT 1,
  created_by      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_name    TEXT,
  creator_email   TEXT,
  phone           TEXT,
  latitude        DECIMAL(10,7),
  longitude       DECIMAL(10,7),
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public_task_signups (
  id              TEXT PRIMARY KEY,
  task_id         TEXT NOT NULL REFERENCES public_tasks(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  signed_up_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(task_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_public_tasks_status ON public_tasks(status);
CREATE INDEX IF NOT EXISTS idx_public_signups_task ON public_task_signups(task_id);
CREATE INDEX IF NOT EXISTS idx_public_signups_user ON public_task_signups(user_id);

CREATE TABLE IF NOT EXISTS school_messages (
  id          TEXT PRIMARY KEY,
  school_id   TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  sender_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_name TEXT,
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_school_messages_school ON school_messages(school_id, created_at DESC);

CREATE TABLE IF NOT EXISTS admin_notifications (
  id          TEXT PRIMARY KEY,
  school_id   TEXT REFERENCES schools(id) ON DELETE CASCADE,
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
`

// Idempotent: safe to run on every boot. Creates tables if missing.
export async function initSchema() {
  if (!hasDatabase()) return false
  await query(SCHEMA)
  // Migration: add columns that may not exist on older databases
  try { await query(`ALTER TABLE public_tasks ADD COLUMN IF NOT EXISTS phone TEXT`) } catch {}
  try { await query(`ALTER TABLE public_task_signups ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected'))`) } catch {}
  try { await query(`ALTER TABLE public_tasks ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,7)`) } catch {}
  try { await query(`ALTER TABLE public_tasks ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,7)`) } catch {}
  try { await query(`ALTER TABLE schools ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid'`) } catch {}
  try { await query(`ALTER TABLE schools ADD COLUMN IF NOT EXISTS payment_notes TEXT`) } catch {}
  try { await query(`ALTER TABLE schools ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ`) } catch {}
  try { await query(`ALTER TABLE schools ADD COLUMN IF NOT EXISTS payment_due_date DATE`) } catch {}
  try { await query(`ALTER TABLE admin_notifications ADD COLUMN IF NOT EXISTS school_id TEXT REFERENCES schools(id) ON DELETE CASCADE`) } catch {}
  // 2FA columns
  try { await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret TEXT`) } catch {}
  try { await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN NOT NULL DEFAULT false`) } catch {}
  try { await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS backup_codes TEXT`) } catch {}
  return true
}
