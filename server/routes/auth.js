import express from 'express'
import rateLimit from 'express-rate-limit'
import validator from 'validator'
import { query, hasDatabase } from '../db.js'
import { uid } from '../ids.js'
import { hashPassword, verifyPassword, signToken, requireAuth } from '../auth.js'

const router = express.Router()

// Rate limit auth endpoints to prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' },
})

// Input validation helpers
function validateEmail(email) {
  const trimmed = email.trim().toLowerCase()
  if (!validator.isEmail(trimmed)) {
    return null
  }
  // Additional length check to prevent excessively long emails
  if (trimmed.length > 254) {
    return null
  }
  return trimmed
}

function validateName(name) {
  const trimmed = name.trim()
  // Allow letters, spaces, hyphens, apostrophes - common in names
  if (!validator.isLength(trimmed, { min: 1, max: 100 })) {
    return null
  }
  if (!/^[\p{L}\s\-''.]+$/u.test(trimmed)) {
    return null
  }
  return trimmed
}

function validatePassword(password) {
  if (!validator.isLength(password, { min: 8, max: 128 })) {
    return null
  }
  return password
}

function validateGrade(grade) {
  if (!grade) return null
  const trimmed = grade.trim()
  if (!validator.isLength(trimmed, { max: 20 })) {
    return null
  }
  return trimmed
}

function validateSyncPin(pin) {
  if (!pin) return null
  const trimmed = pin.trim()
  if (!/^\d{5}$/.test(trimmed)) {
    return null
  }
  return trimmed
}

function publicUser(row) {
  return {
    id: row.id,
    role: row.role,
    name: row.name,
    email: row.email,
    schoolId: row.school_id,
    grade: row.grade,
    syncPin: row.sync_pin,
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
router.post('/register', authLimiter, requireDb, async (req, res) => {
  const name = validateName(req.body.name || '')
  const email = validateEmail(req.body.email || '')
  const password = validatePassword(req.body.password || '')
  const grade = validateGrade(req.body.grade || '')

  if (!name) {
    return res.status(400).json({ error: 'Name is required and must be valid.' })
  }
  if (!email) {
    return res.status(400).json({ error: 'Enter a valid email address.' })
  }
  if (!password) {
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

router.post('/login', authLimiter, requireDb, async (req, res) => {
  const email = validateEmail(req.body.email || '')
  const password = validatePassword(req.body.password || '')
  
  if (!email) {
    return res.status(400).json({ error: 'Enter a valid email address.' })
  }
  if (!password) {
    return res.status(400).json({ error: 'Password is required.' })
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

// Change password (requires current password for verification)
router.put('/password', requireDb, requireAuth(), async (req, res) => {
  const currentPassword = req.body.currentPassword
  const newPassword = validatePassword(req.body.newPassword || '')

  if (!currentPassword) {
    return res.status(400).json({ error: 'Current password is required.' })
  }
  if (!newPassword) {
    return res.status(400).json({ error: 'New password must be at least 8 characters.' })
  }

  try {
    const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.auth.sub])
    if (rows.length === 0) return res.status(404).json({ error: 'Account not found.' })

    const ok = await verifyPassword(currentPassword, rows[0].password_hash)
    if (!ok) return res.status(403).json({ error: 'Current password is incorrect.' })

    const hash = await hashPassword(newPassword)
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.auth.sub])

    const user = publicUser({ ...rows[0], password_hash: hash })
    return res.json({ ok: true, user })
  } catch (error) {
    console.error('password change failed:', error)
    return res.status(500).json({ error: 'Could not update password.' })
  }
})

// Set or update sync PIN
router.put('/sync-pin', requireDb, requireAuth(), async (req, res) => {
  const syncPin = validateSyncPin(req.body.syncPin || '')
  
  if (!syncPin) {
    return res.status(400).json({ error: 'Sync PIN must be exactly 5 digits.' })
  }

  try {
    // Check if PIN is already taken by another user
    const existing = await query('SELECT 1 FROM users WHERE sync_pin = $1 AND id != $2', [syncPin, req.auth.sub])
    if (existing.rowCount > 0) {
      return res.status(409).json({ error: 'This sync PIN is already in use.' })
    }

    const { rows } = await query(
      'UPDATE users SET sync_pin = $1 WHERE id = $2 RETURNING *',
      [syncPin, req.auth.sub]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Account not found.' })
    return res.json({ user: publicUser(rows[0]) })
  } catch (error) {
    console.error('sync-pin update failed:', error)
    return res.status(500).json({ error: 'Could not update sync PIN.' })
  }
})

// Set sync PIN using email + password (no JWT required — for users whose
// browser session doesn't have a token due to localStorage-only login).
router.post('/sync-pin-auth', authLimiter, requireDb, async (req, res) => {
  const email = validateEmail(req.body.email || '')
  const password = req.body.password
  const syncPin = validateSyncPin(req.body.syncPin || '')

  if (!email) return res.status(400).json({ error: 'Enter a valid email address.' })
  if (!password) return res.status(400).json({ error: 'Password is required.' })
  if (!syncPin) return res.status(400).json({ error: 'Sync PIN must be exactly 5 digits.' })

  try {
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email])
    if (rows.length === 0) return res.status(404).json({ error: 'Account not found.' })

    const ok = await verifyPassword(password, rows[0].password_hash)
    if (!ok) return res.status(403).json({ error: 'Password is incorrect.' })

    const existing = await query('SELECT 1 FROM users WHERE sync_pin = $1 AND id != $2', [syncPin, rows[0].id])
    if (existing.rowCount > 0) return res.status(409).json({ error: 'This sync PIN is already in use.' })

    const { rows: updated } = await query(
      'UPDATE users SET sync_pin = $1 WHERE id = $2 RETURNING *',
      [syncPin, rows[0].id]
    )
    const user = publicUser(updated[0])
    return res.json({ token: signToken(user), user })
  } catch (error) {
    console.error('sync-pin-auth failed:', error)
    return res.status(500).json({ error: 'Could not update sync PIN.' })
  }
})

// Login with sync PIN (for mobile app sync)
router.post('/sync-login', authLimiter, requireDb, async (req, res) => {
  const syncPin = validateSyncPin(req.body.syncPin || '')
  
  if (!syncPin) {
    return res.status(400).json({ error: 'Sync PIN must be exactly 5 digits.' })
  }

  try {
    const { rows } = await query('SELECT * FROM users WHERE sync_pin = $1', [syncPin])
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid sync PIN.' })
    }
    const user = publicUser(rows[0])
    // Clear the sync PIN so it can't be reused
    await query('UPDATE users SET sync_pin = NULL WHERE id = $1', [rows[0].id])
    return res.json({ token: signToken(user), user })
  } catch (error) {
    console.error('sync-login failed:', error)
    return res.status(500).json({ error: 'Could not sign in with sync PIN.' })
  }
})

export default router
