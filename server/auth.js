import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const SALT_ROUNDS = 10
const TOKEN_TTL = '30d'

function secret() {
  const s = process.env.JWT_SECRET
  if (!s) {
    // Refuse to mint tokens with a default secret in production.
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is required in production.')
    }
    return 'dev-insecure-secret'
  }
  return s
}

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password, hash) {
  if (!hash) return false
  return bcrypt.compare(password, hash)
}

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    secret(),
    { expiresIn: TOKEN_TTL },
  )
}

export function signTempToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email, purpose: 'totp' },
    secret(),
    { expiresIn: '5m' },
  )
}

export function verifyTempToken(token) {
  try {
    const payload = jwt.verify(token, secret())
    if (payload.purpose !== 'totp') return null
    return payload
  } catch {
    return null
  }
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, secret())
  } catch {
    return null
  }
}

function bearer(req) {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')
  return scheme === 'Bearer' && token ? token : null
}

// Attaches req.auth = { sub, role, email } when a valid token is present.
// Rejects temp tokens (purpose: 'totp') — those are only for TOTP challenge.
export function authenticate(req, _res, next) {
  const token = bearer(req)
  if (!token) { req.auth = null; return next() }
  const payload = verifyToken(token)
  if (payload && payload.purpose) { req.auth = null; return next() }
  req.auth = payload
  next()
}

// Gate a route behind a valid token, optionally restricted to roles.
export function requireAuth(...roles) {
  return (req, res, next) => {
    if (!req.auth) return res.status(401).json({ error: 'Authentication required.' })
    if (roles.length && !roles.includes(req.auth.role)) {
      return res.status(403).json({ error: 'Not allowed.' })
    }
    next()
  }
}
