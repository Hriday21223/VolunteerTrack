import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Link as LinkIcon, Loader2, CheckCircle, Users, HelpCircle, Copy, Mail } from 'lucide-react'
import AppLayout from '@/components/AppLayout.jsx'
import Card from '@/components/Card.jsx'
import Toast from '@/components/Toast.jsx'
import { useAuth } from '@/hooks/useAuth.jsx'

const apiUrl = import.meta.env.VITE_API_URL || '/api'

export default function LinkStudent() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [linkedChild, setLinkedChild] = useState(null)
  const [toast, setToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-character code.')
      return
    }
    setBusy(true)
    try {
      const token = localStorage.getItem('voluntrack:auth_token')
      const res = await fetch(`${apiUrl}/school/link-student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: code.toUpperCase() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to link')
      setSuccess(true)
      setLinkedChild(data.child || { name: 'Your child' })
      setToastMessage('Successfully linked to student!')
      setToast(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  if (success) {
    return (
      <AppLayout title="Link Successful" subtitle="You're now connected">
        <Card>
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Link Established!</h2>
            <p className="text-earth-400 mb-6">
              You are now linked to <span className="font-semibold text-white">{linkedChild?.name || 'your child'}</span>.
              You can now view their volunteer hours and track their progress.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row justify-center">
              <Link to="/parent/dashboard" className="btn-primary inline-flex items-center gap-2">
                <Users className="w-4 h-4" /> Go to Dashboard
              </Link>
              <button onClick={() => { setSuccess(false); setCode(''); setLinkedChild(null) }} className="btn-secondary inline-flex items-center gap-2">
                Link Another Child
              </button>
            </div>
          </div>
        </Card>

        <Toast open={toast} onClose={() => setToast(false)}>{toastMessage}</Toast>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title="Link to Student"
      subtitle="Connect to your child's account"
      action={
        <Link to="/parent/dashboard" className="btn-sm btn-ghost">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
        </Link>
      }
    >
      <div className="max-w-lg mx-auto">
        <Card className="mb-6">
          <h3 className="font-display font-semibold mb-4">Enter Linking Code</h3>
          <p className="text-sm text-earth-400 mb-6">
            Ask your child for their 6-character linking code. This code expires after 24 hours.
          </p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label">Linking Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                placeholder="ABC123"
                maxLength={6}
                className="input w-full text-center text-2xl font-mono tracking-widest"
                autoFocus
              />
              <p className="text-xs text-earth-500 mt-1 text-center">6 characters, uppercase and numbers</p>
            </div>
            {error && <div className="text-sm text-red-400 bg-red-900/20 px-3 py-2 rounded-lg">{error}</div>}
            <button type="submit" className="btn-primary w-full" disabled={busy || code.length !== 6}>
              {busy ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Linking...</span>
              ) : (
                <span className="flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Link to Student</span>
              )}
            </button>
          </form>
        </Card>

        <Card>
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-brand-400" /> How to Get a Linking Code
          </h3>
          <div className="space-y-4 text-sm text-earth-400">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-900/20 border border-brand-800/30 flex items-center justify-center shrink-0">
                <span className="font-bold text-brand-400">1</span>
              </div>
              <div>
                <p className="font-medium text-white">Ask your child to log in</p>
                <p>Your child needs to be logged into their VolunTrack account.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-900/20 border border-brand-800/30 flex items-center justify-center shrink-0">
                <span className="font-bold text-brand-400">2</span>
              </div>
              <div>
                <p className="font-medium text-white">Navigate to Settings</p>
                <p>Your child should go to Settings → Parent Linking and click "Generate linking code".</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-900/20 border border-brand-800/30 flex items-center justify-center shrink-0">
                <span className="font-bold text-brand-400">3</span>
              </div>
              <div>
                <p className="font-medium text-white">Share the code</p>
                <p>Your child can copy the code and send it to you via text, email, or show it in person.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-900/20 border border-brand-800/30 flex items-center justify-center shrink-0">
                <span className="font-bold text-brand-400">4</span>
              </div>
              <div>
                <p className="font-medium text-white">Enter the code above</p>
                <p>Type or paste the 6-character code in the field above and click "Link to Student".</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Toast open={toast} onClose={() => setToast(false)}>{toastMessage}</Toast>
    </AppLayout>
  )
}
