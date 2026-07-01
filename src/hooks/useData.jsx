import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { listLogs, createLog, updateLog, deleteLog,
         listGoals, upsertGoal, deleteGoal,
         getEarned, markEarned, getReview, saveReview } from '@/api/index.js'
import { evaluateAchievements } from '@/lib/achievements.js'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [logs, setLogs] = useState(() => listLogs())
  const [goals, setGoals] = useState(() => listGoals())
  const [earned, setEarned] = useState(() => getEarned())
  const [pendingBadges, setPendingBadges] = useState([])
  const [showReview, setShowReview] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(() => !!getReview())

  const totalHours = useMemo(() => logs.reduce((s, l) => s + (Number(l.hours) || 0), 0), [logs])

  // Re-evaluate achievements whenever logs/goals change.
  useEffect(() => {
    const { newly } = evaluateAchievements(logs, goals, earned)
    if (newly.length) {
      newly.forEach(markEarned)
      setEarned((prev) => [...prev, ...newly])
      setPendingBadges(newly)
    }
  }, [logs, goals, earned])

  const addLog = useCallback((data) => {
    const log = createLog(data)
    setLogs((prev) => {
      const next = [log, ...prev]
      const total = next.reduce((s, l) => s + (Number(l.hours) || 0), 0)
      if (total >= 10 && !getReview()) {
        setShowReview(true)
      }
      return next
    })
    return log
  }, [])
  const editLog = useCallback((id, patch) => {
    const log = updateLog(id, patch)
    if (log) setLogs((prev) => prev.map((l) => (l.id === id ? log : l)))
    return log
  }, [])
  const removeLog = useCallback((id) => {
    deleteLog(id)
    setLogs((prev) => prev.filter((l) => l.id !== id))
  }, [])

  const saveGoal = useCallback((g) => {
    const next = upsertGoal(g)
    setGoals(next)
  }, [])
  const removeGoal = useCallback((id) => {
    deleteGoal(id)
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }, [])

  const dismissBadges = useCallback(() => setPendingBadges([]), [])

  const submitReview = useCallback((rating, comment) => {
    saveReview({ rating, comment })
    setReviewSubmitted(true)
    setShowReview(false)
  }, [])

  return (
    <DataContext.Provider
      value={{
        logs, goals, earned, pendingBadges, dismissBadges,
        addLog, editLog, removeLog,
        saveGoal, removeGoal,
        showReview, reviewSubmitted, submitReview, totalHours,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

// Hook and provider live together on purpose (standard React context idiom).
// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside <DataProvider>')
  return ctx
}
