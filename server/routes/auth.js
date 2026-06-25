import express from 'express'
import { query, hasDatabase } from '../db.js'
import { uid } from '../ids.js'
import { hashPassword, verifyPassword, signToken, requireAuth } from '../auth.js'

const router = express.Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function publicUser(row) {
  return {
    id: row.id,
    role: row.role,
    name: row.name,
    email: row.email,
    schoolId: row.school_id,
    grade: row.grade,
    createdAt: row.created_at,
  }
}

function requireDb(_req, res, next) {
  if (!hasDatabase()) {
    return res.status(503).json({ error: 'Server database is not configured.' })
  }
  next()
}

// Public self-registration always creates a student account. School and admin
// accounts are provisioned by an admin (later phases).
router.post('/register', requireDb, async (req, res) => {
  const name = String(req.body.name || '').trim()
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')
  const grade = String(req.body.grade || '').trim()

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' })
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Enter a valid email address.' })
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' })
  }

  try {
    const existing = await query('SELECT 1 FROM users WHERE email = $1', [email])
    if (existing.rowCount > 0) {
      return res.status(409).json({ error: 'An account with that email already exists.' })
    }
    const hash = await hashPassword(password)
    const id = uid('usr')
    const { rows } = await query(
      `INSERT INTO users (id, role, name, email, password_hash, grade)
       VALUES ($1, 'student', $2, $3, $4, $5)
       RETURNING *`,
      [id, name, email, hash, grade || null],
    )
    const user = publicUser(rows[0])
    return res.status(201).json({ token: signToken(user), user })
  } catch (error) {
    console.error('register failed:', error)
    return res.status(500).json({ error: 'Could not create account.' })
  }
})

router.post('/login', requireDb, async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  try {
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email])
    const row = rows[0]
    const ok = row && (await verifyPassword(password, row.password_hash))
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }
    const user = publicUser(row)
    return res.json({ token: signToken(user), user })
  } catch (error) {
    console.error('login failed:', error)
    return res.status(500).json({ error: 'Could not sign in.' })
  }
})

router.get('/me', requireDb, requireAuth(), async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.auth.sub])
    if (rows.length === 0) return res.status(404).json({ error: 'Account not found.' })
    return res.json({ user: publicUser(rows[0]) })
  } catch (error) {
    console.error('me failed:', error)
    return res.status(500).json({ error: 'Could not load account.' })
  }
})

export default router
