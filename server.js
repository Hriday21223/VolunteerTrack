import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import { fileURLToPath } from 'url'
import path from 'path'
import { initSchema, hasDatabase, query } from './server/db.js'
import { authenticate, hashPassword } from './server/auth.js'
import { uid } from './server/ids.js'
import authRoutes from './server/routes/auth.js'

dotenv.config()

const app = express()
const port = process.env.BACKEND_PORT || 5174

const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(cors())
app.use(express.json())
app.use(authenticate)

// Server-backed accounts & (later) school dashboards.
app.use('/api/auth', authRoutes)

const distPath = path.join(__dirname, 'dist')
app.use(express.static(distPath))

// In-memory dev ring buffer of the most recent codes we tried to send. Useful
// when the user is on the GitHub Pages demo and SMTP isn't configured: the
// latest code is mirrored back so they can still complete the flow without
// leaving the page. Disabled in production.
const isProd = process.env.NODE_ENV === 'production'
const devCodeLog = []
const DEV_LOG_LIMIT = 25

function logDevCode(entry) {
  if (isProd) return
  devCodeLog.unshift(entry)
  if (devCodeLog.length > DEV_LOG_LIMIT) devCodeLog.length = DEV_LOG_LIMIT
}

function transporter() {
  const host = process.env.EMAIL_HOST
  const smtpPort = Number(process.env.EMAIL_PORT || 587)
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASSWORD

  if (!host || !user || !pass) {
    return { transport: null, missing: missingVars({ host, user, pass }) }
  }

  return {
    transport: nodemailer.createTransport({
      host,
      port: smtpPort,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: { user, pass },
    }),
    missing: [],
  }
}

function missingVars({ host, user, pass }) {
  const missing = []
  if (!host) missing.push('EMAIL_HOST')
  if (!user) missing.push('EMAIL_USER')
  if (!pass) missing.push('EMAIL_PASSWORD')
  return missing
}

// Lightweight status endpoint so the UI can show real setup hints instead of
// a generic "not configured" message.
app.get('/api/recovery-status', (_req, res) => {
  const { transport, missing } = transporter()
  res.json({
    smtpConfigured: Boolean(transport),
    missingVars: missing,
    devMode: !isProd,
    devCodeCount: devCodeLog.length,
  })
})

app.post('/api/send-reset-email', async (req, res) => {
  const { email, code, type } = req.body
  if (!email || !code || !type) {
    return res.status(400).json({ error: 'Missing email, code, or type.' })
  }

  const { transport, missing } = transporter()
  logDevCode({ email, code, type, at: new Date().toISOString() })

  if (!transport) {
    return res.status(503).json({
      error: 'Email backend is not configured.',
      missingVars: missing,
    })
  }

  const subject = type === 'pin'
    ? 'VolunTrack PIN recovery code'
    : 'VolunTrack password recovery code'
  const text = `Your VolunTrack recovery code is ${code}. It expires in 15 minutes.`
  const html = `<p>Your VolunTrack recovery code is <strong>${code}</strong>.</p><p>It expires in 15 minutes.</p>`

  try {
    await transport.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject,
      text,
      html,
    })
    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Email send failed:', error)
    return res.status(500).json({ error: 'Failed to send email.' })
  }
})

// Dev-only helper: returns the most recently generated code for an email so
// the GitHub Pages demo can deliver the code via the UI without needing SMTP.
// Returns 404 in production so a leaked URL never discloses codes.
app.get('/api/dev-recovery-code', (req, res) => {
  if (isProd) return res.status(404).json({ error: 'Not available in production.' })
  const email = String(req.query.email || '').toLowerCase().trim()
  if (!email) return res.status(400).json({ error: 'Missing email.' })
  const hit = devCodeLog.find((entry) => entry.email.toLowerCase() === email)
  if (!hit) return res.status(404).json({ error: 'No recent code for that email.' })
  return res.json({ code: hit.code, type: hit.type, at: hit.at })
})

app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing name, email, or message.' })
  }

  const { transport, missing } = transporter()
  if (!transport) {
    return res.status(503).json({
      error: 'Email backend is not configured.',
      missingVars: missing,
    })
  }

  const to = process.env.EMAIL_FROM || process.env.EMAIL_USER
  const body = `New contact message from ${name} <${email}>\nSubject: ${subject || 'General question'}\n\n${message}`

  try {
    await transport.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      replyTo: email,
      subject: `VolunTrack contact: ${subject || 'General question'}`,
      text: body,
      html: `<pre style="font-family: sans-serif; white-space: pre-wrap;">${body}</pre>`,
    })
    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Contact email failed:', error)
    return res.status(500).json({ error: 'Failed to send message.' })
  }
})

// SPA fallback: serve index.html for any non-API route so React Router handles it.
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

// Creates an admin account on boot from env so there is always a way in.
// No-op when the DB or admin env vars are missing, or the admin already exists.
async function seedAdmin() {
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase()
  const password = String(process.env.ADMIN_PASSWORD || '')
  if (!hasDatabase() || !email || !password) return
  const existing = await query('SELECT 1 FROM users WHERE email = $1', [email])
  if (existing.rowCount > 0) return
  const hash = await hashPassword(password)
  await query(
    `INSERT INTO users (id, role, name, email, password_hash)
     VALUES ($1, 'admin', $2, $3, $4)`,
    [uid('usr'), 'Admin', email, hash],
  )
  console.log(`Seeded admin account: ${email}`)
}

async function start() {
  if (hasDatabase()) {
    try {
      await initSchema()
      await seedAdmin()
      console.log('Database ready.')
    } catch (error) {
      console.error('Database init failed:', error)
    }
  } else {
    console.log('DATABASE_URL not set — running in email-only mode (no accounts API).')
  }

  app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`)
  })
}

start()
