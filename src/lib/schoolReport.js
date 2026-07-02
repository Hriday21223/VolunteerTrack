// Talks to the email backend to send a student's volunteer report to their
// linked partner school. Mirrors the shape/behavior of lib/recovery.js so the
// UI can render a status banner instead of crashing, and can detect when there
// is simply no backend (e.g. the static GitHub Pages host).

const NO_BACKEND_HINTS = [
  'backend returned 404',
  'failed to fetch',
  'networkerror',
]

function looksLikeMissingBackend(reason) {
  if (!reason) return false
  const r = String(reason).toLowerCase()
  return NO_BACKEND_HINTS.some((hint) => r.includes(hint))
}

/**
 * Ask the backend to email a volunteer report to a partner school.
 *
 * Resolves to:
 *   - { ok: true }
 *   - { ok: false, reason, missingVars, backendAvailable }
 *
 * Never throws.
 */
export async function sendSchoolReport({ to, school, student, totalHours, entries }) {
  if (!to || !student) {
    return { ok: false, reason: 'Missing report details.', backendAvailable: false }
  }
  try {
    const response = await fetch('/api/send-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, school, student, totalHours, entries }),
    })
    if (response.ok) return { ok: true, backendAvailable: true }

    let reason = `Email backend returned ${response.status}.`
    let missingVars = null
    try {
      const body = await response.json()
      if (body?.error) reason = body.error
      if (Array.isArray(body?.missingVars)) missingVars = body.missingVars
    } catch {
      // body wasn't JSON; keep the status-based reason.
    }

    const backendAvailable = response.status !== 404 && !looksLikeMissingBackend(reason)
    return { ok: false, reason, missingVars, backendAvailable }
  } catch (err) {
    return {
      ok: false,
      reason: err?.message || 'Could not reach the email server.',
      backendAvailable: false,
    }
  }
}
