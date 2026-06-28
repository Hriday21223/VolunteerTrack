import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Upload, CheckCircle, XCircle, Clock, FileText, Download, Search, Users, MapPin, Calendar } from 'lucide-react'
import AppLayout from '@/components/AppLayout.jsx'
import Card from '@/components/Card.jsx'
import Toast from '@/components/Toast.jsx'
import { useAuth } from '@/hooks/useAuth.jsx'

const apiUrl = import.meta.env.VITE_API_URL || '/api'

export default function SchoolDashboard() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [tab, setTab] = useState('pdfs')
  const [pdfs, setPdfs] = useState([])
  const [students, setStudents] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [uploading, setUploading] = useState(false)
  const [selectedPdf, setSelectedPdf] = useState(null)
  const [addEmail, setAddEmail] = useState('')
  const [adding, setAdding] = useState(false)
  const [addErr, setAddErr] = useState('')
  const [subTab, setSubTab] = useState('reports')
  const [taskForm, setTaskForm] = useState({ title: '', description: '', location: '', date: '', time: '', slotsTotal: 1 })
  const [taskBusy, setTaskBusy] = useState(false)

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('voluntrack:auth_token')
      const headers = { Authorization: `Bearer ${token}` }

      const [pdfRes, taskRes] = await Promise.all([
        fetch(`${apiUrl}/school/pdfs`, { headers }),
        fetch(`${apiUrl}/school/public-tasks`),
      ])
      if (pdfRes.ok) {
        const data = await pdfRes.json()
        setPdfs(data.pdfs || [])
      }
      if (taskRes.ok) {
        const data = await taskRes.json()
        setTasks(data.tasks || [])
      }

      if (user.role === 'school') {
        const stuRes = await fetch(`${apiUrl}/school/students`, { headers })
        if (stuRes.ok) {
          const data = await stuRes.json()
          setStudents(data.students || [])
        }
      }
    } catch (e) {
      console.error('Load failed:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setToastMsg('File too large. Max 10MB.')
      setToast(true)
      return
    }
    setUploading(true)
    try {
      const token = localStorage.getItem('voluntrack:auth_token')
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result.split(',')[1]
        const res = await fetch(`${apiUrl}/school/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ filename: file.name, fileData: base64, fileType: file.type }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Upload failed')
        }
        setToastMsg('PDF uploaded!')
        setToast(true)
        loadData()
      }
      reader.readAsDataURL(file)
    } catch (e) {
      setToastMsg(e.message)
      setToast(true)
    } finally {
      setUploading(false)
    }
  }

  const reviewPdf = async (id, status) => {
    try {
      const token = localStorage.getItem('voluntrack:auth_token')
      const res = await fetch(`${apiUrl}/school/pdf/${id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update')
      setToastMsg(`PDF ${status}`)
      setToast(true)
      loadData()
    } catch (e) {
      setToastMsg(e.message)
      setToast(true)
    }
  }

  const viewPdf = async (id) => {
    try {
      const token = localStorage.getItem('voluntrack:auth_token')
      const res = await fetch(`${apiUrl}/school/pdf/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setSelectedPdf(data.pdf)
    } catch (e) {
      setToastMsg(e.message)
      setToast(true)
    }
  }

  const statusIcon = (status) => {
    if (status === 'approved') return <CheckCircle className="w-4 h-4 text-emerald-400" />
    if (status === 'rejected') return <XCircle className="w-4 h-4 text-red-400" />
    return <Clock className="w-4 h-4 text-amber-400" />
  }

  if (selectedPdf) {
    return (
      <AppLayout title="PDF Preview" subtitle={selectedPdf.filename}>
        <div className="max-w-4xl mx-auto">
          <Card className="mb-4">
            <button onClick={() => setSelectedPdf(null)} className="btn-ghost mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </button>
            <div className="flex items-center gap-2 mb-4">
              {statusIcon(selectedPdf.status)}
              <span className="text-sm font-medium capitalize">{selectedPdf.status}</span>
            </div>
            <div className="bg-white rounded-xl overflow-hidden" style={{ height: '80vh' }}>
              <embed src={`data:${selectedPdf.fileType};base64,${selectedPdf.fileData}`} type="application/pdf" className="w-full h-full" />
            </div>
            {user?.role === 'school' && selectedPdf.status === 'pending' && (
              <div className="flex gap-2 mt-4">
                <button onClick={() => reviewPdf(selectedPdf.id, 'approved')} className="btn-primary flex-1">
                  <CheckCircle className="w-4 h-4 mr-2" /> Approve
                </button>
                <button onClick={() => reviewPdf(selectedPdf.id, 'rejected')} className="btn-danger flex-1">
                  <XCircle className="w-4 h-4 mr-2" /> Reject
                </button>
              </div>
            )}
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title={user?.role === 'school' ? 'School Dashboard' : 'My Documents'}
      subtitle={user?.role === 'school' ? 'Review student uploads' : 'Upload verification documents'}
      action={
        <div className="flex gap-2">
          <button onClick={() => setTab('pdfs')} className={`btn-sm ${tab === 'pdfs' ? 'btn-primary' : 'btn-ghost'}`}>Reports</button>
          {user?.role === 'school' && (
            <button onClick={() => { setTab('students'); setSubTab('list') }} className={`btn-sm ${tab === 'students' ? 'btn-primary' : 'btn-ghost'}`}>Students</button>
          )}
          <button onClick={() => setTab('volunteer')} className={`btn-sm ${tab === 'volunteer' ? 'btn-primary' : 'btn-ghost'}`}>
            <Users className="w-3.5 h-3.5 mr-1" /> Volunteer
          </button>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-4">
        {user?.role === 'student' && (
          <Card>
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Upload className="w-4 h-4 text-brand-600" /> Upload verification PDF</h3>
            <p className="text-sm text-earth-500 dark:text-earth-400 mb-4">Upload volunteer hour verification documents for your school to review.</p>
            <label className="btn-primary inline-flex items-center cursor-pointer">
              {uploading ? 'Uploading…' : <><Upload className="w-4 h-4 mr-2" /> Choose PDF</>}
              <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </label>
          </Card>
        )}

        {tab === 'students' && user?.role === 'school' && (
          <>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setSubTab('list')} className={`btn-sm ${subTab === 'list' ? 'btn-primary' : 'btn-ghost'}`}>
                <Search className="w-3.5 h-3.5 mr-1" /> Student list ({students.length})
              </button>
              <button onClick={() => setSubTab('add')} className={`btn-sm ${subTab === 'add' ? 'btn-primary' : 'btn-ghost'}`}>
                <Upload className="w-3.5 h-3.5 mr-1" /> Add student
              </button>
            </div>

            {subTab === 'add' && (
              <Card>
                <h3 className="font-semibold mb-3">Add student by email</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault()
                  setAddErr('')
                  setAdding(true)
                  try {
                    const token = localStorage.getItem('voluntrack:auth_token')
                    const res = await fetch(`${apiUrl}/school/add-student`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ email: addEmail }),
                    })
                    const data = await res.json()
                    if (!res.ok) throw new Error(data.error || 'Failed')
                    setToastMsg('Student added!')
                    setToast(true)
                    setAddEmail('')
                    loadData()
                  } catch (e) { setAddErr(e.message) } finally { setAdding(false) }
                }} className="space-y-3">
                  <div className="flex gap-2">
                    <input type="email" className="input flex-1" placeholder="student@school.edu" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} required />
                    <button type="submit" className="btn-primary" disabled={adding}>{adding ? 'Adding…' : 'Add'}</button>
                  </div>
                  {addErr && <p className="text-sm text-red-500">{addErr}</p>}
                </form>
              </Card>
            )}

            {subTab === 'list' && (
              <Card>
                <h3 className="font-semibold mb-3 flex items-center gap-2"><Search className="w-4 h-4 text-brand-600" /> Students ({students.length})</h3>
                {students.length === 0 ? (
                  <p className="text-sm text-earth-500">No students linked to your school yet.</p>
                ) : (
                  <div className="divide-y divide-white/10">
                    {students.map((s) => (
                      <div key={s.id} className="py-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{s.name}</p>
                          <p className="text-xs text-earth-400">{s.email}{s.grade ? ` · ${s.grade}` : ''}</p>
                        </div>
                        <span className="text-xs text-earth-500">{new Date(s.created_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </>
        )}

        {tab === 'volunteer' && (
          <div className="space-y-4">
            <Card>
              <h3 className="font-semibold mb-3">Post a volunteer task</h3>
              <form onSubmit={async (e) => {
                e.preventDefault(); setTaskBusy(true)
                try {
                  const token = localStorage.getItem('voluntrack:auth_token')
                  const res = await fetch(`${apiUrl}/school/public-tasks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(taskForm),
                  })
                  if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
                  setTaskForm({ title: '', description: '', location: '', date: '', time: '', slotsTotal: 1 })
                  setToastMsg('Task posted!'); setToast(true); loadData()
                } catch (e) { setToastMsg(e.message); setToast(true) } finally { setTaskBusy(false) }
              }} className="space-y-3">
                <input className="input" placeholder="Task title" value={taskForm.title} onChange={(e) => setTaskForm({...taskForm, title: e.target.value})} required />
                <textarea className="input" rows={2} placeholder="Description" value={taskForm.description} onChange={(e) => setTaskForm({...taskForm, description: e.target.value})} required />
                <input className="input" placeholder="Location" value={taskForm.location} onChange={(e) => setTaskForm({...taskForm, location: e.target.value})} required />
                <div className="grid grid-cols-3 gap-2">
                  <input type="date" className="input" value={taskForm.date} onChange={(e) => setTaskForm({...taskForm, date: e.target.value})} required />
                  <input type="time" className="input" value={taskForm.time} onChange={(e) => setTaskForm({...taskForm, time: e.target.value})} />
                  <input type="number" className="input" min={1} placeholder="Slots" value={taskForm.slotsTotal} onChange={(e) => setTaskForm({...taskForm, slotsTotal: e.target.value})} />
                </div>
                <button type="submit" className="btn-primary w-full" disabled={taskBusy}>{taskBusy ? 'Posting…' : 'Post task'}</button>
              </form>
            </Card>

            {tasks.length === 0 ? (
              <Card><p className="text-center text-earth-500 py-8">No volunteer tasks yet.</p></Card>
            ) : tasks.map((t) => {
              const filled = Number(t.slots_filled)
              const total = Number(t.slots_total)
              const full = filled >= total
              return (
                <Card key={t.id} padded={false} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{t.title}</p>
                      <p className="text-sm text-earth-400 mt-1">{t.description}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-earth-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {t.location}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(t.date).toLocaleDateString()}{t.time ? ` · ${t.time}` : ''}</span>
                        <span>{filled}/{total} filled</span>
                      </div>
                    </div>
                    {!full && (
                      <button onClick={async () => {
                        try {
                          const token = localStorage.getItem('voluntrack:auth_token')
                          const res = await fetch(`${apiUrl}/school/public-tasks/${t.id}/signup`, {
                            method: 'POST',
                            headers: { Authorization: `Bearer ${token}` },
                          })
                          if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
                          setToastMsg('Signed up!'); setToast(true); loadData()
                        } catch (e) { setToastMsg(e.message); setToast(true) }
                      }} className="btn-primary text-sm">Sign up</button>
                    )}
                    {t.signed_up && <span className="text-xs text-emerald-400 font-medium">Signed up</span>}
                    {full && <span className="text-xs text-red-400 font-medium">Full</span>}
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {tab === 'pdfs' && (
        <div className="space-y-3">
          {loading ? (
            <p className="text-center text-earth-400 py-8">Loading…</p>
          ) : pdfs.length === 0 ? (
            <Card><p className="text-center text-earth-500 py-8">No PDFs yet.</p></Card>
          ) : pdfs.map((pdf) => (
            <Card key={pdf.id} padded={false} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <FileText className="w-8 h-8 text-brand-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{pdf.filename}</p>
                    <p className="text-xs text-earth-400">
                      {pdf.user_name && `${pdf.user_name} · `}
                      {new Date(pdf.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {statusIcon(pdf.status)}
                  <button onClick={() => viewPdf(pdf.id)} className="btn-ghost text-sm p-2">
                    <FileText className="w-4 h-4" />
                  </button>
                  {user?.role === 'school' && pdf.status === 'pending' && (
                    <>
                      <button onClick={() => reviewPdf(pdf.id, 'approved')} className="text-emerald-400 hover:text-emerald-300 p-1" title="Approve">
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button onClick={() => reviewPdf(pdf.id, 'rejected')} className="text-red-400 hover:text-red-300 p-1" title="Reject">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
        )}
      </div>

      <Toast open={toast} onClose={() => setToast(false)}>{toastMsg}</Toast>
    </AppLayout>
  )
}
