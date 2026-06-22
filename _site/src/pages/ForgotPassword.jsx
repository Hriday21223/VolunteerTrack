import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Mail, ArrowRight, CheckCircle2 } from 'lucide-react'
import Card from '@/components/Card.jsx'
import { useAuth } from '@/hooks/useAuth.jsx'

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    setEmailError('')
    setEmailSent(false)

    try {
      const resetCode = await requestPasswordReset(email)
      setCode(resetCode)
      setSent(true)

      try {
        const response = await fetch('/api/send-reset-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: resetCode, type: 'password' }),
        })

        if (!response.ok) {
          const body = await response.json().catch(() => null)
          setEmailError(body?.error || 'Email service is unavailable.')
          return
        }

        setEmailSent(true)
      } catch (sendError) {
        setEmailError(sendError.message || 'Unable to send email.')
      }
    } catch (error) {
      setErr(error.message)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-gradient-to-br from-brand-50 via-earth-50 to-earth-100 dark:from-[#0f1813] dark:via-[#0f1813] dark:to-[#14201a]">
      <div className="w-full max-w-md">
        <Link to="/login" className="flex items-center gap-2.5 justify-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white shadow-soft">
            <Heart className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-2xl">VolunTrack</span>
        </Link>

        <Card padded={false} className="p-7">
          {sent ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 grid place-items-center text-brand-700 mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold mt-3">Recovery code ready</h1>
              <p className="text-sm text-earth-500 dark:text-earth-400 mt-2">
                The code for <span className="font-medium text-earth-800 dark:text-earth-100">{email}</span> is shown below.
              </p>
              <div className="rounded-2xl border border-brand-500/20 bg-brand-500/10 p-3 text-sm text-brand-900 dark:text-brand-100 mt-4">
                Recovery code: <span className="font-semibold">{code}</span>
              </div>
              {emailSent ? (
                <p className="mt-3 text-sm text-earth-500 dark:text-earth-400">Email has been queued for delivery.</p>
              ) : (
                <p className="mt-3 text-sm text-earth-500 dark:text-earth-400">Email delivery is not configured or failed, so the code is shown locally for testing.</p>
              )}
              {emailError && (
                <div className="mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-200">{emailError}</div>
              )}
              <Link to="/reset-password" state={{ email, code }} className="btn-primary mt-6 inline-flex">
                Continue to reset <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-1">Forgot password?</h1>
              <p className="text-sm text-earth-500 dark:text-earth-400 mb-6">
                Enter the email on your account and we'll generate a recovery code.
              </p>
              <form onSubmit={onSubmit} className="space-y-4">
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

                <button className="btn-primary w-full" type="submit">Generate recovery code</button>
              </form>
              <div className="text-center text-sm text-earth-500 dark:text-earth-400 mt-6">
                This app can send email if the backend is configured. When it isn't, the recovery code is shown locally for testing.
              </div>
              <div className="text-center text-sm text-earth-500 dark:text-earth-400 mt-3">
                Remembered it?{' '}
                <Link to="/login" className="text-brand-700 dark:text-brand-300 font-medium hover:underline">Back to sign in</Link>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
