import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Calendar as CalIcon, TrendingUp, Plus, Trophy, Sparkles, ChevronRight, MapPin } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth.jsx'
import { useData } from '@/hooks/useData.jsx'
import AppLayout from '@/components/AppLayout.jsx'
import Card from '@/components/Card.jsx'
import ProgressRing from '@/components/ProgressRing.jsx'
import BarChart from '@/components/BarChart.jsx'
import { categoryColor } from '@/lib/categories.js'
import { fmtDate, fmtHours, fromNow } from '@/utils/date.js'
import { format, startOfWeek, startOfMonth, addDays, parseISO, isSameMonth } from 'date-fns'

export default function Dashboard() {
  const { user } = useAuth()
  const { logs, goals, earned } = useData()

  const total = useMemo(() => logs.reduce((s, l) => s + (Number(l.hours) || 0), 0), [logs])

  // Recomputes when the calendar month changes; identity is stable across renders
  // within the same month so the memo below doesn't invalidate every keystroke.
  const monthStart = useMemo(() => startOfMonth(new Date()), [])
  const thisMonth = useMemo(
    () => logs.filter((l) => l.date && parseISO(l.date) >= monthStart)
              .reduce((s, l) => s + (Number(l.hours) || 0), 0),
    [logs, monthStart],
  )

  const primary = goals.find((g) => g.primary) || goals[0]
  const target = primary ? Number(primary.targetHours) || 0 : 0
  const percent = target > 0 ? Math.min(1, total / target) : 0
  const remaining = Math.max(0, target - total)

  // Weekly chart: last 7 days ending today
  const weekly = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => {
      const day = addDays(start, i)
      const key = format(day, 'yyyy-MM-dd')
      const value = logs
        .filter((l) => l.date === key)
        .reduce((s, l) => s + (Number(l.hours) || 0), 0)
      return { label: format(day, 'EEE')[0], value }
    })
  }, [logs])

  const recent = useMemo(() => logs.slice(0, 5), [logs])

  return (
    <AppLayout
      title={`Hi, ${user?.name?.split(' ')[0] || 'there'} 👋`}
      subtitle={user?.school ? `${user.school} · ${user.grade || 'Volunteer'}` : 'Welcome back to VolunTrack.'}
      action={
        <Link to="/log" className="btn-primary">
          <Plus className="w-4 h-4" /> Log hours
        </Link>
      }
    >
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Progress ring card */}
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <ProgressRing
              percent={percent}
              size={180} stroke={16}
              label={`${Math.round(percent * 100)}%`}
              sublabel={target ? `${fmtHours(remaining)} to goal` : 'No goal set yet'}
            />
            <div className="mt-4">
              <div className="text-sm text-earth-500 dark:text-earth-400">Total hours</div>
              <div className="text-3xl font-bold mt-0.5">{fmtHours(total)}</div>
              {primary && (
                <div className="text-xs text-earth-500 mt-1">
                  Goal: {fmtHours(target)} · {primary.title}
                </div>
              )}
            </div>
            {!primary && (
              <Link to="/settings" className="mt-3 text-sm text-brand-700 dark:text-brand-300 hover:underline">
                Set a goal →
              </Link>
            )}
          </div>
        </Card>

        {/* Stat cards */}
        <div className="lg:col-span-2 grid sm:grid-cols-3 gap-5">
          <StatCard icon={Clock}    label="This month"  value={fmtHours(thisMonth)} accent="brand" />
          <StatCard icon={CalIcon}  label="Sessions"    value={logs.length}          accent="earth" />
          <StatCard icon={Trophy}   label="Badges"      value={`${earned.length}/12`} accent="amber" />
        </div>

        {/* Weekly chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-sm text-earth-500 dark:text-earth-400">This week</div>
              <div className="font-display text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-600" /> {fmtHours(weekly.reduce((s, d) => s + d.value, 0))} logged
              </div>
            </div>
          </div>
          <BarChart data={weekly} color="#3f8344" />
        </Card>

        {/* Quick achievements */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="font-display font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> Recent badges
            </div>
            <Link to="/achievements" className="text-xs text-brand-700 dark:text-brand-300 hover:underline flex items-center gap-0.5">
              All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {earned.length === 0 ? (
            <div className="text-sm text-earth-500 dark:text-earth-400 py-6 text-center">
              No badges yet — log your first hour to earn one.
            </div>
          ) : (
            <ul className="space-y-2">
              {earned.slice(-4).reverse().map((id) => (
                <li key={id} className="text-sm font-medium capitalize text-earth-700 dark:text-earth-200">
                  🏅 {id.replaceAll('-', ' ')}
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recent activity */}
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <div className="font-display font-semibold">Recent activity</div>
            <Link to="/log" className="text-sm text-brand-700 dark:text-brand-300 hover:underline flex items-center gap-0.5">
              Log new hours <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="py-10 text-center text-earth-500 dark:text-earth-400">
              <p>No hours logged yet.</p>
              <Link to="/log" className="btn-primary mt-4 inline-flex">Log your first hours</Link>
            </div>
          ) : (
            <ul className="divide-y divide-earth-100 dark:divide-[#1f2e25]">
              {recent.map((l) => (
                <li key={l.id} className="py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 grid place-items-center text-brand-700 font-bold">
                    {fmtHours(Number(l.hours) || 0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{l.activity || 'Volunteer activity'}</div>
                    <div className="text-xs text-earth-500 dark:text-earth-400 flex items-center gap-2 flex-wrap">
                      <span>{fmtDate(l.date)}</span>
                      {l.location && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{l.location}</span>}
                      <span>{fromNow(l.createdAt)}</span>
                    </div>
                  </div>
                  {l.category && (
                    <span className={`chip ${categoryColor(l.category)}`}>{l.category}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AppLayout>
  )
}

function StatCard({ icon: Icon, label, value, accent = 'brand' }) {
  const ring = {
    brand: 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300',
    earth: 'bg-earth-100 text-earth-800 dark:bg-[#243529] dark:text-earth-200',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  }[accent]
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl grid place-items-center ${ring}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs text-earth-500 dark:text-earth-400">{label}</div>
          <div className="text-xl font-bold leading-tight">{value}</div>
        </div>
      </div>
    </Card>
  )
}
