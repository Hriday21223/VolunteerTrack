// Registry of partner schools / organizations.
//
// Each partner has a `code` (the PIN handed out to students), a display
// `name`, and the `email` that should receive students' volunteer reports.
// Add real partners here — codes are matched case-insensitively.
export const PARTNER_SCHOOLS = [
  { code: 'DEMO123', name: 'Demo High School', email: 'partnerships@example.edu' },
]

/** Find a partner by its PIN/code (case-insensitive, trimmed). */
export function findPartnerByCode(code) {
  const normalized = String(code || '').trim().toLowerCase()
  if (!normalized) return null
  return PARTNER_SCHOOLS.find((p) => p.code.toLowerCase() === normalized) || null
}
