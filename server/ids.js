import { randomBytes } from 'crypto'

// Prefixed, reasonably-unique ids that mirror the client's uid() style.
export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${randomBytes(4).toString('hex')}`
}
