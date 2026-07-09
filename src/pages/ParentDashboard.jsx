import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Users, Clock, Calendar, BarChart3, Loader2, AlertTriangle, Plus, ExternalLink, TrendingUp } from 'lucide-react'
import AppLayout from '@/components/AppLayout.jsx'
import Card from '@/components/Card.jsx'
import Toast from '@/components/Toast.jsx'
import { useAuth } from '@/hooks/useAuth.jsx'

const apiUrl = import.meta.env.VITE_API_URL || '/api'

export default function ParentDashboard() {
  const { user } = useAuth()
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [childHours, setChildHours] = useState({})

  const loadChildren = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('voluntrack:auth_token')
      const res = await fetch(`${apiUrl}/school/linked-children`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to load children')
      const data = await res.json()
      setChildren(data.children || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user?.role !== 'parent') return
    loadChildren()
  }, [user?.role, loadChildren])

  useEffect(() => {
    if (children.length === 0) return
    const loadHours = async () => {
      const token = localStorage.getItem('voluntrack:auth_token')
      const hoursData = {}
      for (const child of children) {
        try {
          const res = await fetch(`${apiUrl}/school/child-hours/${child.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (res.ok) {
            const data = await res.json()
            const logs = data.logs || []
            const totalHours = logs.reduce((sum, log) => sum + (Number(log.hours) || 0), 0)
            hoursData[child.id] = { totalHours, entryCount: logs.length, latestActivity: logs[0]?.date || null }
          }
        } catch {}
      }
      setChildHours(hoursData)
    }
    loadHours()
  }, [children])

  const totalChildren = children.length
  const totalHoursAll = Object.values(childHours).reduce((sum, h) => sum + (h.totalHours || 0), 0)
  const totalEntries = Object.values(childHours).reduce((sum, h) => sum + (h.entryCount || 0), 0)

  if (loading) {
    return (
      <AppLayout title="Parent Dashboard" subtitle="Loading...">
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
      <AppLayout title="Parent Dashboard" subtitle="Error">
        <Card>
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-earth-300 mb-4">{error}</p>
            <button onClick={loadChildren} className="btn-primary">Retry</button>
          </div>
        </Card>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title="Parent Dashboard"
      subtitle={`Tracking ${totalChildren} ${totalChildren === 1 ? 'child' : 'children'}`}
      action={
        <Link to="/link-student" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> Link Child
        </Link>
      }
    >
      {children.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-brand-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-white mb-2">No Children Linked</h3>
            <p className="text-earth-400 mb-6 max-w-md mx-auto">
              Link to your child's account to start tracking their volunteer hours. Ask your child for their linking code.
            </p>
            <Link to="/link-student" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Link Your First Child
            </Link>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="text-center">
              <Users className="w-6 h-6 text-brand-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{totalChildren}</div>
              <div className="text-xs text-earth-400">Children</div>
            </Card>
            <Card className="text-center">
              <Clock className="w-6 h-6 text-sky-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{totalHoursAll.toFixed(1)}</div>
              <div className="text-xs text-earth-400">Total Hours</div>
            </Card>
            <Card className="text-center">
              <Calendar className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{totalEntries}</div>
              <div className="text-xs text-earth-400">Entries</div>
            </Card>
          </div>

          <div className="space-y-4">
            {children.map((child) => {
              const hours = childHours[child.id] || { totalHours: 0, entryCount: 0, latestActivity: null }
              return (
                <Link
                  key={child.id}
                  to={`/child-hours/${child.id}`}
                  className="block hover:scale-[1.01] transition-transform"
                >
                  <Card className="cursor-pointer hover:border-brand-700/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-900/20 border border-brand-800/30 flex items-center justify-center shrink-0">
                        <span className="text-lg font-bold text-brand-400">
                          {child.name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white">{child.name}</div>
                        <div className="text-sm text-earth-400">
                          {child.email}
                          {child.grade && <span className="ml-2">· {child.grade}</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xl font-bold text-brand-400">{hours.totalHours.toFixed(1)}h</div>
                        <div className="text-xs text-earth-400">{hours.entryCount} entries</div>
                      </div>
                      <ExternalLink className="w-5 h-5 text-earth-500" />
                    </div>
                    {hours.latestActivity && (
                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-sm text-earth-400">
                        <TrendingUp className="w-4 h-4" />
                        Latest activity: {new Date(hours.latestActivity).toLocaleDateString()}
                      </div>
                    )}
                  </Card>
                </Link>
              )
            })}
          </div>
        </>
      )}

      <Toast open={toast} onClose={() => setToast(false)}>{toastMessage}</Toast>
    </AppLayout>
  )
}
