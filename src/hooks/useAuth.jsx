import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { keys, read, write, remove } from '@/lib/storage.js'
import {
  findUserByEmail, verifyPassword, createUser, updateUser as persistUser,
  deleteUser, clearUserData, verifyPin, hashPin, hashPassword, sendPinResetCode,
  isResetPinCodeValid, clearPinResetCode,
  sendPasswordResetCode, isResetPasswordCodeValid, clearPasswordResetCode,
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
    const { passwordHash, pinHash, resetPinCode, resetPinCodeExpiresAt, ...safe } = account
    write(SESSION_KEY, safe)
    setUser(safe)
    return safe
  }, [])

  const loginWithPin = useCallback(async (email, pin) => {
    const account = findUserByEmail(email)
    if (!account) throw new Error('No account with that email.')
    if (!verifyPin(account, pin)) throw new Error('Incorrect PIN.')
    const { passwordHash, pinHash, resetPinCode, resetPinCodeExpiresAt, ...safe } = account
    write(SESSION_KEY, safe)
    setUser(safe)
    return safe
  }, [])

  const register = useCallback(async (data) => {
    const account = createUser(data)
    const { passwordHash, pinHash, resetPinCode, resetPinCodeExpiresAt, ...safe } = account
    write(SESSION_KEY, safe)
    setUser(safe)
    return safe
  }, [])

  const logout = useCallback(() => {
    remove(SESSION_KEY)
    setUser(null)
  }, [])

  const deleteAccount = useCallback(() => {
    if (!user) return
    deleteUser(user.id)
    clearUserData()
    remove(SESSION_KEY)
    setUser(null)
  }, [user])

  const updateProfile = useCallback((patch) => {
    if (!user) return null
    const updated = persistUser(user.id, patch)
    if (!updated) return null
    const { passwordHash, pinHash, resetPinCode, resetPinCodeExpiresAt, ...safe } = updated
    write(SESSION_KEY, safe)
    setUser(safe)
    return safe
  }, [user])

  const requestPinReset = useCallback(async (email) => {
    const updated = sendPinResetCode(email)
    if (!updated) throw new Error('No account with that email.')
    return updated.resetPinCode
  }, [])

  const completePinReset = useCallback(async (email, code, pin) => {
    const account = findUserByEmail(email)
    if (!account) throw new Error('No account with that email.')
    if (!isResetPinCodeValid(account, code)) throw new Error('Invalid or expired code.')
    const updated = persistUser(account.id, { pinHash: hashPin(pin), resetPinCode: null, resetPinCodeExpiresAt: null })
    if (!updated) throw new Error('Failed to update PIN.')
    return updated
  }, [])

  const requestPasswordReset = useCallback(async (email) => {
    const updated = sendPasswordResetCode(email)
    if (!updated) throw new Error('No account with that email.')
    return updated.resetPasswordCode
  }, [])

  const completePasswordReset = useCallback(async (email, code, password) => {
    const account = findUserByEmail(email)
    if (!account) throw new Error('No account with that email.')
    if (!isResetPasswordCodeValid(account, code)) throw new Error('Invalid or expired code.')
    const updated = persistUser(account.id, { passwordHash: hashPassword(password), resetPasswordCode: null, resetPasswordCodeExpiresAt: null })
    if (!updated) throw new Error('Failed to update password.')
    return updated
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, loginWithPin, register, logout, deleteAccount, updateProfile, requestPinReset, completePinReset, requestPasswordReset, completePasswordReset }}>
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
