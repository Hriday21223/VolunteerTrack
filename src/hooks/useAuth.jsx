import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { keys, read, write, remove } from '@/lib/storage.js'
import {
  findUserByEmail, verifyPassword, createUser, updateUser as persistUser,
  deleteUser, clearUserData, verifyPin, hashPin, hashPassword, sendPinResetCode,
  isResetPinCodeValid, clearPinResetCode,
  sendPasswordResetCode, isResetPasswordCodeValid, clearPasswordResetCode,
  findUserBySyncPin, updateSyncPin,
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

  // Refresh user from backend on mount (syncs schoolId, role, etc.)
  useEffect(() => {
    const token = localStorage.getItem('voluntrack:auth_token')
    if (!token) return
    const apiUrl = import.meta.env.VITE_API_URL || '/api'
    fetch(`${apiUrl}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.user) {
          write(SESSION_KEY, data.user)
          setUser(data.user)
        }
      })
      .catch(() => {})
  }, [])

  const login = useCallback(async (email, password) => {
    // Try backend API first
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Login failed')
      }
      
      const data = await response.json()
      console.log('Backend login successful:', data.user)
      
      // Store the token for future authenticated requests
      localStorage.setItem('voluntrack:auth_token', data.token)
      
      // Store user session
      write(SESSION_KEY, data.user)
      setUser(data.user)
      return data.user
    } catch (error) {
      console.log('Backend login failed, falling back to local storage:', error.message)
      // Fallback to local storage for demo mode
      const account = findUserByEmail(email)
      if (!account) throw new Error('No account with that email.')
      if (!verifyPassword(account, password)) throw new Error('Incorrect password.')
      const { passwordHash, pinHash, resetPinCode, resetPinCodeExpiresAt, ...safe } = account
      write(SESSION_KEY, safe)
      setUser(safe)
      return safe
    }
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

  const loginWithSyncPin = useCallback(async (syncPin) => {
    console.log('Attempting login with sync PIN:', syncPin)
    
    // Try backend API first
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${apiUrl}/auth/sync-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ syncPin })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Invalid sync PIN')
      }
      
      const data = await response.json()
      console.log('Backend sync login successful:', data.user)
      
      // Store the token for future authenticated requests
      localStorage.setItem('voluntrack:auth_token', data.token)
      
      // Store user session
      write(SESSION_KEY, data.user)
      setUser(data.user)
      return data.user
    } catch (error) {
      console.log('Backend sync login failed, falling back to local storage:', error.message)
      // Fallback to local storage for demo mode
      const account = findUserBySyncPin(syncPin)
      console.log('Found account:', account ? account.email : 'none')
      if (!account) throw new Error('Invalid sync PIN.')
      const { passwordHash, pinHash, resetPinCode, resetPinCodeExpiresAt, ...safe } = account
      write(SESSION_KEY, safe)
      setUser(safe)
      return safe
    }
  }, [])

  const register = useCallback(async (data) => {
    // Try backend API first
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Registration failed')
      }
      
      const result = await response.json()
      console.log('Backend registration successful:', result.user)
      
      // Store the token for future authenticated requests
      localStorage.setItem('voluntrack:auth_token', result.token)
      
      // Store user session
      write(SESSION_KEY, result.user)
      setUser(result.user)
      return result.user
    } catch (error) {
      console.log('Backend registration failed, falling back to local storage:', error.message)
      // Fallback to local storage for demo mode
      const account = createUser(data)
      const { passwordHash, pinHash, resetPinCode, resetPinCodeExpiresAt, ...safe } = account
      write(SESSION_KEY, safe)
      setUser(safe)
      return safe
    }
  }, [])

  const logout = useCallback(() => {
    remove(SESSION_KEY)
    localStorage.removeItem('voluntrack:auth_token')
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
    // Update local storage first
    const account = findUserByEmail(email)
    if (!account) throw new Error('No account with that email.')
    if (!isResetPasswordCodeValid(account, code)) throw new Error('Invalid or expired code.')
    const updated = persistUser(account.id, { passwordHash: hashPassword(password), resetPasswordCode: null, resetPasswordCodeExpiresAt: null })
    if (!updated) throw new Error('Failed to update password.')

    // Also try to update the database password via the new API endpoint
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api'
      await fetch(`${apiUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword: password }),
      })
      // Non-blocking — user flow continues either way
    } catch {
      // Backend may not have this endpoint yet
    }

    return updated
  }, [])

  const setSyncPin = useCallback(async (pin) => {
    console.log('Setting sync PIN for user:', user?.email, 'PIN:', pin)
    if (!user) throw new Error('You must be logged in to set a sync PIN.')
    if (!/^\d{5}$/.test(pin)) throw new Error('Sync PIN must be exactly 5 digits.')
    
    // Try backend API first
    try {
      const token = localStorage.getItem('voluntrack:auth_token')
      if (!token) throw new Error('No auth token found')
      
      const apiUrl = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${apiUrl}/auth/sync-pin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ syncPin: pin })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update sync PIN')
      }
      
      const data = await response.json()
      console.log('Backend sync PIN updated:', data.user)
      // Update the user session with the sync PIN
      write(SESSION_KEY, data.user)
      setUser(data.user)
      return data.user
    } catch (error) {
      console.log('Backend sync PIN failed, falling back to local storage:', error.message)
      // Fallback to local storage for demo mode
      const updated = updateSyncPin(user.id, pin)
      console.log('Updated user with sync PIN:', updated?.syncPin)
      if (!updated) throw new Error('Failed to update sync PIN.')
      const { passwordHash, pinHash, resetPinCode, resetPinCodeExpiresAt, ...safe } = updated
      write(SESSION_KEY, safe)
      setUser(safe)
      return safe
    }
  }, [user])

  return (
    <AuthContext.Provider value={{ user, login, loginWithPin, loginWithSyncPin, register, logout, deleteAccount, updateProfile, requestPinReset, completePinReset, requestPasswordReset, completePasswordReset, setSyncPin }}>
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
