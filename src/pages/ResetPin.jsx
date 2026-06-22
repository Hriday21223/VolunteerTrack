import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Mail, Lock, CheckCircle2, Shield } from 'lucide-react'
import Card from '@/components/Card.jsx'
import { useAuth } from '@/hooks/useAuth.jsx'

export default function ResetPin() {
  const { requestPinReset, completePinReset } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [stage, setStage] = useState('request')
  const [sentCode, setSentCode] = useState('')
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)

  const sendCode = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      const code = await requestPinReset(email)
      setSentCode(code)
      setStage('verify')
    } catch (error) {
      setErr(error.message)
    }
  }

  const resetPin = async (e) => {
    e.preventDefault()
    setErr('')
    if (!/^[0-9]{4}$/.test(pin)) {
      setErr('PIN must be exactly 4 digits.')
      return
    }
    if (pin !== confirm) {
      setErr('PIN confirmation does not match.')
      return
    }

    try {
      await completePinReset(email, code, pin)
      setDone(true)
      setTimeout(() => nav('/login', { replace: true }), 1200)
    } catch (error) {
      setErr(error.message)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 py-8 bg-gradient-to-br from-brand-50 via-earth-50 to-earth-100 dark:from-[#0f1813] dark:via-[#0f1813] dark:to-[#14201a] text-earth-900 dark:text-earth-100">
      <div className="w-full max-w-md">
        <Link to="/login" className="flex items-center gap-2.5 justify-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white shadow-soft">
            <Heart className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-2xl">VolunTrack</span>
        </Link>

        <Card padded={false} className="p-7">
          {done ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 grid place-items-center text-brand-700 mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold mt-3">PIN reset complete</h1>
              <p className="text-sm text-earth-500 dark:text-earth-400 mt-2">
                Your new PIN has been saved. Return to login and unlock with your 4-digit PIN.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-brand-500" />
                <div>
                  <h1 className="text-2xl font-bold">Reset your PIN</h1>
                  <p className="text-sm text-earth-500 dark:text-earth-400">We’ll send a recovery code to your email.</p>
                </div>
              </div>

              {stage === 'request' ? (
                <form onSubmit={sendCode} className="space-y-4">
                  <div>
                    <label className="label">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />
                      <input
                        type="email"
                        required
                        className="input pl-9"
                        placeholder="you@school.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {err && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300 px-3 py-2 rounded-lg">{err}</div>}

                  <button className="btn-primary w-full" type="submit">Send recovery code</button>

                  <div className="text-sm text-earth-500 dark:text-earth-400">
                    This app can’t send real email, so the recovery code is shown after you submit.
                  </div>
                </form>
              ) : (
                <form onSubmit={resetPin} className="space-y-4">
                  <div>
                    <label className="label">Recovery code</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />
                      <input
                        type="text"
                        required
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        className="input pl-9"
                        placeholder="123456"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                        maxLength={6}
                      />
                    </div>
                  </div>

                  {sentCode && (
                    <div className="rounded-2xl border border-brand-500/20 bg-brand-500/10 p-3 text-sm text-brand-100">
                      Your recovery code is <span className="font-semibold">{sentCode}</span>. Use it within 15 minutes.
                    </div>
                  )}

                  <div>
                    <label className="label">New 4-digit PIN</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]{4}"
                      className="input"
                      placeholder="1234"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                      maxLength={4}
                    />
                  </div>

                  <div>
                    <label className="label">Confirm PIN</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]{4}"
                      className="input"
                      placeholder="1234"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value.replace(/[^0-9]/g, ''))}
                      maxLength={4}
                    />
                  </div>

                  {err && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300 px-3 py-2 rounded-lg">{err}</div>}

                  <button className="btn-primary w-full" type="submit">Save new PIN</button>
                </form>
              )}

              <div className="text-center text-sm text-earth-500 dark:text-earth-400 mt-6">
                <Link to="/login" className="text-brand-700 dark:text-brand-300 font-medium hover:underline">Back to login</Link>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
