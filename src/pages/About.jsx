import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Target, Trophy, FileText, Calendar, Sparkles, ShieldCheck, Users, Instagram, Clock, ChevronDown, Star, CheckCircle, BarChart3, Building2, Heart, TreePine, BookOpen as Book, Stethoscope, PawPrint, Palette, Dumbbell, Church, Megaphone, Ambulance, Globe } from 'lucide-react'
import Card from '@/components/Card.jsx'

const FEATURES = [
  { icon: Calendar,  title: 'Simple hour logging', body: 'Log activity, time, location, and proof so your volunteer work is always ready to share.' },
  { icon: Target,    title: 'Goal progress', body: 'Set a target and watch the progress ring fill as your hours add up.' },
  { icon: Trophy,    title: 'Achievements', body: 'Earn badges for consistency, milestones, and service across categories.' },
  { icon: FileText,  title: 'Reports & certificates', body: 'Export polished PDFs, CSVs, and printable certifications in seconds.' },
]

const STEPS = [
  { icon: Users, title: 'Create your account', body: 'Sign up free in under a minute. No credit card needed.' },
  { icon: Clock, title: 'Log your hours', body: 'Record activity, duration, location, and supervisor details on the go.' },
  { icon: BarChart3, title: 'Track progress', body: 'Watch your monthly totals, goal rings, and achievements fill up.' },
  { icon: Trophy, title: 'Earn & export', body: 'Unlock badges and export polished reports for school or scholarships.' },
]

const CATEGORIES = [
  { icon: Heart,     label: 'Community Service', color: 'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200' },
  { icon: TreePine,  label: 'Environmental', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' },
  { icon: Book,      label: 'Education & Tutoring', color: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200' },
  { icon: Stethoscope, label: 'Health & Wellness', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200' },
  { icon: PawPrint,  label: 'Animal Welfare', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' },
  { icon: Palette,   label: 'Arts & Culture', color: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/40 dark:text-fuchsia-200' },
  { icon: Dumbbell,  label: 'Sports & Coaching', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200' },
  { icon: Church,    label: 'Religious & Faith', color: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200' },
  { icon: Megaphone, label: 'Political & Advocacy', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200' },
  { icon: Ambulance, label: 'Disaster Relief', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200' },
]

const TESTIMONIALS = [
  {
    quote: 'VolunTrack made it so easy to keep track of my service hours for the National Honor Society. No more messy spreadsheets.',
    name: 'Maya R.',
    role: 'High school student',
  },
  {
    quote: 'We rolled VolunTrack out across our entire youth program. The reporting features alone save us hours every month.',
    name: 'David L.',
    role: 'Program coordinator',
  },
  {
    quote: 'I love that I can see my progress at a glance. The badges keep me motivated to volunteer more consistently.',
    name: 'Aisha K.',
    role: 'College volunteer',
  },
]

const FAQS = [
  { q: 'Is VolunTrack free?', a: 'Yes, the core features are completely free. Premium features like advanced reporting and school partnerships are coming in future phases.' },
  { q: 'Can I export my hours for school requirements?', a: 'Absolutely. You can export polished PDF reports, CSV files, and printable certificates with all your logged hours, supervisor details, and categories.' },
  { q: 'Is my data private?', a: 'Your data is private by default. You control what you share and with whom. We never sell or share your personal information.' },
  { q: 'Can schools and organizations use VolunTrack?', a: 'Yes! We have dedicated tools for schools and organizations to track volunteer hours across their members. Contact us to learn more about partnership options.' },
  { q: 'What if I forget to log a session?', a: 'You can log past sessions anytime. We also offer reminders so you never miss recording your volunteer work.' },
]

const SCHOOLS = [
  'Lincoln High School', 'Westside Academy', 'Brighton College Prep',
  'Maplewood School District', 'YouthServe Alliance', 'Community Impact Coalition',
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-medium text-earth-200 hover:text-white transition-colors"
      >
        {q}
        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="pb-5 text-sm text-earth-400 leading-7">
          {a}
        </div>
      )}
    </div>
  )
}

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
            <Link to="/about" className="btn-ghost">About</Link>
            <Link to="/contact" className="btn-ghost">Contact</Link>
            <Link to="/login" className="btn-ghost">Sign in</Link>
            <Link to="/register" className="btn-primary">Get started</Link>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 md:px-8 pb-20">

          <section className="mt-16 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-brand-600">How it works</p>
            <h2 className="mt-3 text-3xl font-bold text-earth-950 dark:text-white">Get started in four simple steps.</h2>
            <p className="mt-3 text-earth-400 max-w-xl mx-auto">
              From signing up to exporting your first report — VolunTrack makes volunteer tracking effortless.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map(({ icon: Icon, title, body }, i) => (
                <div key={title} className="relative">
                  <div className="w-14 h-14 rounded-full bg-brand-900/30 border border-brand-700/30 grid place-items-center text-brand-300 mx-auto mb-4 text-lg font-bold">
                    {i + 1}
                  </div>
                  <div className="w-11 h-11 rounded-3xl bg-brand-900/30 border border-brand-700/30 grid place-items-center text-brand-300 mx-auto mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-semibold mb-2 text-white text-center">{title}</div>
                  <div className="text-sm leading-6 text-slate-300 text-center max-w-xs mx-auto">{body}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-20">
            <div className="text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-brand-600">Categories</p>
              <h2 className="mt-3 text-3xl font-bold text-earth-950 dark:text-white">Track every type of service.</h2>
              <p className="mt-3 text-earth-400 max-w-xl mx-auto">
                VolunTrack supports a wide range of volunteer categories so you can log whatever service you do.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {CATEGORIES.map(({ icon: Icon, label, color }) => (
                <span key={label} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${color}`}>
                  <Icon className="w-4 h-4" />
                  {label}
                </span>
              ))}
            </div>
          </section>

          <section className="mt-20">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-brand-600">Core features</p>
                <h2 className="mt-3 text-3xl font-bold text-earth-950 dark:text-white">Everything you need to manage service hours and showcase impact.</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"><ShieldCheck className="w-4 h-4" /> Private & stores in your local storage</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-earth-100 px-4 py-2 text-sm font-semibold text-earth-700 dark:bg-white/5 dark:text-earth-300"><Users className="w-4 h-4" /> Volunteer Task Maker — post opportunities</span>
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

          <section className="mt-20">
            <div className="text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-brand-600">Testimonials</p>
              <h2 className="mt-3 text-3xl font-bold text-earth-950 dark:text-white">What people are saying.</h2>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map(({ quote, name, role }) => (
                <Card key={name} className="border border-white/10 bg-slate-900/70 text-white p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-brand-400 text-brand-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-7 text-slate-300 italic">&ldquo;{quote}&rdquo;</p>
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <div className="font-semibold text-sm text-white">{name}</div>
                    <div className="text-xs text-earth-400">{role}</div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section className="mt-20">
            <div className="text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-brand-600">Trusted by</p>
              <h2 className="mt-3 text-3xl font-bold text-earth-950 dark:text-white">Schools &amp; organizations that use VolunTrack.</h2>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SCHOOLS.map((name) => (
                <div key={name} className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/50 px-5 py-4">
                  <Building2 className="w-5 h-5 text-brand-400 shrink-0" />
                  <span className="text-sm text-earth-300">{name}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-20">
            <div className="text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-brand-600">FAQ</p>
              <h2 className="mt-3 text-3xl font-bold text-earth-950 dark:text-white">Frequently asked questions.</h2>
            </div>
            <div className="mt-8 max-w-2xl mx-auto">
              <Card className="border border-white/10 bg-slate-900/70 text-white p-6 md:p-8">
                {FAQS.map((faq) => (
                  <FaqItem key={faq.q} q={faq.q} a={faq.a} />
                ))}
              </Card>
            </div>
          </section>

          <section className="mt-20 rounded-[2rem] bg-gradient-to-br from-brand-600 to-brand-700 p-10 md:p-16 text-center">
            <Sparkles className="w-10 h-10 text-brand-200 mx-auto" />
            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-white">Ready to start tracking your impact?</h2>
            <p className="mt-3 text-brand-100 max-w-lg mx-auto leading-7">
              Join thousands of students and organizations already using VolunTrack. It&apos;s free to get started.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register" className="btn-secondary inline-flex items-center gap-2 justify-center bg-white text-brand-700 hover:bg-white/90 px-8 py-3 rounded-xl font-semibold">
                Create your free account <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 justify-center border border-white/30 text-white hover:bg-white/10 px-8 py-3 rounded-xl font-semibold transition-colors">
                Talk to us
              </Link>
            </div>
          </section>

          <section className="mt-16 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="p-8">
              <h3 className="text-2xl font-semibold text-earth-950 dark:text-white">Built for fast volunteering workflows</h3>
              <p className="mt-4 text-earth-700 dark:text-earth-300 leading-7">
                From your first log to your first service certificate, VolunTrack keeps the experience smooth and distraction-free. It helps learners, clubs, and service coordinators keep reliable records without complicated setup.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-earth-700 dark:text-earth-300">
                <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" /> Save each session with location, category, and supervisor details</li>
                <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" /> Watch your month and goal progress in one dashboard</li>
                <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" /> Export proofs instantly for school or community review</li>
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

        <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-earth-500 dark:text-earth-400">
          <span>&copy; VolunTrack 2026</span>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-white">About</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
            <Link to="/help" className="hover:text-white">Help</Link>
            <a
              href="https://www.instagram.com/volunteertrackofficial/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-white"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
              @volunteertrackofficial
            </a>
          </div>
        </footer>
      </div>
    </div>
  )
}
