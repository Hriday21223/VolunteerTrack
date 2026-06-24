import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Moon, Sun, Plus, Trash2, Star, LogOut, Bell, ShieldCheck, Info, Lock, Shield } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth.jsx'
import { useData } from '@/hooks/useData.jsx'
import { useTheme } from '@/hooks/useTheme.js'
import { hashPin } from '@/api/index.js'
import AppLayout from '@/components/AppLayout.jsx'
import Card from '@/components/Card.jsx'
import Toast from '@/components/Toast.jsx'

export default function Settings() {
  const { theme, setTheme, toggle } = useTheme()
  const { user, logout, deleteAccount } = useAuth()
  const { goals, saveGoal, removeGoal } = useData()
  const nav = useNavigate()
  const [newGoal, setNewGoal] = useState({ title: '', targetHours: 50, primary: false })
  const [toast, setToast] = useState(false)
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [pinSaved, setPinSaved] = useState(false)

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('')

  const addGoal = (e) => {
    e.preventDefault()
    if (!newGoal.title.trim()) return
    saveGoal({ ...newGoal, title: newGoal.title.trim(), targetHours: Number(newGoal.targetHours) || 0 })
    setNewGoal({ title: '', targetHours: 50, primary: false })
    setToast(true)
  }

  const handleDeleteAccount = () => {
    if (!user) return
    deleteAccount()
    nav('/login')
  }

  const savePin = () => {
    if (!user) return
    if (!/^[0-9]{4}$/.test(pin)) return
    if (pin !== pinConfirm) return
    updateProfile({ pinHash: hashPin(pin) })
    setPin('')
    setPinConfirm('')
    setPinSaved(true)
    setToast(true)
  }

  const makePrimary = (id) => {
    goals.forEach((g) => saveGoal({ ...g, primary: g.id === id }))
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
          <h3 className="font-display font-semibold mb-3">Appearance</h3>
          <p className="text-sm text-earth-500 dark:text-earth-400 mb-4">Switch between light and dark mode. Your choice is remembered on this device.</p>
          <div className="flex gap-2">
            <button
              onClick={() => setTheme('light')}
              className={`btn flex-1 ${theme === 'light' ? 'bg-brand-600 text-white' : 'btn-secondary'}`}
            >
              <Sun className="w-4 h-4" /> Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`btn flex-1 ${theme === 'dark' ? 'bg-brand-600 text-white' : 'btn-secondary'}`}
            >
              <Moon className="w-4 h-4" /> Dark
            </button>
          </div>
          <button onClick={toggle} className="btn-ghost mt-3 w-full">Toggle automatically</button>
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
          <div className="text-xs text-earth-500 dark:text-earth-400 mt-3">
            Signed in as <span className="font-medium text-earth-800 dark:text-earth-100">{user?.email}</span>
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
              Forgot your PIN? <a href="/reset-pin" className="text-brand-700 hover:underline">Reset PIN via email</a>.
            </div>
            {pinSaved && <div className="text-sm text-emerald-300">PIN saved. Use it on the login screen.</div>}
          </div>
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

        <Card className="lg:col-span-2">
          <Link to="/admin" className="block p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span className="font-semibold text-earth-900 dark:text-earth-100">Admin inbox</span>
            </div>
            <p className="text-sm text-earth-500 dark:text-earth-400">Review contact form submissions.</p>
          </Link>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><Info className="w-4 h-4 text-brand-600" /> About</h3>
          <p className="text-sm text-earth-500 dark:text-earth-400">
            VolunTrack is built by Noothen's Workspace. Visit the <a href="/about" className="text-brand-700 dark:text-brand-300 hover:underline">About page</a> or <a href="/contact" className="text-brand-700 dark:text-brand-300 hover:underline">get in touch</a>.
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

      <Toast open={toast} onClose={() => setToast(false)}>Goal added</Toast>
    </AppLayout>
  )
}
