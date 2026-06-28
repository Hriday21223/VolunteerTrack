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
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  pin           TEXT UNIQUE NOT NULL,
  contact_email TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
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
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public_task_signups (
  id              TEXT PRIMARY KEY,
  task_id         TEXT NOT NULL REFERENCES public_tasks(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  signed_up_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(task_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_public_tasks_status ON public_tasks(status);
CREATE INDEX IF NOT EXISTS idx_public_signups_task ON public_task_signups(task_id);
CREATE INDEX IF NOT EXISTS idx_public_signups_user ON public_task_signups(user_id);
`

// Idempotent: safe to run on every boot. Creates tables if missing.
export async function initSchema() {
  if (!hasDatabase()) return false
  await query(SCHEMA)
  return true
}
