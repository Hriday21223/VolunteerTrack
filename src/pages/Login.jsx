import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Heart, Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth.jsx'
import Card from '@/components/Card.jsx'
import Toast from '@/components/Toast.jsx'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [toast, setToast] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      await login(email, password)
      setToast(true)
      setTimeout(() => nav(loc.state?.from?.pathname || '/', { replace: true }), 600)
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-gradient-to-br from-brand-50 via-earth-50 to-earth-100 dark:from-[#0f1813] dark:via-[#0f1813] dark:to-[#14201a]">
      <div className="w-full max-w-md">
        <Link to="/about" className="flex items-center gap-2.5 justify-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white shadow-soft">
            <Heart className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-2xl">VolunTrack</span>
        </Link>

        <Card padded={false} className="p-7">
          <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-sm text-earth-500 dark:text-earth-400 mb-6">Sign in to continue tracking your service.</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />
                <input
                  id="email" type="email" required autoComplete="email"
                  className="input pl-9" placeholder="you@school.edu"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="label" htmlFor="pw">Password</label>
                <Link to="/forgot-password" className="text-xs text-brand-700 dark:text-brand-300 hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />
                <input
                  id="pw" type="password" required autoComplete="current-password"
                  className="input pl-9" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {err && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300 px-3 py-2 rounded-lg">{err}</div>}

            <button type="submit" className="btn-primary w-full" disabled={busy}>
              {busy ? 'Signing in…' : <>Sign in <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="text-center text-sm text-earth-500 dark:text-earth-400 mt-6">
            New to VolunTrack?{' '}
            <Link to="/register" className="text-brand-700 dark:text-brand-300 font-medium hover:underline">Create an account</Link>
          </div>
        </Card>

        <p className="text-center text-xs text-earth-400 mt-4">
          By signing in you agree to our community guidelines. <Link to="/about" className="hover:underline">Learn more</Link>.
        </p>
      </div>

      <Toast open={toast} onClose={() => setToast(false)}>Welcome back!</Toast>
    </div>
  )
}
