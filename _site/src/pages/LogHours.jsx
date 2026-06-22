import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, Trash2, Upload, Mail, User, FileSignature, ShieldCheck } from 'lucide-react'
import { useData } from '@/hooks/useData.jsx'
import AppLayout from '@/components/AppLayout.jsx'
import Card from '@/components/Card.jsx'
import FileDrop from '@/components/FileDrop.jsx'
import Toast from '@/components/Toast.jsx'
import { ACTIVITY_CATEGORIES, categoryColor } from '@/lib/categories.js'
import { hoursBetween, fmtHours } from '@/utils/date.js'
import { format } from 'date-fns'

const blank = () => ({
  activity: '',
  category: ACTIVITY_CATEGORIES[0],
  date: format(new Date(), 'yyyy-MM-dd'),
  startTime: '',
  endTime: '',
  location: '',
  notes: '',
  supervisorName: '',
  supervisorEmail: '',
  supervisorSignature: '',
  proof: null,
  verified: false,
})

export default function LogHours({ editId, onCloseEdit }) {
  const { logs, addLog, editLog, removeLog } = useData()
  const nav = useNavigate()
  const [form, setForm] = useState(blank())
  const [toast, setToast] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editId) {
      const log = logs.find((l) => l.id === editId)
      if (log) setForm({ ...blank(), ...log })
    }
  }, [editId, logs])

  const hours = hoursBetween(
    form.date && form.startTime ? `${form.date}T${form.startTime}:00` : null,
    form.date && form.endTime   ? `${form.date}T${form.endTime}:00`   : null,
  )

  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const onSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!form.activity.trim()) { setError('Please enter an activity name.'); return }
    if (hours <= 0)             { setError('End time must be after start time.'); return }

    try {
      const payload = { ...form, hours, verified: !!form.verified }
      if (editId) {
        editLog(editId, payload)
        setToast(true)
        onCloseEdit?.()
      } else {
        addLog(payload)
        setForm(blank())
        setToast(true)
      }
    } catch (err) {
      setError('Could not save — your proof file might be too large. Try a smaller image.')
    }
  }

  return (
    <AppLayout
      title={editId ? 'Edit volunteer hours' : 'Log volunteer hours'}
      subtitle="Capture the who, what, when, and where of your service."
    >
      <form onSubmit={onSubmit} className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <SectionTitle>Activity</SectionTitle>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">What did you do? *</label>
                <input
                  className="input"
                  placeholder="Park cleanup, food drive, tutoring…"
                  value={form.activity} onChange={onChange('activity')} required
                />
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input" value={form.category} onChange={onChange('category')}>
                  {ACTIVITY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <div className="mt-2">
                  <span className={`chip ${categoryColor(form.category)}`}>{form.category}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle>When</SectionTitle>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Date *</label>
                <input className="input" type="date" required value={form.date} onChange={onChange('date')} />
              </div>
              <div>
                <label className="label">Start time *</label>
                <input className="input" type="time" required value={form.startTime} onChange={onChange('startTime')} />
              </div>
              <div>
                <label className="label">End time *</label>
                <input className="input" type="time" required value={form.endTime} onChange={onChange('endTime')} />
              </div>
            </div>
            <div className="mt-4 text-sm text-earth-600 dark:text-earth-300">
              Duration: <span className="font-semibold text-brand-700 dark:text-brand-300">{fmtHours(hours)}</span>
            </div>
          </Card>

          <Card>
            <SectionTitle>Where</SectionTitle>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Location</label>
                <input className="input" placeholder="123 Main St, Library, Online, etc." value={form.location} onChange={onChange('location')} />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea className="input min-h-[100px] resize-y" placeholder="Anything worth remembering…" value={form.notes} onChange={onChange('notes')} />
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle icon={ShieldCheck}>Supervisor verification</SectionTitle>
            <p className="text-sm text-earth-500 dark:text-earth-400 -mt-2 mb-4">
              Capture who can vouch for this work. Schools typically require a name and email.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field icon={User}        label="Supervisor name"  value={form.supervisorName} onChange={onChange('supervisorName')} placeholder="Mr. Johnson" />
              <Field icon={Mail}        label="Supervisor email" value={form.supervisorEmail} onChange={onChange('supervisorEmail')} placeholder="johnson@school.edu" type="email" />
              <div className="sm:col-span-2">
                <label className="label flex items-center gap-1.5"><FileSignature className="w-4 h-4" /> Digital signature (typed name)</label>
                <input className="input" placeholder="Type your full name to sign" value={form.supervisorSignature} onChange={onChange('supervisorSignature')} />
                <div className="hint">By typing your name, you confirm this work was completed as described.</div>
              </div>
              <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.verified} onChange={(e) => setForm((f) => ({ ...f, verified: e.target.checked }))} className="w-4 h-4 accent-brand-600" />
                Mark this entry as verified
              </label>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <SectionTitle icon={Upload}>Proof</SectionTitle>
            <p className="text-sm text-earth-500 dark:text-earth-400 -mt-2 mb-4">
              Upload a photo of a sign-in sheet, a thank-you email, or any supporting document.
            </p>
            <FileDrop
              value={form.proof}
              onFile={(f) => setForm((s) => ({ ...s, proof: f }))}
              onClear={() => setForm((s) => ({ ...s, proof: null }))}
            />
          </Card>

          <Card>
            {error && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300 px-3 py-2 rounded-lg mb-3">{error}</div>}
            <button type="submit" className="btn-primary w-full">
              <Save className="w-4 h-4" /> {editId ? 'Save changes' : 'Save hours'}
            </button>
            {editId && (
              <button
                type="button"
                className="btn-ghost w-full mt-2 text-red-600"
                onClick={() => { removeLog(editId); onCloseEdit?.() }}
              >
                <Trash2 className="w-4 h-4" /> Delete this entry
              </button>
            )}
            <button
              type="button"
              className="btn-ghost w-full mt-2"
              onClick={() => nav('/calendar')}
            >
              View all entries
            </button>
          </Card>
        </div>
      </form>

      <Toast open={toast} onClose={() => setToast(false)}>
        {editId ? 'Entry updated' : 'Hours saved — nice work!'}
      </Toast>
    </AppLayout>
  )
}

function SectionTitle({ children, icon: Icon }) {
  return (
    <h2 className="font-display font-semibold text-lg flex items-center gap-2 mb-4">
      {Icon && <Icon className="w-4 h-4 text-brand-600" />}
      {children}
    </h2>
  )
}

function Field({ icon: Icon, label, ...rest }) {
  return (
    <div>
      <label className="label flex items-center gap-1.5">{Icon && <Icon className="w-4 h-4" />}{label}</label>
      <input className="input" {...rest} />
    </div>
  )
}
