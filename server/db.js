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
  role          TEXT NOT NULL CHECK (role IN ('admin','school','student')),
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  school_id     TEXT REFERENCES schools(id) ON DELETE SET NULL,
  grade         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS logs (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  activity   TEXT,
  category   TEXT,
  hours      NUMERIC NOT NULL DEFAULT 0,
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS goals (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label      TEXT,
  target     NUMERIC NOT NULL DEFAULT 0,
  period     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_school_id ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_logs_user_id    ON logs(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id   ON goals(user_id);
`

// Idempotent: safe to run on every boot. Creates tables if missing.
export async function initSchema() {
  if (!hasDatabase()) return false
  await query(SCHEMA)
  return true
}
