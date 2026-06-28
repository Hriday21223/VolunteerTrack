import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Plus, Trash2, Star, LogOut, Bell, ShieldCheck, Info, Lock, Shield, Copy, Eye, EyeOff, QrCode, School, Upload } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth.jsx'
import { useData } from '@/hooks/useData.jsx'
import { hashPin, sendPasswordResetCode, clearPasswordResetCode } from '@/api/index.js'
import AppLayout from '@/components/AppLayout.jsx'
import Card from '@/components/Card.jsx'
import Toast from '@/components/Toast.jsx'
import QRCode from 'qrcode'

export default function Settings() {

  const { user, logout, deleteAccount, updateProfile, setSyncPin: setSyncPinAuth } = useAuth()
  const { goals, saveGoal, removeGoal } = useData()
  const nav = useNavigate()
  const [newGoal, setNewGoal] = useState({ title: '', targetHours: 50, primary: false })
  const [toast, setToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [pinSaved, setPinSaved] = useState(false)
  const [displaySyncPin, setDisplaySyncPin] = useState('')
  const [showSyncPin, setShowSyncPin] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [syncPassword, setSyncPassword] = useState('')
  const [showSyncPasswordPrompt, setShowSyncPasswordPrompt] = useState(false)
  const [showPwText, setShowPwText] = useState(false)
  const [syncPasswordBusy, setSyncPasswordBusy] = useState(false)
  const [schoolCode, setSchoolCode] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [schoolBusy, setSchoolBusy] = useState(false)
  const [pdfs, setPdfs] = useState([])
  const [showSchool, setShowSchool] = useState(false)
  const [schoolInfo, setSchoolInfo] = useState(null)
  const [showQR, setShowQR] = useState(false)
  const qrCanvasRef = useRef(null)

  useEffect(() => {
    if (showQR && displaySyncPin && qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, displaySyncPin, {
        width: 200,
        margin: 2,
        color: { dark: '#111827', light: '#ffffff' },
      })
    }
  }, [showQR, displaySyncPin])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setIsMobile(mq.matches)
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Load sync PIN from user profile on mount
  useEffect(() => {
    if (user?.syncPin) {
      setDisplaySyncPin(user.syncPin)
      setShowSyncPin(true)
    }
  }, [user?.syncPin])

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('')

  const addGoal = (e) => {
    e.preventDefault()
    if (!newGoal.title.trim()) return
    saveGoal({ ...newGoal, title: newGoal.title.trim(), targetHours: Number(newGoal.targetHours) || 0 })
    setNewGoal({ title: '', targetHours: 50, primary: false })
    setToastMessage('Goal added')
    setToast(true)
  }

  const handleDeleteAccount = () => {
    if (!user) return
    deleteAccount()
    nav('/login')
  }

  useEffect(() => {
    if (!user?.schoolId) return
    ;(async () => {
      try {
        const res = await fetch(`${apiUrl}/school/info?id=${user.schoolId}`)
        if (!res.ok) return
        const data = await res.json()
        if (data.school) setSchoolInfo(data.school)
      } catch {}
    })()
  }, [user?.schoolId])

  const savePin = () => {
    if (!user) return
    if (!/^[0-9]{4}$/.test(pin)) return
    if (pin !== pinConfirm) return
    updateProfile({ pinHash: hashPin(pin) })
    setPin('')
    setPinConfirm('')
    setPinSaved(true)
    setToastMessage('PIN saved')
    setToast(true)
  }

  const makePrimary = (id) => {
    goals.forEach((g) => saveGoal({ ...g, primary: g.id === id }))
  }

  const generateSyncPin = async () => {
    try {
      const newPin = Math.floor(10000 + Math.random() * 90000).toString()

      const token = localStorage.getItem('voluntrack:auth_token')
      if (!token) {
        setSyncPassword('')
        setShowSyncPasswordPrompt(true)
        setDisplaySyncPin(newPin)
        return
      }

      await setSyncPinAuth(newPin)
      setDisplaySyncPin(newPin)
      setShowSyncPin(true)
      setToastMessage('Sync PIN generated')
      setToast(true)
    } catch (error) {
      setToastMessage(error.message || 'Failed to generate sync PIN')
      setToast(true)
    }
  }

  const confirmSyncPin = async () => {
    if (!syncPassword) return
    if (!displaySyncPin) return
    setSyncPasswordBusy(true)
    const apiUrl = import.meta.env.VITE_API_URL || '/api'
    try {
      const response = await fetch(`${apiUrl}/auth/sync-pin-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, password: syncPassword, syncPin: displaySyncPin }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to link account')

      localStorage.setItem('voluntrack:auth_token', data.token)
      setShowSyncPin(true)
      setShowSyncPasswordPrompt(false)
      setSyncPassword('')
      setToastMessage('Account linked! Sync PIN generated.')
      setToast(true)
      return
    } catch (error) {
      // If password is incorrect, try to sync the database password
      // using a locally-generated recovery code
      if (error.message === 'Password is incorrect.') {
        try {
          const updated = sendPasswordResetCode(user.email)
          if (updated && updated.resetPasswordCode) {
            const code = updated.resetPasswordCode
            const sendRes = await fetch(`${apiUrl}/send-reset-email`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: user.email, code, type: 'password' }),
            })
            if (sendRes.ok || sendRes.status === 500 || sendRes.status === 503) {
              const resetRes = await fetch(`${apiUrl}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, code, newPassword: syncPassword }),
              })
              if (resetRes.ok) {
                clearPasswordResetCode(user.email)
                const retryRes = await fetch(`${apiUrl}/auth/sync-pin-auth`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: user.email, password: syncPassword, syncPin: displaySyncPin }),
                })
                const retryData = await retryRes.json()
                if (retryRes.ok) {
                  localStorage.setItem('voluntrack:auth_token', retryData.token)
                  setShowSyncPin(true)
                  setShowSyncPasswordPrompt(false)
                  setSyncPassword('')
                  setToastMessage('Password synced! Sync PIN generated.')
                  setToast(true)
                  return
                }
              }
            }
          }
        } catch {
          // fall through to error message below
        }
      }
      setToastMessage(error.message || 'Failed to link account')
      setToast(true)
    } finally {
      setSyncPasswordBusy(false)
    }
  }

  const copySyncPin = () => {
    navigator.clipboard.writeText(displaySyncPin)
    setToastMessage('PIN copied to clipboard')
    setToast(true)
  }

  return (
    <AppLayout title="Settings" subtitle="Make VolunTrack your own.">
      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><Star className="w-4 h-4 text-amber-500" /> Goals</h3>
          <p className="text-sm text-earth-500 dark:text-earth-400 mb-4">Set a target and we'll track your progress toward it. The primary goal powers your dashboard ring.</p>

          {goals.length === 0 ? (
            <div className="text-sm text-earth-500 dark:text-earth-400 py-4 text-center border border-dashed border-earth-200 dark:border-[#243529] rounded-xl mb-4">
              No goals yet — add one below.
            </div>
          ) : (
            <ul className="space-y-2 mb-4">
              {goals.map((g) => (
                <li key={g.id} className="flex items-center gap-3 p-3 rounded-xl border border-earth-100 dark:border-[#1f2e25]">
                  <button
                    onClick={() => makePrimary(g.id)}
                    className={`w-5 h-5 rounded-full border-2 ${g.primary ? 'bg-brand-500 border-brand-500' : 'border-earth-300 dark:border-[#3a4a3f]'}`}
                    title={g.primary ? 'Primary goal' : 'Make primary'}
                    aria-label="Toggle primary"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{g.title}</div>
                    <div className="text-xs text-earth-500 dark:text-earth-400">{g.targetHours}h target</div>
                  </div>
                  <button onClick={() => removeGoal(g.id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={addGoal} className="grid sm:grid-cols-[1fr_120px_auto] gap-2">
            <input
              className="input" placeholder="Goal title (e.g. 50 hours by June)"
              value={newGoal.title} onChange={(e) => setNewGoal((g) => ({ ...g, title: e.target.value }))}
            />
            <input
              type="number" min="1" className="input"
              value={newGoal.targetHours} onChange={(e) => setNewGoal((g) => ({ ...g, targetHours: e.target.value }))}
            />
            <button className="btn-primary"><Plus className="w-4 h-4" /> Add</button>
          </form>
        </Card>



        <Card>
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><Bell className="w-4 h-4 text-brand-600" /> Reminders</h3>
          <p className="text-sm text-earth-500 dark:text-earth-400">
            Reminder scheduling is coming soon. In the meantime, log your hours right after each session — it's the easiest habit to keep.
          </p>
        </Card>

        <Card>
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-brand-600" /> Privacy</h3>
          <p className="text-sm text-earth-500 dark:text-earth-400">
            Your data is stored only on this device. Nothing is uploaded to a server. Sign out below to clear your session.
          </p>
          <div className="text-xs text-earth-500 dark:text-earth-400 mt-3 space-y-1">
            <div>Signed in as <span className="font-medium text-earth-800 dark:text-earth-100">{user?.email}</span></div>
            <div>Role: <span className="font-medium text-earth-800 dark:text-earth-100 capitalize">{user?.role}</span></div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-brand-600" />
            <h3 className="font-display font-semibold">PIN unlock</h3>
          </div>
          <p className="text-sm text-earth-500 dark:text-earth-400 mb-4">
            Set a 4-digit PIN to unlock the app quickly. If you forget it, reset it with your email and a 6-digit recovery code.
          </p>
          <div className="space-y-3">
            <label className="label">New PIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="1234"
              className="input w-full bg-slate-900/80 text-white border-white/10"
            />
            <label className="label">Confirm PIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pinConfirm}
              onChange={(e) => setPinConfirm(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="1234"
              className="input w-full bg-slate-900/80 text-white border-white/10"
            />
            <button
              type="button"
              onClick={savePin}
              disabled={!/^[0-9]{4}$/.test(pin) || pin !== pinConfirm}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save PIN
            </button>
            <div className="text-xs text-earth-400">
              Forgot your PIN? <Link to="/reset-pin" className="text-brand-700 hover:underline">Reset PIN via email</Link>.
            </div>
            {pinSaved && <div className="text-sm text-emerald-300">PIN saved. Use it on the login screen.</div>}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-brand-600" />
            <h3 className="font-display font-semibold">
              {isMobile ? 'Laptop sync PIN' : 'Mobile sync PIN'}
            </h3>
          </div>
          <p className="text-sm text-earth-500 dark:text-earth-400 mb-4">
            {isMobile
              ? 'Generate a 5-digit PIN to sync your account with your laptop. Share this PIN with your computer to access your data.'
              : 'Generate a 5-digit PIN to sync your account with the mobile app. Share this PIN with your mobile device to access your data.'}
          </p>
          {showSyncPasswordPrompt ? (
            <div className="space-y-3">
              <div className="p-4 bg-slate-900/80 rounded-xl border border-amber-500/30">
                <p className="text-xs text-amber-300 mb-2">
                  To enable cross-device sync, enter your account password to link this device to the server.
                </p>
                <div className="relative">
                  <input
                    type={showPwText ? 'text' : 'password'}
                    value={syncPassword}
                    onChange={(e) => setSyncPassword(e.target.value)}
                    placeholder="Your password"
                    className="input w-full bg-slate-900/80 text-white border-white/10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwText(!showPwText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 hover:text-white"
                    tabIndex={-1}
                  >
                    {showPwText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                onClick={confirmSyncPin}
                disabled={!syncPassword || syncPasswordBusy}
                className="btn-primary w-full"
              >
                {syncPasswordBusy ? 'Linking…' : 'Link account & generate PIN'}
              </button>
              <button
                onClick={() => { setShowSyncPasswordPrompt(false); setSyncPassword('') }}
                className="btn-ghost w-full text-sm"
              >
                Cancel
              </button>
            </div>
          ) : !showSyncPin ? (
            <button
              onClick={generateSyncPin}
              className="btn-primary w-full"
            >
              Generate {isMobile ? 'laptop' : 'mobile'} sync PIN
            </button>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-slate-900/80 rounded-xl border border-white/10">
                <div className="text-xs text-earth-400 mb-1">Your sync PIN</div>
                <div className="text-2xl font-mono font-bold text-white tracking-wider">{displaySyncPin}</div>
              </div>
              {showQR ? (
                <div className="flex justify-center p-4 bg-white rounded-xl">
                  <canvas ref={qrCanvasRef} />
                </div>
              ) : (
                <button onClick={() => setShowQR(true)} className="btn-secondary w-full">
                  <QrCode className="w-4 h-4 mr-2" /> Show QR code
                </button>
              )}
              <button onClick={copySyncPin} className="btn-secondary w-full">
                <Copy className="w-4 h-4 mr-2" /> Copy PIN
              </button>
              <button onClick={generateSyncPin} className="btn-ghost w-full text-sm">
                Generate new PIN
              </button>
            </div>
          )}
        </Card>

        <Card className="border-red-500/30 bg-red-950/10">
          <div className="inline-flex items-center gap-3 rounded-3xl border border-red-500/40 bg-red-600/10 px-4 py-3 text-sm font-semibold text-red-100 shadow-sm shadow-red-500/10 mb-4">
            <span className="inline-flex h-3 w-3 rounded-full bg-red-400 shadow-red-500/30 shadow-md" />
            <span className="uppercase tracking-[0.22em] text-red-100/90">Warning</span>
            <span className="text-red-100 max-w-xl">Deleting your account will remove all local VolunTrack data and cannot be undone.</span>
          </div>
          <h3 className="font-display font-semibold mb-3 text-red-300">Delete account</h3>
          <p className="text-sm text-earth-500 dark:text-earth-400 mb-4">
            Remove your local account and all VolunTrack data stored on this device. This action cannot be undone.
          </p>
          {confirmDelete ? (
            <div className="space-y-4">
              <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-red-100">
                <p className="font-semibold">Confirm account deletion</p>
                <p className="text-sm text-red-100/80">This is permanent. Your volunteer logs, goals, achievements, and reminder data will be erased.</p>
              </div>
              <div className="space-y-3">
                <div className="text-sm text-earth-200">Type <span className="font-semibold text-black">delete</span> to confirm.</div>
                <input
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="Type delete to confirm"
                  className="input w-full bg-slate-900/80 text-white border-white/10"
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmationText.trim().toLowerCase() !== 'delete'}
                  className="btn-danger w-full disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Yes, delete everything
                </button>
                <button onClick={() => { setConfirmDelete(false); setDeleteConfirmationText('') }} className="btn-secondary w-full">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="btn-danger w-full">
              <Trash2 className="w-4 h-4 mr-2" /> Delete account
            </button>
          )}
        </Card>

        {user?.role !== 'school' && user?.role !== 'admin' && (
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <School className="w-4 h-4 text-brand-600" />
              <h3 className="font-display font-semibold">School</h3>
            </div>
            {user.schoolId ? (
              <div className="space-y-3">
                {schoolInfo && (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                    <p className="font-medium">{schoolInfo.name}</p>
                    <p className="text-earth-400">Code: <span className="font-mono">{schoolInfo.pin}</span></p>
                  </div>
                )}
                <p className="text-sm text-earth-500 dark:text-earth-400">Upload verification PDFs for approval.</p>
                <Link to="/school/dashboard" className="btn-secondary w-full flex items-center justify-center">
                  <Upload className="w-4 h-4 mr-2" /> Upload & view PDFs
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-earth-500 dark:text-earth-400">Enter your school code to link your account.</p>
                <input
                  type="text"
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="cisd-12345"
                  className="input w-full"
                />
                <button
                  onClick={async () => {
                    if (!schoolCode) return
                    setSchoolBusy(true)
                    try {
                      const token = localStorage.getItem('voluntrack:auth_token')
                      const apiUrl = import.meta.env.VITE_API_URL || '/api'
                      const res = await fetch(`${apiUrl}/school/join`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ pin: schoolCode }),
                      })
                      const data = await res.json()
                      if (!res.ok) throw new Error(data.error || 'Failed to join')
                      setToastMessage('School linked!')
                      setToast(true)
                      setSchoolCode('')
                      window.location.reload()
                    } catch (e) {
                      setToastMessage(e.message)
                      setToast(true)
                    } finally {
                      setSchoolBusy(false)
                    }
                  }}
                  disabled={!schoolCode || schoolBusy}
                  className="btn-primary w-full"
                >
                  {schoolBusy ? 'Joining…' : 'Join school'}
                </button>
              </div>
            )}
          </Card>
        )}

        {user?.role === 'school' && (
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <School className="w-4 h-4 text-brand-600" />
              <h3 className="font-display font-semibold">School dashboard</h3>
            </div>
            <p className="text-sm text-earth-500 dark:text-earth-400 mb-4">View students, review uploaded PDFs, and manage approvals.</p>
            <Link to="/school/dashboard" className="btn-primary w-full flex items-center justify-center">
              Open school dashboard
            </Link>
          </Card>
        )}

        {user?.role === 'admin' && (
          <Card className="lg:col-span-2">
            <Link to="/admin" className="block p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span className="font-semibold text-earth-900 dark:text-earth-100">Admin inbox</span>
              </div>
              <p className="text-sm text-earth-500 dark:text-earth-400">Review contact form submissions.</p>
            </Link>
          </Card>
        )}

        <Card className="lg:col-span-2">
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><Info className="w-4 h-4 text-brand-600" /> About</h3>
          <p className="text-sm text-earth-500 dark:text-earth-400">
            VolunTrack co. Visit the <Link to="/about" className="text-brand-700 dark:text-brand-300 hover:underline">About page</Link> or <Link to="/contact" className="text-brand-700 dark:text-brand-300 hover:underline">get in touch</Link>.
          </p>
        </Card>

        <Card className="lg:col-span-2">
          <button
            onClick={() => { logout(); nav('/login') }}
            className="btn-danger w-full"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </Card>
      </div>

      <Toast open={toast} onClose={() => setToast(false)}>{toastMessage}</Toast>
    </AppLayout>
  )
}
