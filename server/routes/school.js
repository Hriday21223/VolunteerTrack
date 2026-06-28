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
  if (!pin || !/^[a-z]+-?\d{3,5}$/.test(pin)) return res.status(400).json({ error: 'School code must be letters followed by digits (e.g. cisd-12345).' })

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

// Add a student to the school by email (school admin only)
router.post('/add-student', limiter, requireDb, requireAuth('school'), async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  if (!email || !validator.isEmail(email)) return res.status(400).json({ error: 'Valid email required.' })

  try {
    const { rows: userRows } = await query('SELECT school_id FROM users WHERE id = $1', [req.auth.sub])
    if (userRows.length === 0 || !userRows[0].school_id) return res.status(404).json({ error: 'School not found.' })

    const { rows: target } = await query('SELECT id, school_id, role FROM users WHERE email = $1', [email])
    if (target.length === 0) return res.status(404).json({ error: 'No user found with that email.' })
    if (target[0].school_id) return res.status(409).json({ error: 'This student is already linked to a school.' })
    if (target[0].role !== 'student') return res.status(400).json({ error: 'That user is not a student.' })

    await query('UPDATE users SET school_id = $1 WHERE id = $2', [userRows[0].school_id, target[0].id])
    return res.json({ ok: true })
  } catch (error) {
    console.error('add-student failed:', error)
    return res.status(500).json({ error: 'Could not add student.' })
  }
})

// Upload a PDF (student or admin)
router.post('/upload', limiter, requireDb, requireAuth('student', 'admin'), async (req, res) => {
  const { filename, fileData, fileType } = req.body

  if (!filename || !fileData) return res.status(400).json({ error: 'Filename and file data required.' })

  try {
    const { rows: userRows } = await query('SELECT school_id FROM users WHERE id = $1', [req.auth.sub])
    let schoolId = userRows[0]?.school_id
    if (!schoolId && req.body.schoolId) schoolId = req.body.schoolId
    if (!schoolId) return res.status(400).json({ error: 'No school linked to your account.' })

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

// Get school info by pin or id
router.get('/info', limiter, requireDb, async (req, res) => {
  const pin = String(req.query.pin || '').trim().toLowerCase()
  const id = String(req.query.id || '').trim()
  if (!pin && !id) return res.status(400).json({ error: 'School code or id required.' })
  try {
    let rows
    if (pin) {
      const r = await query('SELECT id, name, pin FROM schools WHERE pin = $1', [pin])
      rows = r.rows
    } else {
      const r = await query('SELECT id, name, pin FROM schools WHERE id = $1', [id])
      rows = r.rows
    }
    if (rows.length === 0) return res.status(404).json({ error: 'No school found.' })
    return res.json({ school: { id: rows[0].id, name: rows[0].name, pin: rows[0].pin } })
  } catch (error) {
    return res.status(500).json({ error: 'Could not fetch school.' })
  }
})

// --- Public volunteer tasks (any user can post, any user can sign up) ---

// Create a public task
router.post('/public-tasks', limiter, requireDb, requireAuth(), async (req, res) => {
  const { title, description, location, date, time, slotsTotal } = req.body
  if (!title || !description || !location || !date) return res.status(400).json({ error: 'Title, description, location, and date required.' })

  try {
    const { rows } = await query('SELECT name, email FROM users WHERE id = $1', [req.auth.sub])
    if (rows.length === 0) return res.status(404).json({ error: 'User not found.' })

    const id = uid('ptask')
    await query(
      `INSERT INTO public_tasks (id, title, description, location, date, time, slots_total, created_by, creator_name, creator_email)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [id, title, description, location, date, time || null, Number(slotsTotal) || 1, req.auth.sub, rows[0].name, rows[0].email],
    )
    return res.status(201).json({ ok: true, id })
  } catch (error) {
    console.error('create public task failed:', error)
    return res.status(500).json({ error: 'Could not create task.' })
  }
})

// List open public tasks (anyone, no auth required for reading)
router.get('/public-tasks', limiter, requireDb, async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, title, description, location, date, time, slots_total, status,
              creator_name, created_at,
              (SELECT COUNT(*) FROM public_task_signups WHERE task_id = t.id) AS slots_filled
       FROM public_tasks t
       WHERE status = 'open'
       ORDER BY date ASC, created_at DESC`,
    )
    return res.json({ tasks: rows })
  } catch (error) {
    console.error('list public tasks failed:', error)
    return res.status(500).json({ error: 'Could not fetch tasks.' })
  }
})

// Sign up for a public task
router.post('/public-tasks/:id/signup', limiter, requireDb, requireAuth(), async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM public_tasks WHERE id = $1', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'Task not found.' })
    if (rows[0].status === 'closed') return res.status(400).json({ error: 'Task is closed.' })

    const { rows: signups } = await query('SELECT COUNT(*) AS cnt FROM public_task_signups WHERE task_id = $1', [req.params.id])
    if (Number(signups[0].cnt) >= rows[0].slots_total) return res.status(400).json({ error: 'Task is full.' })

    const sid = uid('psig')
    await query(
      'INSERT INTO public_task_signups (id, task_id, user_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [sid, req.params.id, req.auth.sub],
    )
    return res.json({ ok: true, id: sid })
  } catch (error) {
    console.error('public task signup failed:', error)
    return res.status(500).json({ error: 'Could not sign up.' })
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

// All submissions across all schools (admin only)
router.get('/admin/submissions', limiter, requireDb, requireAuth('admin'), async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT p.id, p.filename, p.file_type, p.status, p.notes, p.created_at,
              u.name AS user_name, u.email AS user_email,
              s.name AS school_name, s.pin AS school_pin
       FROM pdf_uploads p
       JOIN users u ON p.user_id = u.id
       JOIN schools s ON p.school_id = s.id
       ORDER BY p.created_at DESC`,
    )
    return res.json({ submissions: rows })
  } catch (error) {
    console.error('admin submissions failed:', error)
    return res.status(500).json({ error: 'Could not fetch submissions.' })
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
