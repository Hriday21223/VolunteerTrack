import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Mail, Lock, User as UserIcon, ArrowRight, School, GraduationCap, Hash } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth.jsx'
import Card from '@/components/Card.jsx'
import Toast from '@/components/Toast.jsx'

export default function Register() {
  const { register } = useAuth()
  const nav = useNavigate()
  const apiUrl = import.meta.env.VITE_API_URL || '/api'
  const [form, setForm] = useState({ name: '', email: '', password: '', pin: '', school: '', grade: '', schoolCode: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [toast, setToast] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setIsMobile(mq.matches)
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    if (form.password.length < 6) { setErr('Password must be at least 6 characters.'); return }
    if (form.pin && !/^[0-9]{4}$/.test(form.pin)) { setErr('PIN must be exactly 4 digits.'); return }
    setBusy(true)
    try {
      const user = await register(form)
      if (form.schoolCode && user) {
        const token = localStorage.getItem('voluntrack:auth_token')
        if (token) {
          await fetch(`${apiUrl}/school/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ pin: form.schoolCode }),
          })
        }
      }
      setToast(true)
      setTimeout(() => nav('/', { replace: true }), 600)
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 py-8 bg-gradient-to-br from-brand-50 via-earth-50 to-earth-100 dark:from-[#0f1813] dark:via-[#0f1813] dark:to-[#14201a]">
      <div className="w-full max-w-md">
        <Link to="/about" className="flex items-center gap-2.5 justify-center mb-6">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="VolunTrack" className="w-10 h-10 object-contain" />
          <span className="font-display font-bold text-2xl">VolunTrack</span>
        </Link>

        <Card padded={false} className="p-7">
          <h1 className="text-2xl font-bold mb-1">Create your account</h1>
          <p className="text-sm text-earth-500 dark:text-earth-400 mb-6">It only takes a minute.</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <Field icon={UserIcon}        label="Full name"           value={form.name}    onChange={onChange('name')}    placeholder="Jane Doe" required />
            <Field icon={Mail}            label="Email"               type="email"         value={form.email}   onChange={onChange('email')}   placeholder="you@school.edu" autoComplete="email" required />
            <Field icon={Lock}            label="Password"            type="password"      value={form.password} onChange={onChange('password')} placeholder="6+ characters" autoComplete="new-password" required />
            <Field icon={Lock}            label="Optional PIN"        type="password"      value={form.pin}      onChange={onChange('pin')}      placeholder="4-digit PIN" autoComplete="one-time-code" />
            <Field icon={School}          label="School / Organization" value={form.school} onChange={onChange('school')} placeholder="Lincoln High School" />
            <Field icon={Hash}            label="School code (optional)" value={form.schoolCode} onChange={onChange('schoolCode')} placeholder="cisd-12345" />
            <Field icon={GraduationCap}   label="Grade or Role"       value={form.grade}   onChange={onChange('grade')}   placeholder="11th grade / Volunteer lead" />

            {err && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300 px-3 py-2 rounded-lg">{err}</div>}

            <button type="submit" className="btn-primary w-full" disabled={busy}>
              {busy ? 'Creating account…' : <>Create account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="text-center text-sm text-earth-500 dark:text-earth-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-700 dark:text-brand-300 font-medium hover:underline">Sign in</Link>
          </div>

          <div className="text-center text-sm text-earth-500 dark:text-earth-400 mt-2">
            {isMobile ? 'Syncing from laptop?' : 'Syncing from mobile?'}{' '}
            <Link to="/sync-login" className="text-brand-700 dark:text-brand-300 font-medium hover:underline">Use sync PIN</Link>
          </div>
        </Card>
      </div>

      <Toast open={toast} onClose={() => setToast(false)}>Welcome to VolunTrack!</Toast>
    </div>
  )
}

function Field({ icon: Icon, label, type = 'text', ...rest }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />
        <input type={type} className="input pl-9" {...rest} />
      </div>
    </div>
  )
}
