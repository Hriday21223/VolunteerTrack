import { useMemo, useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Mail, MessageSquare, ShieldCheck, Lock, XCircle, Sparkles, School, Users } from 'lucide-react'
import AppLayout from '@/components/AppLayout.jsx'
import Card from '@/components/Card.jsx'
import { useAuth } from '@/hooks/useAuth.jsx'

const apiUrl = import.meta.env.VITE_API_URL || '/api'

const ADMIN_EMAIL = 'karnatamhriday@gmail.com'
const ADMIN_PASSWORD = '122410'

function generateDraft(contact) {
  const subject = contact.subject || 'General question'
  const name = contact.name || 'there'

  const intros = [
    `Hi ${name},`,
    `Hello ${name},`,
    `Thanks for reaching out, ${name}.`,
  ]
  const intro = intros[contact.sentAt ? contact.sentAt.length % intros.length : 0]

  const closings = [
    '\n\nBest,\nThe VolunteerTrack Team',
    '\n\nCheers,\nThe VolunteerTrack Team',
    '\n\nThanks,\nThe VolunteerTrack Team',
  ]
  const closing = closings[contact.sentAt ? contact.sentAt.length % closings.length : 0]

  const bodies = {
    'General question': (
      `Thanks for your interest in VolunteerTrack!\n\nVolunteerTrack is a free, open-source PWA that lets students log service hours, set goals, earn badges, and export PDF reports — all without an account server. Everything stays on your device (privacy-first).\n\nIt runs on React 18 with Vite and works offline after the first visit. You can try it live at https://hriday21223.github.io/VolunteerTrack\n\nIf you have specific questions, feel free to reply to this email or open an issue on GitHub: https://github.com/Hriday21223/VolunteerTrack/issues`
    ),
    'Bug report': (
      `Thanks for reporting this! We appreciate your help making VolunteerTrack better.\n\nCould you share a few more details so we can look into it?\n- What browser and device are you using?\n- What steps did you take before the issue appeared?\n- Any error messages or screenshots?\n\nYou can also file an issue directly on GitHub: https://github.com/Hriday21223/VolunteerTrack/issues\n\nWe typically respond within a couple of days.`
    ),
    'Feature request': (
      `Thanks for the suggestion! We're always looking for ways to improve VolunteerTrack.\n\nHere's what's currently on our roadmap:\n- Phase 1 (shipped): Core logging, badges, reminders, reports\n- Phase 2 (shipped): Printable certificates, email-based PIN/password reset\n- Phase 3 (in progress): School & organization plans, verified supervisor flow, bulk CSV import\n\nYour idea sounds like it could fit well. Want to open a feature request on GitHub so we can track it? https://github.com/Hriday21223/VolunteerTrack/issues`
    ),
    'School or organization partnership': (
      `Thanks for your interest in partnering with VolunteerTrack!\n\nWe're actively building Phase 3, which includes:\n- School & organization plans\n- Verified supervisor flow\n- Bulk CSV import\n\nThis will make it easy for schools to adopt VolunteerTrack across their entire student body. We'd love to hear more about your needs.\n\nIn the meantime, the current version is free and open-source — you can try it at https://hriday21223.github.io/VolunteerTrack\n\nLet's continue the conversation on GitHub: https://github.com/Hriday21223/VolunteerTrack/issues`
    ),
  }

  const body = bodies[subject] || (
    `Thanks for your message! VolunteerTrack is a privacy-first volunteer hour tracker built for students and clubs. It's free, open-source, and works entirely in the browser.\n\nTry it: https://hriday21223.github.io/VolunteerTrack\n\nLet us know if you have any other questions!`
  )

  return intro + '\n\n' + body + closing
}

export default function Admin() {
  const nav = useNavigate()
  const { user } = useAuth()
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('voluntrack:admin-unlocked') === '1')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [drafts, setDrafts] = useState({})
  const [tab, setTab] = useState('inbox')
  const [schools, setSchools] = useState([])
  const [loadingSchools, setLoadingSchools] = useState(false)
  const [granting, setGranting] = useState(false)

  useEffect(() => {
    if (user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
  }, [user?.email])

  const grantAdmin = async () => {
    setGranting(true)
    try {
      const token = localStorage.getItem('voluntrack:auth_token')
      if (!token) return
      const res = await fetch(`${apiUrl}/auth/grant-admin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) { alert('Failed to grant admin. Are you logged in?'); return }
      const data = await res.json()
      localStorage.setItem('voluntrack:auth_token', data.token)
      window.location.reload()
    } catch { alert('Error contacting server.') } finally { setGranting(false) }
  }

  const loadSchools = useCallback(async () => {
    setLoadingSchools(true)
    try {
      const token = localStorage.getItem('voluntrack:auth_token')
      if (!token) return
      const res = await fetch(`${apiUrl}/school/admin/list`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 403) { setLoadingSchools(false); return }
      if (!res.ok) return
      const data = await res.json()
      setSchools(data.schools || [])
    } catch {} finally {
      setLoadingSchools(false)
    }
  }, [])

  const deleteSchool = async (id, name) => {
    if (!confirm(`Delete "${name}" and unlink all its students?`)) return
    try {
      const token = localStorage.getItem('voluntrack:auth_token')
      const res = await fetch(`${apiUrl}/school/admin/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed')
      loadSchools()
    } catch {}
  }

  const contacts = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('voluntrack:contacts') || '[]').sort((a, b) => b.sentAt - a.sentAt)
    } catch { return [] }
  }, [])

  useEffect(() => {
    if (unlocked) loadSchools()
  }, [unlocked, loadSchools])

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

  // Show access denied if user is not authorized
  if (!isAuthorized) {
    return (
      <AppLayout title="Admin" subtitle="Access denied">
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 grid place-items-center text-red-600 mx-auto mb-4">
              <XCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold text-earth-900 dark:text-earth-100 mb-2">Access Denied</h2>
            <p className="text-earth-600 dark:text-earth-400 mb-6">
              You don't have permission to access this area.
            </p>
            <button onClick={() => nav(-1)} className="btn-primary">
              Go Back
            </button>
          </div>
        </Card>
      </AppLayout>
    )
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

  const toggleDraft = (idx) => {
    setDrafts((prev) => {
      const next = { ...prev }
      if (next[idx]) {
        delete next[idx]
      } else {
        next[idx] = generateDraft(contacts[idx])
      }
      return next
    })
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
      title={tab === 'inbox' ? 'Contact inbox' : 'Manage schools'}
      subtitle={tab === 'inbox' ? `${contacts.length} message${contacts.length === 1 ? '' : 's'} received` : `${schools.length} school${schools.length === 1 ? '' : 's'} registered`}
      action={
        <div className="flex gap-2">
          <button onClick={() => setTab('inbox')} className={`btn-sm ${tab === 'inbox' ? 'btn-primary' : 'btn-ghost'}`}>
            <MessageSquare className="w-3.5 h-3.5 mr-1" /> Inbox
          </button>
          <button onClick={() => { setTab('schools'); loadSchools() }} className={`btn-sm ${tab === 'schools' ? 'btn-primary' : 'btn-ghost'}`}>
            <School className="w-3.5 h-3.5 mr-1" /> Schools
          </button>
          {user?.role !== 'admin' ? (
            <button onClick={grantAdmin} disabled={granting} className="btn-ghost text-yellow-500">
              {granting ? 'Granting…' : 'Grant admin'}
            </button>
          ) : null}
          <button onClick={logout} className="btn-ghost">Lock</button>
        </div>
      }
    >
      <Card className="mb-4">
        <div className="text-center py-3">
          <a href="https://groups.google.com/g/volunteertrack" target="_blank" rel="noreferrer" className="text-sm text-brand-700 dark:text-brand-300 hover:underline font-medium">
            VolunteerTrack Google Group →
          </a>
        </div>
      </Card>

      {tab === 'schools' ? (
        loadingSchools ? (
          <Card><p className="text-center text-earth-400 py-8">Loading schools…</p></Card>
        ) : schools.length === 0 ? (
          <Card>
            <div className="text-center py-12 text-earth-500">
              <School className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="font-medium text-earth-900 dark:text-earth-100">No schools registered</p>
              <p className="text-sm mt-1">Schools will appear here when they register.</p>
              <Link to="/school/register" className="btn-primary inline-flex mt-4">Register a school</Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {schools.map((s) => (
              <Card key={s.id} padded={false} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <School className="w-8 h-8 text-brand-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{s.name}</p>
                      <p className="text-xs text-earth-400">
                        Code: <span className="font-mono">{s.pin}</span>
                        {s.contact_email && ` · ${s.contact_email}`}
                      </p>
                      <p className="text-xs text-earth-500">
                        <Users className="w-3 h-3 inline mr-1" />
                        {s.student_count} student{s.student_count === 1 ? '' : 's'} ·
                        Joined {new Date(s.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => deleteSchool(s.id, s.name)} className="text-red-400 hover:text-red-300 p-2" title="Delete school">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : contacts.length === 0 ? (
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
                  {drafts[idx] && (
                    <div className="mt-3 p-3 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800">
                      <div className="text-xs font-semibold text-brand-700 dark:text-brand-300 mb-1">AI draft</div>
                      <p className="text-sm text-earth-700 dark:text-earth-300 whitespace-pre-wrap">{drafts[idx]}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => toggleDraft(idx)} className="p-2 rounded-lg text-earth-500 hover:text-brand-700 hover:bg-brand-500/10 self-start"
                    title={drafts[idx] ? 'Hide draft' : 'Generate draft reply'}>
                    <Sparkles className={`w-4 h-4 ${drafts[idx] ? 'text-brand-600' : ''}`} />
                  </button>
                  <button onClick={() => remove(idx)} className="p-2 rounded-lg text-earth-500 hover:text-red-600 hover:bg-red-500/10 self-start" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  )
}
