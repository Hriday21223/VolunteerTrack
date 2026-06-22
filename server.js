import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'

dotenv.config()

const app = express()
const port = process.env.BACKEND_PORT || 5174

app.use(cors())
app.use(express.json())

function createTransporter() {
  const host = process.env.EMAIL_HOST
  const port = Number(process.env.EMAIL_PORT || 587)
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASSWORD

  if (!host || !user || !pass) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: { user, pass },
  })
}

const transporter = createTransporter()

app.post('/api/send-reset-email', async (req, res) => {
  const { email, code, type } = req.body
  if (!email || !code || !type) {
    return res.status(400).json({ error: 'Missing email, code, or type.' })
  }

  if (!transporter) {
    return res.status(503).json({ error: 'Email backend is not configured.' })
  }

  const subject = type === 'pin' ? 'VolunTrack PIN recovery code' : 'VolunTrack password recovery code'
  const text = `Your VolunTrack recovery code is ${code}. It expires in 15 minutes.`
  const html = `<p>Your VolunTrack recovery code is <strong>${code}</strong>.</p><p>It expires in 15 minutes.</p>`

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || user,
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

app.listen(port, () => {
  console.log(`Backend email server listening at http://localhost:${port}`)
})
