import { Link } from 'react-router-dom'
import { Heart, ArrowLeft, Target, Trophy, FileText, Calendar } from 'lucide-react'
import Card from '@/components/Card.jsx'

const FEATURES = [
  { icon: Calendar,  title: 'Log volunteer hours', body: 'Capture activity, time, location, and notes — plus supervisor verification and proof uploads.' },
  { icon: Target,    title: 'Set goals and streaks', body: 'Pick a target and watch the progress ring fill. Earn badges along the way.' },
  { icon: Trophy,    title: 'Achievements that matter', body: 'Twelve earnable badges recognize consistency, variety, and milestones like your first 100 hours.' },
  { icon: FileText,  title: 'Reports and certificates', body: 'Export a polished PDF log, a CSV for spreadsheets, or a printable certificate of service.' },
]

export default function About() {
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

      <main className="max-w-3xl mx-auto px-4 md:px-8 pb-20">
        <Card padded={false} className="p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">About VolunTrack</h1>
          <p className="mt-4 text-earth-700 dark:text-earth-200 leading-relaxed">
            VolunTrack is a calm, focused volunteer hour tracker built for students,
            community organizers, and anyone who wants a clear record of the time they
            give back. It was designed to make three things feel effortless: logging
            the hours you have already served, watching your progress toward a goal
            fill a real progress ring, and turning that record into a polished report
            when you need to show it to a school, supervisor, or scholarship committee.
          </p>
          <p className="mt-4 text-earth-700 dark:text-earth-200 leading-relaxed">
            The app is for high schoolers completing service-hour requirements, college
            applicants building a portfolio, club leaders tracking the impact of a
            team, and adult volunteers who simply want a private log of their service
            across organizations. Every hour you log is paired with a date, location,
            category, and an optional supervisor name, email, and proof attachment so
            the record stands on its own without follow-up emails.
          </p>
          <p className="mt-4 text-earth-700 dark:text-earth-200 leading-relaxed">
            VolunTrack is designed and built by Noothen's Workspace — a small
            independent studio that ships single-purpose apps with the polish of
            larger products. The app stores everything on your device, so your
            service record stays private by default. There is no account to lose,
            no ad network, and no analytics tracker watching what you log.
          </p>
        </Card>

        <h2 className="font-display text-xl font-bold mt-10 mb-4 px-1">What you can do</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <Card key={title}>
              <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 grid place-items-center text-brand-700 mb-3">
                <Icon className="w-5 h-5" />
              </div>
              <div className="font-semibold mb-1">{title}</div>
              <div className="text-sm text-earth-600 dark:text-earth-300">{body}</div>
            </Card>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/login" className="btn-primary">Start tracking your hours</Link>
          <div className="text-sm text-earth-500 mt-3">
            Have a question? <Link to="/contact" className="text-brand-700 dark:text-brand-300 hover:underline">Get in touch</Link>.
          </div>
        </div>
      </main>
    </div>
  )
}
