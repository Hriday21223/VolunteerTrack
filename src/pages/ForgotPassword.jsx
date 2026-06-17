import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Mail, ArrowRight, CheckCircle2 } from 'lucide-react'
import Card from '@/components/Card.jsx'

/**
 * Local-only "forgot password" — we don't have a real email backend,
 * so this screen simply confirms the address and points the user to reset.
 */
export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

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
              <h1 className="text-2xl font-bold mt-3">Check your email</h1>
              <p className="text-sm text-earth-500 dark:text-earth-400 mt-2">
                If an account exists for <span className="font-medium text-earth-800 dark:text-earth-100">{email}</span>,
                we've sent reset instructions.
              </p>
              <Link to="/reset-password" className="btn-primary mt-6 inline-flex">
                Continue to reset <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-1">Forgot password?</h1>
              <p className="text-sm text-earth-500 dark:text-earth-400 mb-6">
                Enter the email on your account and we'll send you a reset link.
              </p>
              <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="space-y-4">
                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />
                    <input
                      type="email" required
                      className="input pl-9" placeholder="you@school.edu"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <button className="btn-primary w-full" type="submit">Send reset link</button>
              </form>
              <div className="text-center text-sm text-earth-500 dark:text-earth-400 mt-6">
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
