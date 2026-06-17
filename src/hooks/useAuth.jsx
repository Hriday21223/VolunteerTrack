import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { keys, read, write, remove } from '@/lib/storage.js'
import {
  findUserByEmail, verifyPassword, createUser, updateUser as persistUser,
} from '@/api/index.js'

const AuthContext = createContext(null)

const SESSION_KEY = `${keys.user}::session`

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => read(SESSION_KEY, null))

  // Keep the session in sync across tabs.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === SESSION_KEY) setUser(e.newValue ? JSON.parse(e.newValue) : null)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const login = useCallback(async (email, password) => {
    const account = findUserByEmail(email)
    if (!account) throw new Error('No account with that email.')
    if (!verifyPassword(account, password)) throw new Error('Incorrect password.')
    const { passwordHash, ...safe } = account
    write(SESSION_KEY, safe)
    setUser(safe)
    return safe
  }, [])

  const register = useCallback(async (data) => {
    const account = createUser(data)
    const { passwordHash, ...safe } = account
    write(SESSION_KEY, safe)
    setUser(safe)
    return safe
  }, [])

  const logout = useCallback(() => {
    remove(SESSION_KEY)
    setUser(null)
  }, [])

  const updateProfile = useCallback((patch) => {
    if (!user) return null
    const updated = persistUser(user.id, patch)
    if (!updated) return null
    const { passwordHash, ...safe } = updated
    write(SESSION_KEY, safe)
    setUser(safe)
    return safe
  }, [user])

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook and provider live together on purpose (standard React context idiom).
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
