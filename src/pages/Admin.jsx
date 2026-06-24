import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Mail, MessageSquare, ShieldCheck, Lock } from 'lucide-react'
import AppLayout from '@/components/AppLayout.jsx'
import Card from '@/components/Card.jsx'

const ADMIN_PASSWORD = 'ADMIN2026'

export default function Admin() {
  const nav = useNavigate()
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('voluntrack:admin-unlocked') === '1')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')

  const contacts = useMemo(() =>
    JSON.parse(localStorage.getItem('voluntrack:contacts') || '[]').sort((a, b) => b.sentAt - a.sentAt)
  , [])

  const unlock = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setUnlocked(true)
      sessionStorage.setItem('voluntrack:admin-unlocked', '1')
      setErr('')
    } else {
      setErr('Incorrect password')
    }
  }

  if (!unlocked) {
    return (
      <AppLayout title="Admin" subtitle="Restricted access">
        <Card padded={false} className="p-6 max-w-sm mx-auto">
          <div className="text-center mb-4">
            <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 grid place-items-center text-brand-700 mx-auto mb-2">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="font-semibold text-earth-900 dark:text-earth-100">Enter admin password</h2>
            <p className="text-xs text-earth-500 mt-1">This area is for your team only.</p>
          </div>
          <form onSubmit={unlock} className="space-y-3">
            <input
              type="password"
              className="input text-center tracking-widest"
              placeholder="Enter password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErr('') }}
              autoFocus
            />
            {err && <div className="text-sm text-red-600 text-center">{err}</div>}
            <button type="submit" className="btn-primary w-full">Unlock</button>
            <button type="button" onClick={() => nav(-1)} className="btn-ghost w-full">Back</button>
          </form>
        </Card>
      </AppLayout>
    )
  }

  const remove = (idx) => {
    const next = contacts.filter((_, i) => i !== idx)
    localStorage.setItem('voluntrack:contacts', JSON.stringify(next))
    window.location.reload()
  }

  const clearAll = () => {
    if (!confirm('Delete all messages?')) return
    localStorage.setItem('voluntrack:contacts', JSON.stringify([]))
    window.location.reload()
  }

  const logout = () => {
    sessionStorage.removeItem('voluntrack:admin-unlocked')
    setUnlocked(false)
    setPassword('')
  }

  return (
    <AppLayout
      title="Contact inbox"
      subtitle={`${contacts.length} message${contacts.length === 1 ? '' : 's'} received`}
      action={
        <div className="flex gap-2">
          {contacts.length ? (
            <button onClick={clearAll} className="btn-ghost text-red-600">Clear all</button>
          ) : null}
          <button onClick={logout} className="btn-ghost">Lock</button>
        </div>
      }
    >
      {contacts.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-earth-500">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="font-medium text-earth-900 dark:text-earth-100">No messages yet</p>
            <p className="text-sm mt-1">New contact submissions will appear here automatically.</p>
            <Link to="/contact" className="btn-primary inline-flex mt-4">Go to contact page</Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {contacts.map((c, idx) => (
            <Card key={c.sentAt + idx} padded={false} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-earth-900 dark:text-earth-100">{c.name || 'Unknown'}</span>
                    <a href={`mailto:${c.email}`} className="text-brand-700 dark:text-brand-300 hover:underline text-sm break-all">{c.email}</a>
                    <span className="text-xs text-earth-500 whitespace-nowrap">{new Date(c.sentAt).toLocaleString()}</span>
                  </div>
                  <div className="mt-1 text-xs font-medium uppercase tracking-wide text-earth-600 dark:text-earth-300">{c.subject || 'General question'}</div>
                  <p className="mt-2 text-sm text-earth-800 dark:text-earth-200 whitespace-pre-wrap">{c.message}</p>
                </div>
                <button
                  onClick={() => remove(idx)}
                  className="p-2 rounded-lg text-earth-500 hover:text-red-600 hover:bg-red-500/10 self-start"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  )
}
