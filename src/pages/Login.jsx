import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth.jsx'
import Card from '@/components/Card.jsx'
import Toast from '@/components/Toast.jsx'

export default function Login() {
  const { login, loginWithPin } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const [mode, setMode] = useState('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pin, setPin] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [toast, setToast] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      if (mode === 'pin') {
        await loginWithPin(email, pin)
      } else {
        await login(email, password)
      }
      setToast(true)
      setTimeout(() => nav(loc.state?.from?.pathname || '/', { replace: true }), 600)
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.18),transparent_18%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.16),transparent_18%),linear-gradient(180deg,#08161b_0%,#0b1c24_45%,#0f1e16_100%)] text-white px-4 py-8">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-brand-100 shadow-soft backdrop-blur">
            <img src="/logo.png" alt="VolunTrack" className="w-5 h-5 object-contain" />
            VolunTrack login
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-white">Welcome back to the volunteer dashboard.</h1>
            <p className="max-w-2xl text-lg text-slate-300">
              Sign in and pick up where you left off—track hours, keep goals moving, and export your service record with confidence.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FeatureCard title="Fast logging" description="Jump straight to the hours form and save every session with proof and supervisor details." />
            <FeatureCard title="Progress tracking" description="See goal completion, weekly activity, and earned badges in one clean view." />
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-soft backdrop-blur text-sm text-slate-300">
            <div className="font-semibold text-white">Need help getting started?</div>
            <p className="mt-2 leading-6">Create an account, set your first goal, and log your first volunteer hours to earn a badge.</p>
          </div>
        </div>

        <div className="relative">
          <Card padded={false} className="overflow-hidden border border-white/10 bg-slate-950/80 shadow-soft">
            <div className="bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.14),transparent_25%)] p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-brand-200 uppercase tracking-[0.3em]">Secure sign in</p>
                  <h2 className="text-3xl font-bold text-white">Welcome back</h2>
                </div>
                <img src="/logo.png" alt="VolunTrack" className="w-12 h-12 object-contain" />
              </div>

              <div className="mb-4 inline-flex rounded-full bg-white/10 p-1">
                <button
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === 'password' ? 'bg-slate-900 text-white' : 'text-slate-300 hover:text-white'}`}
                  onClick={() => setMode('password')}
                >
                  Password
                </button>
                <button
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === 'pin' ? 'bg-slate-900 text-white' : 'text-slate-300 hover:text-white'}`}
                  onClick={() => setMode('pin')}
                >
                  PIN
                </button>
              </div>

              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <label className="label text-slate-300" htmlFor="email">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="email" type="email" required autoComplete="email"
                      className="input pl-9 bg-slate-900/80 text-white border-white/10"
                      placeholder="you@school.edu"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <label className="label text-slate-300" htmlFor="credential">{mode === 'pin' ? '4-digit PIN' : 'Password'}</label>
                    <Link to={mode === 'pin' ? '/reset-pin' : '/forgot-password'} className="text-xs text-sky-200 hover:text-white">
                      {mode === 'pin' ? 'Forgot PIN?' : 'Forgot?'}
                    </Link>
                  </div>
                  <div className="relative">
                    {mode === 'pin' ? (
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    ) : (
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    )}
                    <input
                      id="credential"
                      type="password"
                      required
                      autoComplete={mode === 'pin' ? 'one-time-code' : 'current-password'}
                      inputMode={mode === 'pin' ? 'numeric' : 'text'}
                      pattern={mode === 'pin' ? '[0-9]*' : undefined}
                      className="input pl-9 bg-slate-900/80 text-white border-white/10"
                      placeholder={mode === 'pin' ? '••••' : '••••••••'}
                      value={mode === 'pin' ? pin : password}
                      onChange={(e) => (mode === 'pin' ? setPin(e.target.value) : setPassword(e.target.value))}
                    />
                  </div>
                </div>

                {err && <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">{err}</div>}

                <button type="submit" className="btn-primary w-full py-3 text-sm font-semibold" disabled={busy}>
                  {busy ? (mode === 'pin' ? 'Unlocking…' : 'Signing in…') : (mode === 'pin' ? <>Unlock <ArrowRight className="w-4 h-4" /></> : <>Sign in <ArrowRight className="w-4 h-4" /></>)}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-slate-400">
                New to VolunTrack?{' '}
                <Link to="/register" className="text-sky-200 font-semibold hover:text-white">Create an account</Link>
              </div>
            </div>
          </Card>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      </div>

      <Toast open={toast} onClose={() => setToast(false)}>Welcome back!</Toast>
    </div>
  )
}

function FeatureCard({ title, description }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-soft backdrop-blur">
      <div className="text-base font-semibold text-white">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  )
}
