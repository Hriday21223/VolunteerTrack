import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Clock, Calendar, BarChart3, Loader2, AlertTriangle, Download, Filter, ChevronDown } from 'lucide-react'
import AppLayout from '@/components/AppLayout.jsx'
import Card from '@/components/Card.jsx'
import Toast from '@/components/Toast.jsx'
import { useAuth } from '@/hooks/useAuth.jsx'

const apiUrl = import.meta.env.VITE_API_URL || '/api'

export default function ChildHours() {
  const { studentId } = useParams()
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [childInfo, setChildInfo] = useState(null)
  const [toast, setToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const loadChildHours = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('voluntrack:auth_token')
      
      // Get child info first
      const childrenRes = await fetch(`${apiUrl}/school/linked-children`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (childrenRes.ok) {
        const childrenData = await childrenRes.json()
        const child = childrenData.children?.find(c => c.id === studentId)
        if (child) {
          setChildInfo(child)
        }
      }

      // Get child's hours
      const res = await fetch(`${apiUrl}/school/child-hours/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load hours')
      setLogs(data.logs || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    if (user?.role !== 'parent') return
    loadChildHours()
  }, [user?.role, loadChildHours])

  const totalHours = logs.reduce((sum, log) => sum + (Number(log.hours) || 0), 0)

  const filteredLogs = logs.filter(log => {
    if (dateFilter === 'all') return true
    const logDate = new Date(log.date)
    const now = new Date()
    if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return logDate >= weekAgo
    }
    if (dateFilter === 'month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      return logDate >= monthAgo
    }
    if (dateFilter === 'year') {
      const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      return logDate >= yearAgo
    }
    if (dateFilter === 'custom' && startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      return logDate >= start && logDate <= end
    }
    return true
  })

  const filteredHours = filteredLogs.reduce((sum, log) => sum + (Number(log.hours) || 0), 0)

  const exportCSV = () => {
    const headers = ['Date', 'Activity', 'Category', 'Hours', 'Notes']
    const rows = filteredLogs.map(log => [
      new Date(log.date).toLocaleDateString(),
      log.activity || 'Volunteer work',
      log.category || '',
      Number(log.hours).toFixed(1),
      log.notes || ''
    ])
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${childInfo?.name || 'child'}_hours.csv`
    a.click()
    URL.revokeObjectURL(url)
    setToastMessage('Hours exported as CSV')
    setToast(true)
  }

  if (loading) {
    return (
      <AppLayout title="Child Volunteer Hours" subtitle="Loading...">
        <Card>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
          </div>
        </Card>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout title="Child Volunteer Hours" subtitle="Error">
        <Card>
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-earth-300 mb-4">{error}</p>
            <Link to="/parent/dashboard" className="btn-primary">Back to Dashboard</Link>
          </div>
        </Card>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title={`${childInfo?.name || 'Child'}'s Hours`}
      subtitle={`Total: ${totalHours.toFixed(1)} hours`}
      action={
        <Link to="/parent/dashboard" className="btn-sm btn-ghost">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
        </Link>
      }
    >
      <Card className="mb-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl bg-brand-900/20 border border-brand-800/30">
            <Clock className="w-6 h-6 text-brand-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{filteredHours.toFixed(1)}</div>
            <div className="text-xs text-earth-400">{dateFilter === 'all' ? 'Total Hours' : 'Filtered Hours'}</div>
          </div>
          <div className="p-4 rounded-xl bg-sky-900/20 border border-sky-800/30">
            <Calendar className="w-6 h-6 text-sky-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{filteredLogs.length}</div>
            <div className="text-xs text-earth-400">Entries</div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-900/20 border border-emerald-800/30">
            <BarChart3 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{logs.length > 0 ? new Date(logs[0].date).toLocaleDateString() : 'N/A'}</div>
            <div className="text-xs text-earth-400">Latest Activity</div>
          </div>
        </div>
      </Card>

      <Card className="mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-earth-400" />
            <span className="text-sm font-medium text-earth-300">Filter:</span>
          </div>
          <div className="flex gap-2">
            {['all', 'week', 'month', 'year', 'custom'].map(f => (
              <button
                key={f}
                onClick={() => setDateFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  dateFilter === f
                    ? 'bg-brand-600 text-white'
                    : 'bg-white/5 text-earth-400 hover:bg-white/10'
                }`}
              >
                {f === 'all' ? 'All Time' : f === 'week' ? 'This Week' : f === 'month' ? 'This Month' : f === 'year' ? 'This Year' : 'Custom'}
              </button>
            ))}
          </div>
          {dateFilter === 'custom' && (
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input py-1.5 text-sm"
              />
              <span className="text-earth-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input py-1.5 text-sm"
              />
            </div>
          )}
          <button onClick={exportCSV} className="btn-secondary ml-auto inline-flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </Card>

      <Card>
        <h3 className="font-display font-semibold mb-4">Volunteer History</h3>
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-earth-400">
            <Clock className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p>No volunteer hours logged yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 rounded-xl border border-white/10 bg-white/5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">{log.activity || 'Volunteer work'}</p>
                    <p className="text-sm text-earth-400 mt-1">
                      {log.category && <span className="mr-2">{log.category}</span>}
                      <span>{new Date(log.date).toLocaleDateString()}</span>
                    </p>
                    {log.notes && (
                      <p className="text-sm text-earth-500 mt-2">{log.notes}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-brand-400">{Number(log.hours).toFixed(1)}h</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Toast open={toast} onClose={() => setToast(false)}>{toastMessage}</Toast>
    </AppLayout>
  )
}