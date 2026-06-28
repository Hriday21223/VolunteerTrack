import { useState, useEffect, useCallback } from 'react'
import { ChevronDown, ChevronUp, MapPin, Calendar as CalIcon, Users, Clock, Phone, CheckCircle, XCircle } from 'lucide-react'
import AppLayout from '@/components/AppLayout.jsx'
import Card from '@/components/Card.jsx'
import Toast from '@/components/Toast.jsx'
import { useData } from '@/hooks/useData.jsx'

const apiUrl = import.meta.env.VITE_API_URL || '/api'

export default function MyTasks() {
  const { refreshLogs } = useData()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [logForm, setLogForm] = useState({ volunteerId: '', taskId: '', hours: '', date: '' })
  const [showLogForm, setShowLogForm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const loadTasks = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('voluntrack:auth_token')
      const res = await fetch(`${apiUrl}/school/public-tasks/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) { const d = await res.json(); setTasks(d.tasks || []) }
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { loadTasks() }, [loadTasks])

  const handleLogHours = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const token = localStorage.getItem('voluntrack:auth_token')
      const res = await fetch(`${apiUrl}/school/public-tasks/${logForm.taskId}/log-hours`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ volunteerId: logForm.volunteerId, hours: logForm.hours, date: logForm.date || undefined }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
      setToastMsg('Hours logged!'); setToast(true)
      setShowLogForm(false); setLogForm({ volunteerId: '', taskId: '', hours: '', date: '' })
      refreshLogs(); loadTasks()
    } catch (e) { setToastMsg(e.message); setToast(true) } finally { setBusy(false) }
  }

  const handleApprove = async (taskId, userId) => {
    try {
      const token = localStorage.getItem('voluntrack:auth_token')
      const res = await fetch(`${apiUrl}/school/public-tasks/${taskId}/approve/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
      setToastMsg('Signup approved — phone number shared'); setToast(true); loadTasks()
    } catch (e) { setToastMsg(e.message); setToast(true) }
  }

  const handleReject = async (taskId, userId) => {
    try {
      const token = localStorage.getItem('voluntrack:auth_token')
      const res = await fetch(`${apiUrl}/school/public-tasks/${taskId}/reject/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
      setToastMsg('Signup rejected'); setToast(true); loadTasks()
    } catch (e) { setToastMsg(e.message); setToast(true) }
  }

  const openLogForm = (taskId, volunteerId, taskDate) => {
    setLogForm({ volunteerId, taskId, hours: '', date: taskDate || '' })
    setShowLogForm(true)
  }

  return (
    <AppLayout
      title="My Tasks"
      subtitle="Needed Volunteers"
    >
      <div className="max-w-3xl mx-auto space-y-4">
        {loading ? (
          <Card><p className="text-center text-earth-500 py-8">Loading…</p></Card>
        ) : tasks.length === 0 ? (
          <Card>
            <p className="text-center text-earth-500 py-8">You haven't posted any tasks yet.</p>
          </Card>
        ) : tasks.map((t) => {
          const filled = Number(t.slots_filled)
          const total = Number(t.slots_total)
          const signups = t.signups || []
          const isExpanded = expanded === t.id
          return (
            <Card key={t.id} padded={false} className="p-4">
              <div
                className="flex items-start justify-between gap-4 cursor-pointer"
                onClick={() => setExpanded(isExpanded ? null : t.id)}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{t.title}</p>
                  <p className="text-sm text-earth-400 mt-1">{t.description}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-earth-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {t.location}</span>
                    <span className="flex items-center gap-1"><CalIcon className="w-3 h-3" /> {new Date(t.date).toLocaleDateString()}{t.time ? ` · ${t.time}` : ''}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {filled}/{total} signed up</span>
                  </div>
                  {t.phone && (
                    <p className="text-xs text-earth-500 mt-1 flex items-center gap-1"><Phone className="w-3 h-3" /> {t.phone}</p>
                  )}
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${t.status === 'open' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-earth-800 text-earth-400'}`}>
                    {t.status}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-earth-400" /> : <ChevronDown className="w-4 h-4 text-earth-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  {signups.length === 0 ? (
                    <p className="text-sm text-earth-500 text-center py-4">No one has signed up yet.</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-earth-400 uppercase tracking-wider">Volunteers signed up</p>
                      {signups.map((s) => (
                        <div key={s.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 p-3">
                          <div>
                            <p className="text-sm font-medium">{s.name}</p>
                            <p className="text-xs text-earth-400">{s.email}</p>
                            {s.status === 'approved' && (
                              <p className="text-xs text-emerald-400 mt-0.5">Approved</p>
                            )}
                            {s.status === 'rejected' && (
                              <p className="text-xs text-red-400 mt-0.5">Rejected</p>
                            )}
                            {s.status === 'pending' && (
                              <p className="text-xs text-amber-400 mt-0.5">Pending approval</p>
                            )}
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            {s.status === 'pending' && (
                              <>
                                <button onClick={() => handleApprove(t.id, s.id)} className="btn-sm text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-2 py-1">
                                  <CheckCircle className="w-3 h-3 mr-1" /> Approve
                                </button>
                                <button onClick={() => handleReject(t.id, s.id)} className="btn-sm text-xs bg-red-600 hover:bg-red-500 text-white rounded-lg px-2 py-1">
                                  <XCircle className="w-3 h-3 mr-1" /> Reject
                                </button>
                              </>
                            )}
                            {s.status === 'approved' && (
                              <button
                                onClick={() => openLogForm(t.id, s.id, t.date)}
                                className="btn-primary text-xs"
                              >
                                <Clock className="w-3 h-3 mr-1" /> Log hours
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {showLogForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowLogForm(false)}>
          <Card className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold mb-4">Log hours for volunteer</h3>
            <form onSubmit={handleLogHours} className="space-y-3">
              <div>
                <label className="label">Hours</label>
                <input type="number" step="0.5" min="0.5" className="input" placeholder="e.g. 2" value={logForm.hours} onChange={(e) => setLogForm({...logForm, hours: e.target.value})} required />
              </div>
              <div>
                <label className="label">Date</label>
                <input type="date" className="input" value={logForm.date} onChange={(e) => setLogForm({...logForm, date: e.target.value})} />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowLogForm(false)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1" disabled={busy}>{busy ? 'Saving…' : 'Log hours'}</button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <Toast open={toast} onClose={() => setToast(false)}>{toastMsg}</Toast>
    </AppLayout>
  )
}
