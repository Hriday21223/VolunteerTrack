import { Link } from 'react-router-dom'
import { ArrowLeft, Activity, CheckCircle2, XCircle } from 'lucide-react'
import Card from '@/components/Card.jsx'

function StatusBadge({ ok, label }) {
  return (
    <div className="flex items-center gap-2">
      {ok ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
      <span className="text-sm">{label}</span>
    </div>
  )
}

export default function Status() {
  const storageOk = (() => {
    try {
      localStorage.setItem('__test__', '1')
      localStorage.removeItem('__test__')
      return true
    } catch { return false }
  })()

  const logCount = JSON.parse(localStorage.getItem('voluntrack:logs') || '[]').length
  const userCount = JSON.parse(localStorage.getItem('voluntrack:users') || '[]').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-earth-50 to-earth-100 dark:from-[#0f1813] dark:via-[#0f1813] dark:to-[#14201a]">
      <header className="px-4 md:px-8 py-5 flex items-center justify-between">
        <Link to="/login" className="flex items-center gap-2.5">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="VolunTrack" className="w-9 h-9 object-contain" />
          <span className="font-display font-bold text-lg">VolunTrack</span>
        </Link>
        <Link to="/login" className="btn-ghost"><ArrowLeft className="w-4 h-4" /> Back to sign in</Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-8 pb-20">
        <h1 className="text-3xl md:text-4xl font-bold text-center">System Status</h1>
        <p className="text-center text-earth-600 dark:text-earth-300 mt-3 max-w-xl mx-auto">
          Check the current operational status of VolunTrack.
        </p>

        <div className="mt-10 space-y-4">
          <Card>
            <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-600" /> Services
            </h2>
            <div className="space-y-3">
              <StatusBadge ok label="Application — running" />
              <StatusBadge ok={storageOk} label={`Local storage — ${storageOk ? 'available' : 'unavailable'}`} />
              <StatusBadge ok label={`API —${import.meta.env.VITE_API_URL ? ' external' : ' local (dev)'}`} />
            </div>
          </Card>

          <Card>
            <h2 className="font-display font-semibold text-lg mb-4">Statistics</h2>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-brand-700 dark:text-brand-300">{userCount}</div>
                <div className="text-xs text-earth-500 mt-1">Users</div>
              </div>
              <div className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-brand-700 dark:text-brand-300">{logCount}</div>
                <div className="text-xs text-earth-500 mt-1">Volunteer logs</div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="font-display font-semibold text-lg mb-4">Version</h2>
            <div className="text-sm text-earth-600 dark:text-earth-300 space-y-1">
              <p><span className="font-medium">Build:</span> {import.meta.env.VITE_APP_VERSION || '0.1.0'}</p>
              <p><span className="font-medium">Environment:</span> {import.meta.env.MODE}</p>
              <p><span className="font-medium">Platform:</span> Client-side (local storage)</p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
