import { keys, read, write } from '@/lib/storage.js'
import { uid } from '@/utils/id.js'

/* ---------- Users (local auth) ---------- */

export function getUsers() {
  return read(keys.users, [])
}

export function findUserByEmail(email) {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase()) || null
}

export function createUser({ name, email, password, school = '', grade = '' }) {
  const users = getUsers()
  if (findUserByEmail(email)) {
    throw new Error('An account with that email already exists.')
  }
  // NOTE: This is a demo. The password is hashed with a non-cryptographic
  // function — fine for an offline single-user app, NOT for anything real.
  const user = {
    id: uid('usr'),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    school: school.trim(),
    grade: grade.trim(),
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  }
  users.push(user)
  write(keys.users, users)
  return user
}

export function verifyPassword(user, password) {
  return user && user.passwordHash === hashPassword(password)
}

export function updateUser(id, patch) {
  const users = getUsers()
  const idx = users.findIndex((u) => u.id === id)
  if (idx === -1) return null
  users[idx] = { ...users[idx], ...patch }
  write(keys.users, users)
  return users[idx]
}

/* ---------- VolunteerLog ---------- */

export function listLogs() {
  return read(keys.logs, [])
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function createLog(data) {
  const log = {
    id: uid('log'),
    createdAt: new Date().toISOString(),
    ...data,
  }
  const logs = listLogs()
  logs.push(log)
  write(keys.logs, logs)
  return log
}

export function updateLog(id, patch) {
  const logs = listLogs()
  const idx = logs.findIndex((l) => l.id === id)
  if (idx === -1) return null
  logs[idx] = { ...logs[idx], ...patch }
  write(keys.logs, logs)
  return logs[idx]
}

export function deleteLog(id) {
  const logs = listLogs().filter((l) => l.id !== id)
  write(keys.logs, logs)
}

/* ---------- Goals ---------- */

export function listGoals() {
  return read(keys.goals, [])
}

export function upsertGoal(goal) {
  const goals = listGoals()
  const existingIdx = goals.findIndex((g) => g.id === goal.id)
  if (existingIdx === -1) {
    goals.push({ id: uid('goal'), createdAt: new Date().toISOString(), ...goal })
  } else {
    goals[existingIdx] = { ...goals[existingIdx], ...goal }
  }
  write(keys.goals, goals)
  return goals
}

export function deleteGoal(id) {
  write(keys.goals, listGoals().filter((g) => g.id !== id))
}

/* ---------- Achievements (earned ids) ---------- */

export function getEarned() {
  return read(keys.achievements, [])
}

export function markEarned(badgeId) {
  const earned = getEarned()
  if (!earned.includes(badgeId)) {
    earned.push(badgeId)
    write(keys.achievements, earned)
  }
}

/* ---------- Reminders ---------- */

export function listReminders() {
  return read(keys.reminders, [])
    .slice()
    .sort((a, b) => (a.nextAt < b.nextAt ? -1 : 1))
}

export function createReminder(data) {
  const r = {
    id: uid('rem'),
    createdAt: new Date().toISOString(),
    enabled: true,
    ...data,
  }
  const all = listReminders()
  all.push(r)
  write(keys.reminders, all)
  return r
}

export function updateReminder(id, patch) {
  const all = listReminders()
  const idx = all.findIndex((r) => r.id === id)
  if (idx === -1) return null
  all[idx] = { ...all[idx], ...patch }
  write(keys.reminders, all)
  return all[idx]
}

export function deleteReminder(id) {
  write(keys.reminders, listReminders().filter((r) => r.id !== id))
}

export function getFired() {
  return read(keys.fired, [])
}

export function markFired(id) {
  const f = getFired()
  if (!f.includes(id)) {
    f.push(id)
    write(keys.fired, f)
  }
}

export function clearFired(id) {
  write(keys.fired, getFired().filter((x) => x !== id))
}

/* ---------- Demo-only password "hash" ---------- */
// djb2-style — not cryptographic. Documented as such above.
export function hashPassword(pw) {
  let h = 5381
  for (let i = 0; i < pw.length; i++) h = ((h << 5) + h) ^ pw.charCodeAt(i)
  return `h${(h >>> 0).toString(36)}`
}
