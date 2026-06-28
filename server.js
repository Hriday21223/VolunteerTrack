import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import { initSchema, hasDatabase, query } from './server/db.js'
import { authenticate, hashPassword } from './server/auth.js'
import { uid } from './server/ids.js'
import authRoutes from './server/routes/auth.js'
import schoolRoutes from './server/routes/school.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 10000

// Stripe webhook MUST be before express.json() — it needs the raw body
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) return res.status(503).json({ error: 'Webhook not configured.' })

  try {
    const { default: Stripe } = await import('stripe')
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const schoolId = session.metadata?.schoolId
        if (!schoolId) break
        const subscriptionId = session.subscription
        const customerId = session.customer
        // Fetch subscription details from Stripe to get period dates
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        await query(
          `INSERT INTO school_subscriptions (id, school_id, stripe_customer_id, stripe_subscription_id, status, plan_type, price_amount, current_period_start, current_period_end)
           VALUES ($1, $2, $3, $4, 'active', 'school_yearly', 200, to_timestamp($5), to_timestamp($6))
           ON CONFLICT (school_id) DO UPDATE SET
             status = 'active',
             stripe_customer_id = EXCLUDED.stripe_customer_id,
             stripe_subscription_id = EXCLUDED.stripe_subscription_id,
             current_period_start = EXCLUDED.current_period_start,
             current_period_end = EXCLUDED.current_period_end`,
          [uid('sub'), schoolId, customerId, subscriptionId, subscription.current_period_start, subscription.current_period_end],
        )
        break
      }
      case 'invoice.paid': {
        const invoice = event.data.object
        const subscriptionId = invoice.subscription
        if (!subscriptionId) break
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        await query(
          `UPDATE school_subscriptions SET
            status = 'active',
            current_period_start = to_timestamp($1),
            current_period_end = to_timestamp($2)
           WHERE stripe_subscription_id = $3`,
          [subscription.current_period_start, subscription.current_period_end, subscriptionId],
        )
        break
      }
      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const sub = event.data.object
        const stripeStatus = sub.status // active, past_due, canceled, etc.
        const dbStatus = stripeStatus === 'active' ? 'active' : stripeStatus === 'past_due' ? 'past_due' : 'canceled'
        await query(
          `UPDATE school_subscriptions SET
            status = $1,
            current_period_start = to_timestamp($2),
            current_period_end = to_timestamp($3)
           WHERE stripe_subscription_id = $4`,
          [dbStatus, sub.current_period_start, sub.current_period_end, sub.id],
        )
        break
      }
    }

    return res.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return res.status(400).json({ error: 'Webhook signature verification failed.' })
  }
})

// General rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
})

// Stricter rate limiting for email endpoints
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 emails per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many email requests. Please try again later.' },
})

app.set('trust proxy', 1)
app.use(cors())
app.use(express.json({ limit: '1mb' })) // Limit request body size
app.use(apiLimiter)
app.use(authenticate)

// Server-backed accounts & (later) school dashboards.
app.use('/api/auth', apiLimiter, authRoutes)
app.use('/api/school', apiLimiter, schoolRoutes)

// In-memory ring buffer of the most recently generated recovery codes. In
// production these are also emailed to the user; the buffer allows the
// password-reset endpoint to verify the code when the user submits it from
// the same browser (where it was already stored in localStorage).
const isProd = process.env.NODE_ENV === 'production'
const devCodeLog = []
const DEV_LOG_LIMIT = 25

function logDevCode(entry) {
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

// Verify a recovery code and update the password in the database. The code
// was previously generated by the frontend, stored in localStorage, and sent
// via email. This endpoint lets the same browser complete the reset without
// waiting for the email to arrive.
app.post('/api/auth/reset-password', emailLimiter, async (req, res) => {
  const { email, code, newPassword } = req.body

  if (!email || typeof email !== 'string' || !email.includes('@') || email.length > 254) {
    return res.status(400).json({ error: 'Invalid email.' })
  }
  if (!code || typeof code !== 'string' || code.length > 20) {
    return res.status(400).json({ error: 'Invalid code.' })
  }
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 128) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' })
  }

  if (!hasDatabase()) {
    return res.status(503).json({ error: 'Server database is not configured.' })
  }

  try {
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No account with that email.' })
    }

    // Try to match the code from the ring buffer.
    const trimmedEmail = email.trim().toLowerCase()
    const match = devCodeLog.find(
      (entry) => entry.email.toLowerCase() === trimmedEmail && entry.code === code && entry.type === 'password'
    )
    if (!match) {
      return res.status(401).json({ error: 'Invalid or expired recovery code.' })
    }

    const hash = await hashPassword(newPassword)
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, rows[0].id])

    return res.json({ ok: true })
  } catch (error) {
    console.error('reset-password failed:', error)
    return res.status(500).json({ error: 'Could not reset password.' })
  }
})

app.post('/api/send-reset-email', emailLimiter, async (req, res) => {
  const { email, code, type } = req.body
  
  // Basic input validation
  if (!email || typeof email !== 'string' || !email.includes('@') || email.length > 254) {
    return res.status(400).json({ error: 'Invalid email.' })
  }
  if (!code || typeof code !== 'string' || code.length > 20) {
    return res.status(400).json({ error: 'Invalid code.' })
  }
  if (!type || typeof type !== 'string' || (type !== 'pin' && type !== 'password')) {
    return res.status(400).json({ error: 'Invalid type.' })
  }

  const { transport, missing } = transporter()
  logDevCode({ email: email.trim(), code, type, at: new Date().toISOString() })

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

app.post('/api/contact', emailLimiter, async (req, res) => {
  const { name, email, subject, message } = req.body
  
  // Basic input validation
  if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 100) {
    return res.status(400).json({ error: 'Invalid name.' })
  }
  if (!email || typeof email !== 'string' || !email.includes('@') || email.length > 254) {
    return res.status(400).json({ error: 'Invalid email.' })
  }
  if (!message || typeof message !== 'string' || message.trim().length === 0 || message.length > 5000) {
    return res.status(400).json({ error: 'Invalid message.' })
  }
  if (subject && (typeof subject !== 'string' || subject.length > 200)) {
    return res.status(400).json({ error: 'Invalid subject.' })
  }

  const { transport, missing } = transporter()
  if (!transport) {
    return res.status(503).json({
      error: 'Email backend is not configured.',
      missingVars: missing,
    })
  }

  const to = process.env.CONTACT_EMAIL || 'volunteertrack@googlegroups.com'
  const sanitizedMessage = message.trim()
  const sanitizedSubject = subject ? subject.trim() : 'General question'
  const body = `New contact message from ${name.trim()} <${email.trim()}>\nSubject: ${sanitizedSubject}\n\n${sanitizedMessage}`

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

// 404 handler for unknown routes
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Creates an admin account on boot from env so there is always a way in.
// No-op when the DB or admin env vars are missing, or the admin already exists.
async function seedAdmin() {
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase()
  const password = String(process.env.ADMIN_PASSWORD || '')
  if (!hasDatabase() || !email || !password) return
  const hash = await hashPassword(password)
  const existing = await query('SELECT 1 FROM users WHERE email = $1', [email])
  if (existing.rowCount > 0) {
    await query(
      'UPDATE users SET role = $1, name = $2, password_hash = $3 WHERE email = $4',
      ['admin', 'Admin', hash, email],
    )
    console.log(`Updated admin account: ${email}`)
    return
  }
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
