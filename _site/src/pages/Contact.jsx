import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ArrowLeft, Mail, MessageSquare, Send, CheckCircle2, Github, Twitter, Instagram } from 'lucide-react'
import Card from '@/components/Card.jsx'
import Toast from '@/components/Toast.jsx'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'General question', message: '' })
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const onSubmit = (e) => {
    e.preventDefault()
    if (!form.message.trim()) return
    setBusy(true)
    // Demo only: persist the message in localStorage so the user can see it was "sent."
    const list = JSON.parse(localStorage.getItem('voluntrack:messages') || '[]')
    list.push({ ...form, sentAt: new Date().toISOString() })
    localStorage.setItem('voluntrack:messages', JSON.stringify(list))
    setTimeout(() => {
      setBusy(false)
      setDone(true)
      setForm({ name: '', email: '', subject: 'General question', message: '' })
    }, 700)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-earth-50 to-earth-100 dark:from-[#0f1813] dark:via-[#0f1813] dark:to-[#14201a]">
      <header className="px-4 md:px-8 py-5 flex items-center justify-between">
        <Link to="/login" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white shadow-soft">
            <Heart className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-lg">VolunTrack</span>
        </Link>
        <Link to="/login" className="btn-ghost"><ArrowLeft className="w-4 h-4" /> Back to sign in</Link>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 pb-20">
        <h1 className="text-3xl md:text-4xl font-bold text-center">Contact us</h1>
        <p className="text-center text-earth-600 dark:text-earth-300 mt-3 max-w-xl mx-auto">
          Found a bug, have a feature request, or just want to say hi? We'd love to hear from you.
        </p>

        <div className="grid md:grid-cols-5 gap-6 mt-10">
          <Card className="md:col-span-3">
            <h2 className="font-display font-semibold text-lg mb-1 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-600" /> Send a message
            </h2>
            <p className="text-sm text-earth-500 dark:text-earth-400 mb-5">
              We typically reply within a couple of days.
            </p>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Your name</label>
                  <input className="input" value={form.name} onChange={onChange('name')} required />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input" value={form.email} onChange={onChange('email')} required />
                </div>
              </div>
              <div>
                <label className="label">What is it about?</label>
                <select className="input" value={form.subject} onChange={onChange('subject')}>
                  <option>General question</option>
                  <option>Bug report</option>
                  <option>Feature request</option>
                  <option>School or organization partnership</option>
                </select>
              </div>
              <div>
                <label className="label">Message</label>
                <textarea
                  className="input min-h-[140px] resize-y" required
                  value={form.message} onChange={onChange('message')}
                  placeholder="Tell us a little about what you need…"
                />
              </div>
              <button className="btn-primary" disabled={busy}>
                {busy ? 'Sending…' : <>Send message <Send className="w-4 h-4" /></>}
              </button>
            </form>
          </Card>

          <div className="md:col-span-2 space-y-4">
            <Card>
              <h3 className="font-display font-semibold flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-brand-600" /> Email
              </h3>
              <a href="mailto:hello@voluntrack.app" className="text-brand-700 dark:text-brand-300 hover:underline font-medium">
                hello@voluntrack.app
              </a>
              <p className="text-sm text-earth-500 dark:text-earth-400 mt-1">For general questions and support.</p>
            </Card>

            <Card>
              <h3 className="font-display font-semibold flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-brand-600" /> Office hours
              </h3>
              <div className="text-sm text-earth-700 dark:text-earth-200">
                Monday – Friday<br />9:00 AM – 5:00 PM (ET)
              </div>
              <p className="text-sm text-earth-500 dark:text-earth-400 mt-1">Replies may take up to 48 hours.</p>
            </Card>

            <Card>
              <h3 className="font-display font-semibold mb-3">Follow along</h3>
              <div className="flex gap-3">
                <a className="p-2 rounded-lg bg-earth-100 hover:bg-earth-200 dark:bg-[#1b2a22] dark:hover:bg-[#243529]" href="#" aria-label="GitHub"><Github className="w-4 h-4" /></a>
                <a className="p-2 rounded-lg bg-earth-100 hover:bg-earth-200 dark:bg-[#1b2a22] dark:hover:bg-[#243529]" href="#" aria-label="Twitter"><Twitter className="w-4 h-4" /></a>
                <a className="p-2 rounded-lg bg-earth-100 hover:bg-earth-200 dark:bg-[#1b2a22] dark:hover:bg-[#243529]" href="#" aria-label="Instagram"><Instagram className="w-4 h-4" /></a>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Toast open={done} onClose={() => setDone(false)} variant="success">
        Message sent! We'll be in touch.
      </Toast>
    </div>
  )
}
