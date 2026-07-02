import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles, School, ShieldCheck, TrendingUp, Award, Phone, Server, Lock, BarChart3, Smartphone, Globe, DollarSign, Download, MessageSquareText, CheckCircle2, XCircle, Loader2, Wrench, AlertTriangle } from 'lucide-react'
import AppLayout from '@/components/AppLayout.jsx'
import Card from '@/components/Card.jsx'

const slides = [
  {
    icon: Sparkles,
    title: 'VolunTrack',
    subtitle: 'Modern Volunteer Hour Tracking for Schools',
    content: () => (
      <div className="space-y-6 text-center max-w-2xl mx-auto">
        <p className="text-lg text-earth-300">
          A privacy-first, open-source Progressive Web App that lets students log service hours,
          set goals, earn badges, and generate verified reports — all without an account server.
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-2xl bg-brand-900/20 border border-brand-800/30 p-4">
            <div className="text-2xl font-bold text-brand-400">4</div>
            <div className="text-earth-400 mt-1">User Roles</div>
          </div>
          <div className="rounded-2xl bg-brand-900/20 border border-brand-800/30 p-4">
            <div className="text-2xl font-bold text-brand-400">12</div>
            <div className="text-earth-400 mt-1">Achievement Badges</div>
          </div>
          <div className="rounded-2xl bg-brand-900/20 border border-brand-800/30 p-4">
            <div className="text-2xl font-bold text-brand-400">100%</div>
            <div className="text-earth-400 mt-1">Client-Side Privacy</div>
          </div>
          <div className="rounded-2xl bg-brand-900/20 border border-brand-800/30 p-4">
            <div className="text-2xl font-bold text-brand-400">PWA</div>
            <div className="text-earth-400 mt-1">Offline-Ready</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: TrendingUp,
    title: 'The Problem',
    subtitle: 'Paper & Spreadsheets Don\'t Scale',
    content: () => (
      <div className="space-y-5 max-w-2xl mx-auto">
        <div className="flex items-start gap-4 rounded-2xl border border-red-800/30 bg-red-900/10 p-5">
          <div className="w-10 h-10 rounded-full bg-red-900/30 grid place-items-center shrink-0 text-red-400">
            <span className="text-lg font-bold">1</span>
          </div>
          <div>
            <p className="font-medium text-white">No Verification</p>
            <p className="text-sm text-earth-400 mt-1">Paper logs are easy to forge. Schools have no way to verify hours without calling supervisors.</p>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-2xl border border-red-800/30 bg-red-900/10 p-5">
          <div className="w-10 h-10 rounded-full bg-red-900/30 grid place-items-center shrink-0 text-red-400">
            <span className="text-lg font-bold">2</span>
          </div>
          <div>
            <p className="font-medium text-white">No Reporting</p>
            <p className="text-sm text-earth-400 mt-1">Counselors spend hours compiling spreadsheets for scholarship, Bright Futures, or club requirements.</p>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-2xl border border-red-800/30 bg-red-900/10 p-5">
          <div className="w-10 h-10 rounded-full bg-red-900/30 grid place-items-center shrink-0 text-red-400">
            <span className="text-lg font-bold">3</span>
          </div>
          <div>
            <p className="font-medium text-white">No Engagement</p>
            <p className="text-sm text-earth-400 mt-1">Without goals, badges, or progress tracking, students lose motivation to volunteer consistently.</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: School,
    title: 'The Solution',
    subtitle: 'VolunTrack — Built for Students, Schools & Admins',
    content: () => (
      <div className="grid gap-5 max-w-3xl mx-auto">
        <div className="rounded-2xl border border-brand-800/30 bg-gradient-to-br from-brand-900/20 to-transparent p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-900/40 grid place-items-center text-brand-400">
              <School className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white">For Students</h3>
          </div>
          <p className="text-sm text-earth-400 leading-relaxed">
            Log hours in seconds, set goals, earn badges, view your calendar, and export verified PDF reports. Works offline, private by design.
          </p>
        </div>
        <div className="rounded-2xl border border-brand-800/30 bg-gradient-to-br from-brand-900/20 to-transparent p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-900/40 grid place-items-center text-brand-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white">For Schools</h3>
          </div>
          <p className="text-sm text-earth-400 leading-relaxed">
            Manage student rosters, post volunteer opportunities, approve sign-ups, verify PDF submissions, and track progress — all from one dashboard.
          </p>
        </div>
        <div className="rounded-2xl border border-brand-800/30 bg-gradient-to-br from-brand-900/20 to-transparent p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-900/40 grid place-items-center text-brand-400">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white">For Admins</h3>
          </div>
          <p className="text-sm text-earth-400 leading-relaxed">
            Oversee all registered schools, manage payments, monitor system health with an AI agent, respond to user feedback, and export data.
          </p>
        </div>
      </div>
    ),
  },
  {
    icon: Award,
    title: 'Core Features',
    subtitle: 'Everything Students & Schools Need',
    content: () => (
      <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto text-sm">
        {[
          { label: 'Hour Logging', desc: 'Log hours with date, time, category, supervisor, and notes in seconds' },
          { label: 'Goal Setting', desc: 'Set primary and secondary goals with real-time progress tracking' },
          { label: 'Achievement Badges', desc: '12 unlockable badges that gamify the volunteering experience' },
          { label: 'Calendar View', desc: 'See your logged hours on a monthly calendar heatmap' },
          { label: 'PDF Reports', desc: 'Export verified hour reports for scholarship and school requirements' },
          { label: 'Reminders', desc: 'Weekly and daily push reminders to keep students on track' },
          { label: 'Weekly Charts', desc: 'Visual bar charts showing hour distribution across the week' },
          { label: 'Dark Mode', desc: 'Full dark theme that respects system preferences' },
        ].map((f) => (
          <div key={f.label} className="rounded-xl border border-earth-800/40 bg-earth-900/20 p-4">
            <p className="font-medium text-white">{f.label}</p>
            <p className="text-xs text-earth-400 mt-1">{f.desc}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Phone,
    title: 'School & Organization Hub',
    subtitle: 'Verified Workflows for Educational Institutions',
    content: () => (
      <div className="space-y-5 max-w-2xl mx-auto">
        <div className="flex items-start gap-4 rounded-2xl border border-brand-800/30 bg-brand-900/10 p-5">
          <div className="w-8 h-8 rounded-lg bg-brand-900/40 grid place-items-center shrink-0 text-brand-400 text-sm font-bold">1</div>
          <div>
            <p className="font-medium text-white">School Registration with PIN</p>
            <p className="text-sm text-earth-400 mt-1">Schools get a unique code; students join by entering it — no manual roster uploads needed.</p>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-2xl border border-brand-800/30 bg-brand-900/10 p-5">
          <div className="w-8 h-8 rounded-lg bg-brand-900/40 grid place-items-center shrink-0 text-brand-400 text-sm font-bold">2</div>
          <div>
            <p className="font-medium text-white">Volunteer Task Board</p>
            <p className="text-sm text-earth-400 mt-1">Schools post opportunities with location, time, slots. Students sign up with one click.</p>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-2xl border border-brand-800/30 bg-brand-900/10 p-5">
          <div className="w-8 h-8 rounded-lg bg-brand-900/40 grid place-items-center shrink-0 text-brand-400 text-sm font-bold">3</div>
          <div>
            <p className="font-medium text-white">PDF Verification Workflow</p>
            <p className="text-sm text-earth-400 mt-1">Students upload signed PDFs; school admins review and approve/reject them inline.</p>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-2xl border border-brand-800/30 bg-brand-900/10 p-5">
          <div className="w-8 h-8 rounded-lg bg-brand-900/40 grid place-items-center shrink-0 text-brand-400 text-sm font-bold">4</div>
          <div>
            <p className="font-medium text-white">Payment Tracking</p>
            <p className="text-sm text-earth-400 mt-1">Subscription management with due dates, payment status, and admin notifications built in.</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Lock,
    title: 'Security & Privacy First',
    subtitle: 'No Server, No Tracking, No Worries',
    content: () => (
      <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
        <div className="rounded-2xl border border-emerald-800/30 bg-emerald-900/10 p-5">
          <p className="font-medium text-emerald-300">Client-Side Storage</p>
          <p className="text-sm text-earth-400 mt-1">All student data stays in their browser via localStorage. No accounts server required for core features.</p>
        </div>
        <div className="rounded-2xl border border-emerald-800/30 bg-emerald-900/10 p-5">
          <p className="font-medium text-emerald-300">PIN Protection</p>
          <p className="text-sm text-earth-400 mt-1">Optional 4-6 digit PIN locks the app. Recovery flows via email for password and PIN resets.</p>
        </div>
        <div className="rounded-2xl border border-emerald-800/30 bg-emerald-900/10 p-5">
          <p className="font-medium text-emerald-300">Offline First (PWA)</p>
          <p className="text-sm text-earth-400 mt-1">Installs as a PWA on any device. Works offline with cached assets — great for students without reliable internet.</p>
        </div>
        <div className="rounded-2xl border border-emerald-800/30 bg-emerald-900/10 p-5">
          <p className="font-medium text-emerald-300">Account Security</p>
          <p className="text-sm text-earth-400 mt-1">JWT-authenticated API, optional database backend for school accounts, SMTP-based email recovery.</p>
        </div>
      </div>
    ),
  },
  {
    icon: Server,
    title: 'Technical Architecture',
    subtitle: 'Modern Stack, Battle-Tested',
    content: () => (
      <div className="space-y-5 max-w-3xl mx-auto text-sm">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-earth-800/40 p-4">
            <p className="font-semibold text-sky-300 mb-2">Frontend</p>
            <ul className="space-y-1 text-earth-400">
              <li>• React 18 + Vite</li>
              <li>• Tailwind CSS v3</li>
              <li>• React Router v6</li>
              <li>• date-fns, lucide-react</li>
              <li>• GitHub Pages (CD)</li>
            </ul>
          </div>
          <div className="rounded-xl border border-earth-800/40 p-4">
            <p className="font-semibold text-emerald-300 mb-2">Backend</p>
            <ul className="space-y-1 text-earth-400">
              <li>• Express.js</li>
              <li>• SQLite (dev) / Postgres (prod)</li>
              <li>• JWT auth, bcrypt passwords</li>
              <li>• Nodemailer (SMTP)</li>
              <li>• Render + Neon (deploy)</li>
            </ul>
          </div>
        </div>
        <div className="rounded-xl border border-earth-800/40 p-4">
          <p className="font-semibold text-brand-300 mb-2">DevOps & Quality</p>
          <div className="grid sm:grid-cols-3 gap-3 text-earth-400">
            <span>• Vite PWA plugin</span>
            <span>• GitHub Actions CI</span>
            <span>• Auto-deploy Pages</span>
            <span>• ESLint + Prettier</span>
            <span>• Service Worker</span>
            <span>• AI Agent monitoring</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: BarChart3,
    title: 'AI-Powered Monitoring',
    subtitle: 'Automatic Incident Detection & Fixing',
    content: () => {
      const s = window.__agentData ? window.__agentData() : { incidents: [], agentLog: [], incByStatus: { detected: 0, investigating: 0, fixing: 0, resolved: 0, failed: 0 }, totalInc: 0, resolvedInc: 0, failedInc: 0, fixRate: 0, lastActions: [] }
      return (
        <div className="space-y-5 max-w-2xl mx-auto">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-earth-800/40 bg-earth-900/20 p-3">
              <div className="text-2xl font-bold text-white">{s.totalInc}</div>
              <div className="text-xs text-earth-400 mt-1">Total Incidents</div>
            </div>
            <div className="rounded-xl border border-earth-800/40 bg-earth-900/20 p-3">
              <div className="text-2xl font-bold text-emerald-400">{s.resolvedInc}</div>
              <div className="text-xs text-earth-400 mt-1">Resolved</div>
            </div>
            <div className="rounded-xl border border-earth-800/40 bg-earth-900/20 p-3">
              <div className="text-2xl font-bold text-brand-400">{s.fixRate}%</div>
              <div className="text-xs text-earth-400 mt-1">Fix Rate</div>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-medium text-earth-500 uppercase tracking-wider">Status Breakdown</p>
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              {[
                { label: 'Detected', count: s.incByStatus.detected, color: 'text-red-400', bg: 'bg-red-900/20' },
                { label: 'Investigating', count: s.incByStatus.investigating, color: 'text-amber-400', bg: 'bg-amber-900/20' },
                { label: 'Fixing', count: s.incByStatus.fixing, color: 'text-blue-400', bg: 'bg-blue-900/20' },
                { label: 'Resolved', count: s.incByStatus.resolved, color: 'text-emerald-400', bg: 'bg-emerald-900/20' },
                { label: 'Failed', count: s.incByStatus.failed, color: 'text-red-500', bg: 'bg-red-900/30' },
              ].map((st) => (
                <div key={st.label} className={`rounded-lg ${st.bg} p-2 ${st.color}`}>
                  <div className="font-bold text-base">{st.count}</div>
                  <div className="text-[10px] opacity-80">{st.label}</div>
                </div>
              ))}
            </div>
          </div>
          {s.lastActions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-earth-500 uppercase tracking-wider mb-2">Recent Agent Actions</p>
              <div className="space-y-1.5">
                {s.lastActions.map((a) => {
                  const typeColors = { info: 'text-blue-400', fixing: 'text-amber-400', success: 'text-emerald-400', error: 'text-red-400' }
                  const icons = { info: <Loader2 className="w-3 h-3" />, fixing: <Wrench className="w-3 h-3" />, success: <CheckCircle2 className="w-3 h-3" />, error: <XCircle className="w-3 h-3" /> }
                  return (
                    <div key={a.id} className="flex items-center gap-2 text-xs">
                      <span className={typeColors[a.type] || 'text-earth-400'}>{icons[a.type] || icons.info}</span>
                      <span className="text-earth-300 truncate">{a.message}</span>
                      <span className="text-earth-600 shrink-0">{new Date(a.timestamp).toLocaleString()}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )
    },
  },
  {
    icon: DollarSign,
    title: 'Monetization Model',
    subtitle: 'Sustainable Revenue for School Partnerships',
    content: () => (
      <div className="space-y-6 max-w-2xl mx-auto">
        <p className="text-sm text-earth-400 text-center">
          VolunTrack is free for individual students. Schools and organizations subscribe for admin features.
        </p>
        <div className="grid gap-4">
          <div className="rounded-2xl border border-earth-800/40 bg-earth-900/20 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-white">Free Tier</p>
              <span className="text-xs bg-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded-full">Always free</span>
            </div>
            <p className="text-sm text-earth-400">All core features: hour logging, goals, badges, calendar, reports, PWA support.</p>
          </div>
          <div className="rounded-2xl border border-brand-800/30 bg-gradient-to-br from-brand-900/20 to-transparent p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-white">School Subscription</p>
              <span className="text-xs bg-amber-900/30 text-amber-400 px-2 py-0.5 rounded-full">Paid plan</span>
            </div>
            <p className="text-sm text-earth-400">
              Student rosters, task board, PDF verification workflow, payment tracking,
              dedicated support, and admin dashboard. Payable per school or district.
            </p>
          </div>
        </div>
        <div className="rounded-xl bg-earth-900/30 border border-earth-800/40 p-4 text-sm text-earth-400 text-center">
          Payment status tracking, due dates, and admin notification system already built and operational.
        </div>
      </div>
    ),
  },
  {
    icon: Smartphone,
    title: 'Roadmap',
    subtitle: 'What\'s Coming Next',
    content: () => (
      <div className="max-w-2xl mx-auto w-full">
        <div className="space-y-0">
          {[
            { phase: 'Phase 1', label: 'Core App', status: 'done', items: 'Logging, goals, badges, reminders, reports, dark mode, PWA' },
            { phase: 'Phase 2', label: 'Authentication & Recovery', status: 'done', items: 'Email-based password/PIN reset, printable certificates, SMTP integration' },
            { phase: 'Phase 3', label: 'School Partnerships', status: 'done', items: 'School registration, task board, PDF verification, payment tracking, admin panel' },
            { phase: 'Phase 4', label: 'Native Mobile App', status: 'next', items: 'iOS and Android apps via React Native or Capacitor' },
            { phase: 'Phase 5', label: 'District Analytics', status: 'next', items: 'Consolidated dashboards for district admins, cross-school reporting' },
            { phase: 'Phase 6', label: 'API & Integrations', status: 'next', items: 'Public REST API for third-party integrations, Zapier/IFTTT connectors' },
          ].map((p) => (
            <div key={p.phase} className="flex items-center gap-4 py-3 border-b border-earth-800/40 last:border-0">
              <span className={`w-20 text-xs font-semibold uppercase tracking-wider shrink-0 ${
                p.status === 'done' ? 'text-emerald-400' : 'text-brand-400'
              }`}>{p.phase}</span>
              <span className={`w-16 text-center text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                p.status === 'done'
                  ? 'bg-emerald-900/30 text-emerald-400'
                  : 'bg-brand-900/30 text-brand-400'
              }`}>{p.status === 'done' ? '✓ Shipped' : 'Planned'}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">{p.label}</p>
                <p className="text-xs text-earth-500">{p.items}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: Globe,
    title: 'Get Started',
    subtitle: 'Try VolunTrack Today',
    content: () => (
      <div className="space-y-6 text-center max-w-xl mx-auto">
        <p className="text-earth-300">
          VolunTrack is live and ready to use. No sign-up required for the core app — just open it and start logging.
        </p>
        <div className="grid gap-4">
          <a href="https://hriday21223.github.io/VolunteerTrack" target="_blank" rel="noopener noreferrer"
             className="btn-primary inline-flex items-center justify-center gap-2 text-base py-3">
            <Globe className="w-5 h-5" /> Try the Live App
          </a>
          <a href="https://github.com/Hriday21223/VolunteerTrack" target="_blank" rel="noopener noreferrer"
             className="btn-secondary inline-flex items-center justify-center gap-2 text-base py-3">
            View on GitHub
          </a>
        </div>
        <div className="rounded-2xl border border-earth-800/40 bg-earth-900/20 p-5 text-sm text-earth-400">
          <p className="font-medium text-white mb-1">Contact</p>
          <p>Email: karnatamhriday@gmail.com</p>
          <p>GitHub: Hriday21223</p>
        </div>
      </div>
    ),
  },
]

const speakerNotes = [
  "Welcome to VolunTrack. This is a privacy-first, open-source PWA that lets students log volunteer hours, set goals, earn achievement badges, and generate verified PDF reports — all without needing an account or server. The app works offline, installs on any device, and is completely free for individual students.",
  "Schools today rely on paper logs or spreadsheets to track volunteer hours. Paper is easy to forge, spreadsheets don't scale, and counselors spend hours compiling reports for scholarships like Bright Futures. Students lose motivation without goals or progress tracking. VolunTrack solves all three problems in one platform.",
  "VolunTrack serves three audiences. For students: a fast, private way to log hours and track progress. For schools: student rosters, a volunteer task board, and PDF verification workflows. For admins: a full dashboard with school management, payment tracking, and AI-powered system monitoring. Each role gets exactly what they need.",
  "Core features include hour logging with supervisor details, goal setting with real-time progress rings, 12 achievement badges that gamify volunteering, a calendar heatmap view, PDF report exports, weekly charts, push reminders, and full dark mode. Everything is designed to be fast and intuitive.",
  "The school hub is where VolunTrack becomes a platform. Schools register with a unique PIN code. Students join by entering the code — no CSV uploads needed. Schools can post volunteer opportunities with location, time, and slot limits. Students sign up with one click, and organizers approve or reject signups. PDF verification forms can be uploaded, reviewed, and approved inline. Payment tracking with due dates and notifications is built in.",
  "Privacy is the foundation. Core data stays in the browser's localStorage — no server communication required. Optional accounts use JWT tokens with bcrypt passwords and SHA-256 PIN hashing. The app is a fully offline-capable PWA. Email recovery flows via SMTP for both password and PIN resets. No tracking, no telemetry, no data harvesting.",
  "The frontend is React 18 with Vite and Tailwind CSS. The backend is Express.js with SQLite for development and PostgreSQL via Neon for production. Authentication uses JWT with bcrypt. Emails go through Nodemailer over SMTP. The PWA is powered by vite-plugin-pwa. Frontend deploys to GitHub Pages via GitHub Actions; backend runs on Render.",
  "VolunTrack includes a unique AI agent that monitors system health. It detects service failures, logs incidents with timestamps, and attempts automatic fixes. The admin reviews each incident and approves or rejects the fix. Every action is recorded in an audit log. This slide shows live data from the actual monitoring system running right now.",
  "VolunTrack is free for individual students. Schools subscribe for administrative features: rosters, task board, PDF verification, payment tracking, and support. The payment infrastructure is already fully built — admins can mark schools paid or unpaid, set global due dates, send bulk notifications, and export CSV reports for accounting.",
  "Phases 1 through 3 are complete: core app, authentication and recovery, and school partnerships. Phase 4 will bring native iOS and Android apps. Phase 5 adds district-level analytics and cross-school reporting. Phase 6 opens a public API for third-party integrations and automation tools like Zapier.",
  "VolunTrack is live right now at the URL on screen. No sign-up required — just open it and start logging. The full source code is on GitHub under an MIT license. Schools can self-host, customize, and extend without vendor lock-in. I'm open to partnerships, feedback, and contributions.",
]

export default function AdminShowcase() {
  const [slide, setSlide] = useState(0)
  const [showNotes, setShowNotes] = useState(false)
  const [incidents, setIncidents] = useState([])
  const [agentLog, setAgentLog] = useState([])
  const total = slides.length

  const refreshAgent = useCallback(() => {
    try { setIncidents(JSON.parse(localStorage.getItem('voluntrack:incidents') || '[]')) } catch { setIncidents([]) }
    try { setAgentLog(JSON.parse(localStorage.getItem('voluntrack:agent_log') || '[]')) } catch { setAgentLog([]) }
  }, [])

  const incByStatus = { detected: 0, investigating: 0, fixing: 0, resolved: 0, failed: 0 }
  incidents.forEach((i) => { incByStatus[i.status] = (incByStatus[i.status] || 0) + 1 })
  const totalInc = incidents.length
  const resolvedInc = incByStatus.resolved
  const failedInc = incByStatus.failed
  const fixRate = totalInc > 0 ? Math.round((resolvedInc / (resolvedInc + failedInc || 1)) * 100) : 0
  const lastActions = agentLog.slice(-5).reverse()

  useEffect(() => { refreshAgent(); const id = setInterval(refreshAgent, 30000); return () => clearInterval(id) }, [refreshAgent])
  useEffect(() => {
    window.__agentData = () => ({ incidents, agentLog, incByStatus, totalInc, resolvedInc, failedInc, fixRate, lastActions })
  }, [incidents, agentLog, incByStatus, totalInc, resolvedInc, failedInc, fixRate, lastActions])

  const printSection = (selector) => {
    const el = document.querySelector(selector)
    if (!el) return
    const w = window.open('', '_blank', 'width=1024,height=768')
    const styles = Array.from(document.styleSheets).map((s) => {
      try { return Array.from(s.cssRules || []).map((r) => r.cssText).join('') } catch { return '' }
    }).join('')
    w.document.write(`<!DOCTYPE html><html><head><title>VolunTrack Showcase</title><style>${styles}body{background:#0a1620;color:#e2e8f0;padding:2rem;font-family:system-ui,sans-serif}@media print{@page{margin:1.5cm}.no-print{display:none!important}.print-only{display:block!important}}</style></head><body>${el.innerHTML}</body></html>`)
    w.document.close()
    w.focus()
    setTimeout(() => { w.print(); w.close() }, 500)
  }

  return (
    <AppLayout
      title="VolunTrack Showcase"
      subtitle="Pitch deck & technical overview"
      action={
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowNotes(!showNotes)} className={`btn-sm ${showNotes ? 'btn-primary' : 'btn-ghost'}`}>
            <MessageSquareText className="w-3.5 h-3.5 mr-1" /> Notes
          </button>
          <button onClick={() => printSection('#showcase-slides')} className="btn-sm btn-ghost">
            <Download className="w-3.5 h-3.5 mr-1" /> Slides (PDF)
          </button>
          <button onClick={() => printSection('#showcase-document')} className="btn-sm btn-ghost">
            <Download className="w-3.5 h-3.5 mr-1" /> Overview (PDF)
          </button>
          <Link to="/admin" className="btn-ghost text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Link>
        </div>
      }
    >
      {/* Slide navigation */}
      <div className="flex items-center justify-center gap-1 mb-6">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === slide ? 'bg-brand-400 w-6' : 'bg-earth-700 hover:bg-earth-600'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Slide container */}
      <div id="showcase-slides" className="relative overflow-hidden rounded-[2rem] border border-earth-800/50 bg-[#0a1620] shadow-2xl">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${slide * 100}%)` }}
        >
          {slides.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="min-w-0 w-full shrink-0 p-8 md:p-12">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-sky-500 grid place-items-center mb-4 shadow-lg">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">{s.title}</h2>
                  <p className="text-sm text-brand-300 mt-1 uppercase tracking-widest">{s.subtitle}</p>
                </div>
                <s.content />
                {showNotes && speakerNotes[i] && (
                  <div className="mt-6 rounded-xl border border-earth-700/50 bg-earth-900/40 p-4 text-xs text-earth-400 italic leading-relaxed">
                    <p className="font-medium text-earth-300 not-italic mb-1 text-[10px] uppercase tracking-wider">Speaker Notes</p>
                    {speakerNotes[i]}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Arrow nav */}
      <div className="flex items-center justify-between mt-6 max-w-md mx-auto">
        <button
          onClick={() => setSlide(Math.max(0, slide - 1))}
          disabled={slide === 0}
          className="btn-ghost disabled:opacity-30"
        >
          <ChevronLeft className="w-5 h-5" /> Previous
        </button>
        <span className="text-xs text-earth-500 font-mono">{slide + 1} / {total}</span>
        <button
          onClick={() => setSlide(Math.min(total - 1, slide + 1))}
          disabled={slide === total - 1}
          className="btn-ghost disabled:opacity-30"
        >
          Next <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Full Document Section */}
      <div id="showcase-document" className="mt-16">
        <h2 className="text-2xl font-bold text-white text-center mb-2">Full Overview</h2>
        <p className="text-sm text-earth-400 text-center mb-8">Technical deep-dive and business overview</p>

        <div className="max-w-4xl mx-auto space-y-8 text-sm text-earth-300 leading-relaxed">
          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Executive Summary</h3>
            <p className="mb-3">
              VolunTrack is a modern, open-source Progressive Web App (PWA) designed to simplify volunteer hour tracking
              for students, schools, and district administrators. Unlike paper logs or generic spreadsheet solutions,
              VolunTrack provides a privacy-first, offline-capable platform that makes logging hours as fast as sending a text message.
            </p>
            <p>
              The app is built with a "privacy by default" philosophy — core features require no account or server,
              storing all data locally in the browser. For schools that need verification workflows, rosters, and reporting,
              VolunTrack offers an optional server-backed tier with authentication, school management, and payment tracking.
            </p>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Target Users & Roles</h3>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-brand-300 mb-1">Students / Volunteers</p>
                <p>Log hours, set goals, earn achievement badges, view calendars, export PDF reports. The core experience is free and serverless.</p>
              </div>
              <div>
                <p className="font-medium text-brand-300 mb-1">School Administrators</p>
                <p>Manage student rosters via PIN-based registration, post volunteer opportunities, approve sign-ups (My Tasks), and review submitted PDF verification documents (School Dashboard).</p>
              </div>
              <div>
                <p className="font-medium text-brand-300 mb-1">System Administrators</p>
                <p>Full admin panel with contact inbox, school payment management, incident monitoring with AI auto-fix agent, and system-wide notifications.</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Feature Deep-Dive</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="font-semibold text-white mb-2">Hour Logging</p>
                <p className="text-xs">Log entries include activity name, date, start/end time, hours, category, location, supervisor contact, and notes. Verification status tracking. Recent activity shown on dashboard.</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-2">Goals & Progress</p>
                <p className="text-xs">Set primary and secondary goals with target hours. Dashboard shows progress rings, weekly charts, and remaining hours. Goal-based achievement evaluation.</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-2">Achievement Badges</p>
                <p className="text-xs">12 milestones across categories like First Log, 10 Hours, 50 Hours, Century Club, categories mastered, and streaks. Badges auto-award when criteria met.</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-2">Calendar View</p>
                <p className="text-xs">Monthly calendar with logged hours displayed on each day. Color-coded by hours logged. Quick navigation between months.</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-2">PDF Reports</p>
                <p className="text-xs">Generate printable PDF summaries of logged hours filtered by date range. Includes totals, category breakdowns, and signature line. School verification workflow.</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-2">Reminder System</p>
                <p className="text-xs">Browser-based reminder notifications for weekly logging prompts and Sunday prep. Uses localStorage-based scheduler with fire-on-reload detection.</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-white mb-4">School Partnership Features</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="font-semibold text-white mb-2">Registration & Rosters</p>
                <p className="text-xs">Schools register with a unique PIN. Students join by entering the school PIN — no manual roster management or CSV uploads required.</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-2">Volunteer Task Board</p>
                <p className="text-xs">Schools create public tasks with title, description, location, date/time, and slot count. Students can view, filter by distance, and sign up. Approve/reject workflow built in.</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-2">PDF Verification</p>
                <p className="text-xs">Students upload signed PDF verification forms. School admins review, approve, or reject submissions from the School Dashboard. Status tracking per document.</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-2">Payment Management</p>
                <p className="text-xs">Admin panel tracks payment status per school (paid/unpaid), payment due dates, notes, and notification system. CSV export for accounting.</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Security Architecture</h3>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-white">Client-Side Storage</p>
                <p className="text-xs">All student data (logs, goals, preferences) is stored in browser localStorage. No data is sent to any server unless the user explicitly registers for a school account. This ensures complete privacy for the core experience.</p>
              </div>
              <div>
                <p className="font-semibold text-white">Authentication</p>
                <p className="text-xs">Server-backed accounts use JWT tokens with bcrypt-hashed passwords. PIN codes (4-6 digits) are hashed with SHA-256 before storage. Recovery flows via SMTP email for both password and PIN resets.</p>
              </div>
              <div>
                <p className="font-semibold text-white">Progressive Web App</p>
                <p className="text-xs">Service worker caches all app assets. The app works fully offline after the first visit. Installable on any device (desktop, tablet, phone) via the browser's "Add to Home Screen" prompt.</p>
              </div>
              <div>
                <p className="font-semibold text-white">AI Agent Monitoring</p>
                <p className="text-xs">A client-side AI agent monitors service health, detects incidents, and attempts automatic fixes. All actions are logged with timestamps for audit. Admin must approve fixes before execution.</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Technical Stack</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-earth-800">
                    <th className="text-left py-2 pr-4 text-earth-400 font-medium">Layer</th>
                    <th className="text-left py-2 pr-4 text-earth-400 font-medium">Technology</th>
                    <th className="text-left py-2 text-earth-400 font-medium">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-800/50">
                  <tr><td className="py-2 pr-4 text-white">Frontend</td><td className="py-2 pr-4">React 18 + Vite</td><td className="py-2 text-earth-400">UI framework and build tool</td></tr>
                  <tr><td className="py-2 pr-4 text-white">Styling</td><td className="py-2 pr-4">Tailwind CSS v3</td><td className="py-2 text-earth-400">Utility-first styling with dark mode</td></tr>
                  <tr><td className="py-2 pr-4 text-white">Routing</td><td className="py-2 pr-4">React Router v6</td><td className="py-2 text-earth-400">Client-side routing with guards</td></tr>
                  <tr><td className="py-2 pr-4 text-white">Backend</td><td className="py-2 pr-4">Express.js</td><td className="py-2 text-earth-400">REST API server</td></tr>
                  <tr><td className="py-2 pr-4 text-white">Database</td><td className="py-2 pr-4">SQLite / PostgreSQL</td><td className="py-2 text-earth-400">Local dev / production (Neon)</td></tr>
                  <tr><td className="py-2 pr-4 text-white">Auth</td><td className="py-2 pr-4">JWT + bcrypt</td><td className="py-2 text-earth-400">Token-based authentication</td></tr>
                  <tr><td className="py-2 pr-4 text-white">Email</td><td className="py-2 pr-4">Nodemailer (SMTP)</td><td className="py-2 text-earth-400">Password and PIN recovery</td></tr>
                  <tr><td className="py-2 pr-4 text-white">PWA</td><td className="py-2 pr-4">vite-plugin-pwa</td><td className="py-2 text-earth-400">Service worker + offline support</td></tr>
                  <tr><td className="py-2 pr-4 text-white">Hosting</td><td className="py-2 pr-4">GitHub Pages / Render</td><td className="py-2 text-earth-400">Frontend / Backend deployment</td></tr>
                  <tr><td className="py-2 pr-4 text-white">CI/CD</td><td className="py-2 pr-4">GitHub Actions</td><td className="py-2 text-earth-400">Auto-deploy to Pages on push</td></tr>
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Business Model</h3>
            <p className="mb-3">
              VolunTrack uses a freemium model. Individual students can use the full core experience (logging, goals,
              badges, reports, calendar, reminders) completely free — no account, no server, no data collection.
            </p>
            <p className="mb-3">
              Schools and organizations subscribe for administrative features:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs mb-3">
              <li>Student roster management with PIN-based registration</li>
              <li>Volunteer opportunity board with sign-up workflows</li>
              <li>PDF verification and approval system</li>
              <li>Payment tracking with due dates and notifications</li>
              <li>Dedicated support and onboarding</li>
            </ul>
            <p className="text-xs text-earth-400">
              The payment infrastructure is already built — the admin panel supports marking schools as paid/unpaid,
              setting global payment due dates, sending bulk notifications, and exporting CSV reports.
            </p>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Competitive Advantages</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-900/30 grid place-items-center shrink-0 mt-0.5">
                  <span className="text-emerald-400 text-xs">✓</span>
                </div>
                <div>
                  <p className="font-medium text-white text-sm">Privacy-First Architecture</p>
                  <p className="text-xs text-earth-400">Unlike competitors that require accounts and harvest data, VolunTrack's core features work entirely in the browser with zero server communication.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-900/30 grid place-items-center shrink-0 mt-0.5">
                  <span className="text-emerald-400 text-xs">✓</span>
                </div>
                <div>
                  <p className="font-medium text-white text-sm">Offline-First PWA</p>
                  <p className="text-xs text-earth-400">Works on any device, anywhere — no internet connection required after initial load. Usable in classrooms, shelters, and outdoor volunteer sites.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-900/30 grid place-items-center shrink-0 mt-0.5">
                  <span className="text-emerald-400 text-xs">✓</span>
                </div>
                <div>
                  <p className="font-medium text-white text-sm">Open Source & Extensible</p>
                  <p className="text-xs text-earth-400">Fully open-source under MIT license. Schools can self-host, customize, and integrate without vendor lock-in.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-900/30 grid place-items-center shrink-0 mt-0.5">
                  <span className="text-emerald-400 text-xs">✓</span>
                </div>
                <div>
                  <p className="font-medium text-white text-sm">Built-In School Workflows</p>
                  <p className="text-xs text-earth-400">Verification, task boards, payment tracking, and notifications are all first-class features — not afterthoughts.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-900/30 grid place-items-center shrink-0 mt-0.5">
                  <span className="text-emerald-400 text-xs">✓</span>
                </div>
                <div>
                  <p className="font-medium text-white text-sm">AI System Monitoring</p>
                  <p className="text-xs text-earth-400">Unique AI agent detects and auto-fixes system issues, reducing admin overhead and ensuring reliability.</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Live Agent Activity</h3>
            <p className="text-xs text-earth-400 mb-4">Real-time data from the AI monitoring system. Refreshes every 30 seconds.</p>
            <div className="grid grid-cols-3 gap-3 mb-4 text-center">
              <div className="rounded-xl border border-earth-800/40 bg-earth-900/20 p-3">
                <div className="text-lg font-bold text-white">{totalInc}</div>
                <div className="text-xs text-earth-400">Incidents</div>
              </div>
              <div className="rounded-xl border border-earth-800/40 bg-earth-900/20 p-3">
                <div className="text-lg font-bold text-emerald-400">{resolvedInc}</div>
                <div className="text-xs text-earth-400">Resolved</div>
              </div>
              <div className="rounded-xl border border-earth-800/40 bg-earth-900/20 p-3">
                <div className="text-lg font-bold text-brand-400">{fixRate}%</div>
                <div className="text-xs text-earth-400">Fix Rate</div>
              </div>
            </div>
            {agentLog.length === 0 ? (
              <p className="text-xs text-earth-500 text-center py-4">No recent agent activity.</p>
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {agentLog.slice(-10).reverse().map((a) => {
                  const typeColors = { info: 'text-blue-400', fixing: 'text-amber-400', success: 'text-emerald-400', error: 'text-red-400' }
                  const icons = { info: <Loader2 className="w-3 h-3" />, fixing: <Wrench className="w-3 h-3" />, success: <CheckCircle2 className="w-3 h-3" />, error: <AlertTriangle className="w-3 h-3" /> }
                  return (
                    <div key={a.id} className="flex items-center gap-2 text-xs py-1">
                      <span className={typeColors[a.type] || 'text-earth-400'}>{icons[a.type] || icons.info}</span>
                      <span className="text-earth-300 truncate flex-1">{a.message}</span>
                      <span className="text-earth-600 shrink-0">{new Date(a.timestamp).toLocaleString()}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Deployment & DevOps</h3>
            <p className="mb-3">
              The frontend is deployed to GitHub Pages via GitHub Actions on every push to main.
              The backend runs on Render (free tier) with a managed Neon PostgreSQL database.
              Environment configuration uses .env files locally and Render dashboard env vars in production.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-earth-800/40 bg-earth-900/20 p-3">
                <p className="font-medium text-white mb-1">CI/CD Pipeline</p>
                <p className="text-earth-400">GitHub Actions → build → deploy to gh-pages branch. Backend deployed via Render blueprint from render.yaml.</p>
              </div>
              <div className="rounded-xl border border-earth-800/40 bg-earth-900/20 p-3">
                <p className="font-medium text-white mb-1">Monitoring</p>
                <p className="text-earth-400">Built-in status page at /status. AI agent monitors services and auto-recovers from failures.</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Roadmap</h3>
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-emerald-400">✅ Phase 1-3: Complete</p>
                <p className="text-xs text-earth-400">Core app features, authentication & recovery, school partnerships — all shipped and operational.</p>
              </div>
              <div>
                <p className="font-semibold text-brand-300">🚀 Phase 4: Native Mobile Apps</p>
                <p className="text-xs text-earth-400">React Native or Capacitor-based iOS and Android apps for push notifications and native device features.</p>
              </div>
              <div>
                <p className="font-semibold text-brand-300">🚀 Phase 5: District Analytics</p>
                <p className="text-xs text-earth-400">Cross-school dashboards, district-level reporting, and consolidated admin views for district administrators.</p>
              </div>
              <div>
                <p className="font-semibold text-brand-300">🚀 Phase 6: Public API & Integrations</p>
                <p className="text-xs text-earth-400">REST API for third-party integrations, Zapier/IFTTT connectors, and custom school system integrations.</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Conclusion</h3>
            <p className="mb-3">
              VolunTrack is a production-ready volunteer hour tracking platform that balances privacy, usability, and
              administrative power. It's free for individual students, scalable for schools, and open for business partnerships.
            </p>
            <p className="text-sm text-brand-400 font-medium">
              Try it live: <a href="https://hriday21223.github.io/VolunteerTrack" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-300">hriday21223.github.io/VolunteerTrack</a>
            </p>
          </Card>

          {/* Print-friendly footer */}
          <div className="text-center text-xs text-earth-600 pb-8">
            VolunTrack · Generated {new Date().toLocaleDateString()} · MIT License
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
