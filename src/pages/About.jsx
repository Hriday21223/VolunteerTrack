import { Link } from 'react-router-dom'
import { ArrowRight, Target, Trophy, FileText, Calendar, Sparkles, ShieldCheck, Users } from 'lucide-react'
import Card from '@/components/Card.jsx'

const FEATURES = [
  { icon: Calendar,  title: 'Simple hour logging', body: 'Log activity, time, location, and proof so your volunteer work is always ready to share.' },
  { icon: Target,    title: 'Goal progress', body: 'Set a target and watch the progress ring fill as your hours add up.' },
  { icon: Trophy,    title: 'Achievements', body: 'Earn badges for consistency, milestones, and service across categories.' },
  { icon: FileText,  title: 'Reports & certificates', body: 'Export polished PDFs, CSVs, and printable certifications in seconds.' },
]

const PHASES = [
  {
    title: 'Phase 1 (NOW)',
    items: [
      { label: 'finish VolunTrack', done: true },
      { label: 'deploy', done: true },
      { label: 'get users', done: true },
    ],
  },
  {
    title: 'Phase 2',
    items: [
      { label: 'add certificates', done: true },
      { label: 'add premium features', done: true },
    ],
  },
  {
    title: 'Phase 3',
    items: [
      { label: 'schools/organizations pay', done: true },
    ],
  },
]

export default function About() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.22),transparent_28%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.18),transparent_20%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.2),transparent_22%),linear-gradient(180deg,#071017_0%,#0a1d25_40%,#0f1f15_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.08),transparent_14%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.18),transparent_18%),radial-gradient(circle_at_50%_80%,rgba(168,85,247,0.14),transparent_16%)]" />
      <div className="relative px-4 md:px-8 py-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/login" className="flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="VolunTrack" className="w-11 h-11 object-contain" />
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-earth-500 dark:text-earth-400">VolunTrack</p>
            <p className="font-display font-bold text-lg text-earth-900 dark:text-earth-100">Volunteer hour tracking</p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost">Sign in</Link>
          <Link to="/register" className="btn-primary">Get started</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 pb-20">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-earth-950 dark:text-white">A better way to track volunteer hours, goals, and certificates.</h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-earth-700 dark:text-earth-300">
                VolunTrack gives students and organizers a clean, private way to log service work, measure progress, and export proof-ready records for school, scholarship, or club requirements.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="btn-primary inline-flex items-center gap-2 justify-center">Create your free account <ArrowRight className="w-4 h-4" /></Link>
              <Link to="/about" className="btn-secondary inline-flex justify-center">Learn more</Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 shadow-soft backdrop-blur">
            <div className="text-sm font-semibold uppercase tracking-[0.35em] text-brand-100">Roadmap</div>
            <h2 className="mt-4 text-2xl font-bold text-white">Where VolunTrack is headed</h2>
            <p className="mt-3 text-sm text-slate-300 leading-6">
              The product roadmap is already in motion — from core launch to certificates, premium tools, and paying school partners.
            </p>

            <div className="mt-6 space-y-4">
              {PHASES.map((phase) => (
                <div key={phase.title} className="rounded-3xl border border-earth-100 bg-earth-50 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-earth-900 dark:text-white">{phase.title}</div>
                      <div className="text-xs text-earth-500 dark:text-earth-400">Current focus for the product.</div>
                    </div>
                    <div className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">Live</div>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-earth-700 dark:text-earth-200">
                    {phase.items.map((item) => (
                      <li key={item.label} className="flex items-start gap-3">
                        <span className="mt-1 text-brand-600 dark:text-brand-300">{item.done ? '✔' : '○'}</span>
                        <span className={item.done ? 'text-earth-900 dark:text-earth-100' : 'text-earth-500 dark:text-earth-400'}>{item.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-brand-600">Core benefits</p>
              <h2 className="mt-3 text-3xl font-bold text-earth-950 dark:text-white">Everything you need to manage service hours and showcase impact.</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"><ShieldCheck className="w-4 h-4" /> Private by default</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-earth-100 px-4 py-2 text-sm font-semibold text-earth-700 dark:bg-white/5 dark:text-earth-300"><Users className="w-4 h-4" /> Built for students</span>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <Card key={title} className="border border-white/10 bg-slate-900/70 text-white">
                <div className="w-11 h-11 rounded-3xl bg-brand-100 grid place-items-center text-brand-700 mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-semibold mb-2 text-white">{title}</div>
                <div className="text-sm leading-6 text-slate-300">{body}</div>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="p-8">
            <h3 className="text-2xl font-semibold text-earth-950 dark:text-white">Built for fast volunteering workflows</h3>
            <p className="mt-4 text-earth-700 dark:text-earth-300 leading-7">
              From your first log to your first service certificate, VolunTrack keeps the experience smooth and distraction-free. It helps learners, clubs, and service coordinators keep reliable records without complicated setup.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-earth-700 dark:text-earth-300">
              <li>✔ Save each session with location, category, and supervisor details</li>
              <li>✔ Watch your month and goal progress in one dashboard</li>
              <li>✔ Export proofs instantly for school or community review</li>
            </ul>
          </Card>
          <Card className="p-8 bg-gradient-to-br from-brand-600 to-brand-700 text-white">
            <div className="space-y-4">
              <div className="text-sm uppercase tracking-[0.35em] text-brand-200">Your path to launch</div>
              <div className="text-3xl font-bold">Phase-driven product growth</div>
              <p className="leading-7 text-brand-100">
                The first version is live and focused on deployment. Next, we deliver certificates and premium upgrades. Then, we partner with schools and clubs to make VolunTrack a paid service.
              </p>
              <Link to="/register" className="btn-secondary inline-flex items-center gap-2 bg-white text-brand-700 hover:bg-white/90">Join now</Link>
            </div>
          </Card>
        </section>
      </main>
    </div>
  </div>
  )
}
