import { useRef, useState } from 'react'
import { Camera, Save, School, GraduationCap, User as UserIcon, Mail, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth.jsx'
import { useData } from '@/hooks/useData.jsx'
import AppLayout from '@/components/AppLayout.jsx'
import Card from '@/components/Card.jsx'
import Toast from '@/components/Toast.jsx'
import { fmtHours } from '@/utils/date.js'

const apiUrl = import.meta.env.VITE_API_URL || '/api'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const { logs } = useData()
  const fileRef = useRef(null)
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    school: user?.school || '',
    grade: user?.grade || '',
    avatar: user?.avatar || '',
  })
  const [toast, setToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('Profile saved')
  const [error, setError] = useState('')

  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [pwBusy, setPwBusy] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwDone, setPwDone] = useState(false)

  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const onPickAvatar = (file) => {
    if (!file) return
    if (file.size > 800_000) { setError('Avatar must be under 800 KB.'); return }
    const reader = new FileReader()
    reader.onload = () => setForm((f) => ({ ...f, avatar: reader.result }))
    reader.readAsDataURL(file)
  }

  const onSave = (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) { setError('Please enter your name.'); return }
    updateProfile({
      name: form.name.trim(),
      school: form.school.trim(),
      grade: form.grade.trim(),
      avatar: form.avatar,
    })
    setToastMsg('Profile saved')
    setToast(true)
  }

  const onChangePassword = async (e) => {
    e.preventDefault()
    setPwError('')
    setPwDone(false)
    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) { setPwError('Fill in all fields.'); return }
    if (pwForm.newPw.length < 6) { setPwError('New password must be at least 6 characters.'); return }
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Passwords do not match.'); return }
    setPwBusy(true)
    try {
      const token = localStorage.getItem('voluntrack:auth_token')
      const res = await fetch(`${apiUrl}/auth/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ email: user.email, currentPassword: pwForm.current, newPassword: pwForm.newPw }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update password')
      }
      setPwForm({ current: '', newPw: '', confirm: '' })
      setPwDone(true)
    } catch (err) {
      setPwError(err.message)
    } finally {
      setPwBusy(false)
    }
  }

  const total = logs.reduce((s, l) => s + (Number(l.hours) || 0), 0)
  const sessions = logs.length

  return (
    <AppLayout title="Profile" subtitle="Manage your info and how you appear in VolunTrack.">
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1 text-center">
          <div className="relative inline-block">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 grid place-items-center text-white text-4xl font-bold shadow-soft overflow-hidden">
              {form.avatar ? <img src={form.avatar} alt="" className="w-full h-full object-cover" /> : (form.name?.[0]?.toUpperCase() || 'V')}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-white dark:bg-[#14201a] border border-earth-200 dark:border-[#243529] grid place-items-center text-brand-700 dark:text-brand-300 shadow-card"
              aria-label="Change avatar"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => onPickAvatar(e.target.files?.[0])}
            />
          </div>
          <div className="mt-3 font-display font-semibold text-lg">{form.name || 'Volunteer'}</div>
          <div className="text-sm text-earth-500 dark:text-earth-400">{form.school || 'No school set'}</div>
          <div className="text-xs text-earth-500 dark:text-earth-400">{form.grade}</div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="font-display font-semibold mb-3">Account</h3>
          <form onSubmit={onSave} className="grid sm:grid-cols-2 gap-4">
            <Field icon={UserIcon}      label="Full name" value={form.name}  onChange={onChange('name')} required />
            <Field icon={Mail}          label="Email"     value={form.email} onChange={onChange('email')} disabled />
            <Field icon={School}        label="School / Organization" value={form.school} onChange={onChange('school')} />
            <Field icon={GraduationCap} label="Grade or Role"        value={form.grade}  onChange={onChange('grade')} />
            {error && <div className="sm:col-span-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300 px-3 py-2 rounded-lg">{error}</div>}
            <div className="sm:col-span-2">
              <button className="btn-primary" type="submit">
                <Save className="w-4 h-4" /> Save changes
              </button>
            </div>
          </form>
        </Card>

        <Card className="lg:col-span-3">
          <h3 className="font-display font-semibold mb-3">Change password</h3>
          <form onSubmit={onChangePassword} className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label flex items-center gap-1.5"><Lock className="w-4 h-4" /> Current password</label>
              <input type={showPw ? 'text' : 'password'} className="input" value={pwForm.current} onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))} required />
            </div>
            <div>
              <label className="label flex items-center gap-1.5"><Lock className="w-4 h-4" /> New password</label>
              <input type={showPw ? 'text' : 'password'} className="input" value={pwForm.newPw} onChange={(e) => setPwForm((f) => ({ ...f, newPw: e.target.value }))} required minLength={6} />
            </div>
            <div>
              <label className="label flex items-center gap-1.5"><Lock className="w-4 h-4" /> Confirm new</label>
              <div className="flex gap-2">
                <input type={showPw ? 'text' : 'password'} className="input flex-1" value={pwForm.confirm} onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))} required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="btn-ghost px-2" title={showPw ? 'Hide' : 'Show'}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {pwError && <div className="sm:col-span-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300 px-3 py-2 rounded-lg">{pwError}</div>}
            {pwDone && <div className="sm:col-span-3 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-300 px-3 py-2 rounded-lg flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Password updated</div>}
            <div className="sm:col-span-3">
              <button className="btn-primary" type="submit" disabled={pwBusy}>
                {pwBusy ? 'Updating\u2026' : 'Update password'}
              </button>
            </div>
          </form>
        </Card>

        <Card className="lg:col-span-3">
          <h3 className="font-display font-semibold mb-3">Your stats at a glance</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            <Stat label="Total hours" value={fmtHours(total)} />
            <Stat label="Sessions"    value={sessions} />
            <Stat label="Member since" value={new Date(user?.createdAt || Date.now()).getFullYear()} />
          </div>
        </Card>
      </div>

      <Toast open={toast} onClose={() => setToast(false)}>{toastMsg}</Toast>
    </AppLayout>
  )
}

function Field({ icon: Icon, label, ...rest }) {
  return (
    <div>
      <label className="label flex items-center gap-1.5">{Icon && <Icon className="w-4 h-4" />}{label}</label>
      <input className="input" {...rest} />
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-earth-50 dark:bg-[#0f1a14] p-3">
      <div className="text-xs text-earth-500 dark:text-earth-400">{label}</div>
      <div className="font-bold text-xl mt-0.5">{value}</div>
    </div>
  )
}
