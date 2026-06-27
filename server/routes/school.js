import express from 'express'
import rateLimit from 'express-rate-limit'
import validator from 'validator'
import { query, hasDatabase } from '../db.js'
import { uid } from '../ids.js'
import { hashPassword, verifyPassword, signToken, requireAuth } from '../auth.js'

const router = express.Router()

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
})

function requireDb(_req, res, next) {
  if (!hasDatabase()) return res.status(503).json({ error: 'Server database is not configured.' })
  next()
}

// Register a school
router.post('/register', limiter, requireDb, async (req, res) => {
  const name = String(req.body.name || '').trim()
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = req.body.password
  const pin = String(req.body.pin || '').trim().toLowerCase()

  if (!name || name.length > 100) return res.status(400).json({ error: 'School name is required.' })
  if (!email || !validator.isEmail(email) || email.length > 254) return res.status(400).json({ error: 'Valid email required.' })
  if (!password || password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' })
  if (!pin || !/^[a-z]+\d{3,5}$/.test(pin)) return res.status(400).json({ error: 'School code must be letters followed by digits (e.g. cisd-12345).' })

  try {
    const existing = await query('SELECT 1 FROM schools WHERE pin = $1', [pin])
    if (existing.rowCount > 0) return res.status(409).json({ error: 'That school code is already taken.' })

    const existingUser = await query('SELECT 1 FROM users WHERE email = $1', [email])
    if (existingUser.rowCount > 0) return res.status(409).json({ error: 'An account with that email already exists.' })

    const schoolId = uid('sch')
    await query(
      'INSERT INTO schools (id, name, pin, contact_email) VALUES ($1, $2, $3, $4)',
      [schoolId, name, pin, email],
    )

    const hash = await hashPassword(password)
    const userId = uid('usr')
    const { rows } = await query(
      `INSERT INTO users (id, role, name, email, password_hash, school_id)
       VALUES ($1, 'school', $2, $3, $4, $5)
       RETURNING *`,
      [userId, name, email, hash, schoolId],
    )
    const user = { id: rows[0].id, role: rows[0].role, name: rows[0].name, email: rows[0].email, schoolId: rows[0].school_id, grade: rows[0].grade }
    return res.status(201).json({ token: signToken(user), user })
  } catch (error) {
    console.error('school register failed:', error)
    return res.status(500).json({ error: 'Could not register school.' })
  }
})

// Join a school (student enters school code)
router.post('/join', limiter, requireDb, requireAuth(), async (req, res) => {
  const pin = String(req.body.pin || '').trim().toLowerCase()

  if (!pin) return res.status(400).json({ error: 'School code is required.' })

  try {
    const { rows } = await query('SELECT id FROM schools WHERE pin = $1', [pin])
    if (rows.length === 0) return res.status(404).json({ error: 'No school found with that code.' })

    await query('UPDATE users SET school_id = $1 WHERE id = $2', [rows[0].id, req.auth.sub])
    return res.json({ ok: true, schoolId: rows[0].id })
  } catch (error) {
    console.error('school join failed:', error)
    return res.status(500).json({ error: 'Could not join school.' })
  }
})

// Get students under this school (school admin only)
router.get('/students', limiter, requireDb, requireAuth('school'), async (req, res) => {
  try {
    const { rows: userRows } = await query('SELECT school_id FROM users WHERE id = $1', [req.auth.sub])
    if (userRows.length === 0 || !userRows[0].school_id) return res.status(404).json({ error: 'School not found.' })

    const { rows } = await query(
      `SELECT id, name, email, grade, created_at FROM users
       WHERE school_id = $1 AND role = 'student'
       ORDER BY created_at DESC`,
      [userRows[0].school_id],
    )
    return res.json({ students: rows })
  } catch (error) {
    console.error('school students failed:', error)
    return res.status(500).json({ error: 'Could not fetch students.' })
  }
})

// Upload a PDF (student)
router.post('/upload', limiter, requireDb, requireAuth('student'), async (req, res) => {
  const { filename, fileData, fileType } = req.body

  if (!filename || !fileData) return res.status(400).json({ error: 'Filename and file data required.' })

  try {
    const { rows: userRows } = await query('SELECT school_id FROM users WHERE id = $1', [req.auth.sub])
    const schoolId = userRows[0]?.school_id

    const id = uid('pdf')
    await query(
      `INSERT INTO pdf_uploads (id, user_id, school_id, filename, file_data, file_type)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, req.auth.sub, schoolId, filename, fileData, fileType || 'application/pdf'],
    )
    return res.status(201).json({ ok: true, id })
  } catch (error) {
    console.error('pdf upload failed:', error)
    return res.status(500).json({ error: 'Could not upload file.' })
  }
})

// Get PDFs for a student (school admin can see all, student can see own)
router.get('/pdfs', limiter, requireDb, requireAuth(), async (req, res) => {
  try {
    if (req.auth.role === 'school') {
      const { rows: userRows } = await query('SELECT school_id FROM users WHERE id = $1', [req.auth.sub])
      if (!userRows[0]?.school_id) return res.status(404).json({ error: 'School not found.' })
      const { rows } = await query(
        `SELECT p.id, p.user_id, u.name AS user_name, u.email AS user_email, p.filename, p.file_type, p.status, p.notes, p.created_at
         FROM pdf_uploads p JOIN users u ON p.user_id = u.id
         WHERE p.school_id = $1
         ORDER BY p.created_at DESC`,
        [userRows[0].school_id],
      )
      return res.json({ pdfs: rows })
    }
    const { rows } = await query(
      `SELECT id, filename, file_type, status, notes, created_at
       FROM pdf_uploads WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.auth.sub],
    )
    return res.json({ pdfs: rows })
  } catch (error) {
    console.error('pdf list failed:', error)
    return res.status(500).json({ error: 'Could not fetch PDFs.' })
  }
})

// Get a single PDF with file data
router.get('/pdf/:id', limiter, requireDb, requireAuth(), async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM pdf_uploads WHERE id = $1', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'PDF not found.' })

    const pdf = rows[0]
    if (req.auth.role === 'student' && pdf.user_id !== req.auth.sub) {
      return res.status(403).json({ error: 'Not allowed.' })
    }
    if (req.auth.role === 'school') {
      const { rows: userRows } = await query('SELECT school_id FROM users WHERE id = $1', [req.auth.sub])
      if (pdf.school_id !== userRows[0]?.school_id) return res.status(403).json({ error: 'Not allowed.' })
    }

    return res.json({ pdf: { id: pdf.id, filename: pdf.filename, fileData: pdf.file_data, fileType: pdf.file_type, status: pdf.status, notes: pdf.notes, createdAt: pdf.created_at } })
  } catch (error) {
    console.error('pdf get failed:', error)
    return res.status(500).json({ error: 'Could not fetch PDF.' })
  }
})

// Approve or reject a PDF (school admin)
router.patch('/pdf/:id/review', limiter, requireDb, requireAuth('school'), async (req, res) => {
  const { status, notes } = req.body
  if (!status || !['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Status must be approved or rejected.' })

  try {
    const { rows: userRows } = await query('SELECT school_id FROM users WHERE id = $1', [req.auth.sub])
    const { rows } = await query('SELECT * FROM pdf_uploads WHERE id = $1', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'PDF not found.' })
    if (rows[0].school_id !== userRows[0]?.school_id) return res.status(403).json({ error: 'Not your school.' })

    await query(
      'UPDATE pdf_uploads SET status = $1, notes = $2, reviewed_by = $3, reviewed_at = now() WHERE id = $4',
      [status, notes || null, req.auth.sub, req.params.id],
    )
    return res.json({ ok: true })
  } catch (error) {
    console.error('pdf review failed:', error)
    return res.status(500).json({ error: 'Could not update PDF.' })
  }
})

// Get school info
router.get('/info', limiter, requireDb, async (req, res) => {
  const pin = String(req.query.pin || '').trim().toLowerCase()
  if (!pin) return res.status(400).json({ error: 'School code required.' })
  try {
    const { rows } = await query('SELECT id, name, pin FROM schools WHERE pin = $1', [pin])
    if (rows.length === 0) return res.status(404).json({ error: 'No school found.' })
    return res.json({ school: { id: rows[0].id, name: rows[0].name, pin: rows[0].pin } })
  } catch (error) {
    return res.status(500).json({ error: 'Could not fetch school.' })
  }
})

// --- Admin endpoints ---

// List all schools (admin only)
router.get('/admin/list', limiter, requireDb, requireAuth('admin'), async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT s.id, s.name, s.pin, s.contact_email, s.created_at,
        (SELECT COUNT(*) FROM users WHERE school_id = s.id AND role = 'student') AS student_count
       FROM schools s ORDER BY s.created_at DESC`,
    )
    return res.json({ schools: rows })
  } catch (error) {
    console.error('admin schools list failed:', error)
    return res.status(500).json({ error: 'Could not fetch schools.' })
  }
})

// Delete a school and unlink its students (admin only)
router.delete('/admin/:id', limiter, requireDb, requireAuth('admin'), async (req, res) => {
  try {
    await query('UPDATE users SET school_id = NULL WHERE school_id = $1', [req.params.id])
    await query('DELETE FROM schools WHERE id = $1', [req.params.id])
    return res.json({ ok: true })
  } catch (error) {
    console.error('admin delete school failed:', error)
    return res.status(500).json({ error: 'Could not delete school.' })
  }
})

export default router
