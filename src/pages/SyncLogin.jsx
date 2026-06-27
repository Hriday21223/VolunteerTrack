import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, ArrowRight, Smartphone, Monitor } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth.jsx'
import Card from '@/components/Card.jsx'
import Toast from '@/components/Toast.jsx'

export default function SyncLogin() {
  const { loginWithSyncPin } = useAuth()
  const nav = useNavigate()
  const [syncPin, setSyncPin] = useState('')
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

  const onSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      await loginWithSyncPin(syncPin)
      setToast(true)
      setTimeout(() => nav('/', { replace: true }), 600)
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.18),transparent_18%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.16),transparent_18%),linear-gradient(180deg,#08161b_0%,#0b1c24_45%,#0f1e16_100%)] text-white px-4 py-8">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-brand-100 shadow-soft backdrop-blur">
            {isMobile ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
            {isMobile ? 'Laptop sync' : 'Mobile sync'}
          </div>
        </div>

        <Card padded={false} className="overflow-hidden border border-white/10 bg-slate-950/80 shadow-soft">
          <div className="bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.14),transparent_25%)] p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-brand-200 uppercase tracking-[0.3em]">Sync your device</p>
                <h2 className="text-3xl font-bold text-white">Enter sync PIN</h2>
              </div>
              <Shield className="w-12 h-12 text-brand-400" />
            </div>

              <p className="text-sm text-slate-300 mb-6">
                {isMobile
                  ? 'Enter the 5-digit sync PIN from your laptop settings to access your account on this device.'
                  : 'Enter the 5-digit sync PIN from your mobile device to access your account here.'}
              </p>

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="label text-slate-300" htmlFor="syncPin">5-digit sync PIN</label>
                <input
                  id="syncPin"
                  type="text"
                  required
                  inputMode="numeric"
                  pattern="[0-9]{5}"
                  maxLength={5}
                  className="input bg-slate-900/80 text-white border-white/10 text-center text-2xl tracking-widest font-mono"
                  placeholder="12345"
                  value={syncPin}
                  onChange={(e) => setSyncPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 5))}
                />
              </div>

              {err && <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">{err}</div>}

              <button type="submit" className="btn-primary w-full py-3 text-sm font-semibold" disabled={busy}>
                {busy ? 'Syncing…' : <>Sync account <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-400">
              {isMobile ? 'Open on your laptop to generate a PIN.' : "Don't have the mobile app?"}{' '}
              {!isMobile && (
                <a href="https://github.com/hriday21223/VolunteerTrack" target="_blank" rel="noopener noreferrer" className="text-sky-200 font-semibold hover:text-white">
                  Get VolunTrack mobile
                </a>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Toast open={toast} onClose={() => setToast(false)}>Account synced successfully!</Toast>
    </div>
  )
}
