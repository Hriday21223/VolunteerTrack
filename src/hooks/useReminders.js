import { useEffect, useRef, useState } from 'react'
import { listReminders, markFired, createReminder, deleteReminder,
         updateReminder } from '@/api/index.js'
import { dueReminders } from '@/lib/scheduler.js'

/**
 * Polls the reminder list every minute. When a reminder crosses its fire time,
 * it dispatches a browser notification (if permission granted) and surfaces
 * an in-app toast via the `fired` state.
 *
 * The hook deduplicates by reminder id within a single cycle, so a reminder
 * won't spam toasts if the tab is opened across reloads within the same minute.
 */
export function useReminderRunner() {
  const [fired, setFired] = useState([])
  const lastCheck = useRef(Date.now() - 60_000)

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const reminders = listReminders()
      const due = dueReminders(reminders, new Date(lastCheck.current), now)
      if (due.length) {
        const newFired = []
        for (const { reminder } of due) {
          markFired(reminder.id)
          newFired.push(reminder)
          fireBrowserNotification(reminder)
        }
        setFired((prev) => [...prev, ...newFired])
      }
      lastCheck.current = now.getTime()
    }
    tick()
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])

  const dismiss = (id) => setFired((prev) => prev.filter((r) => r.id !== id))

  return { fired, dismiss }
}

function fireBrowserNotification(r) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  try {
    const n = new Notification(r.title, {
      body: r.body || 'Time to check on your volunteer work.',
      icon: '/icon-192.png',
      tag: r.id,
    })
    n.onclick = () => { window.focus(); n.close() }
  } catch {
    // Some browsers throw if the page isn't focused — silently swallow.
  }
}

export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Notification.permission
  }
  try {
    return await Notification.requestPermission()
  } catch {
    return 'default'
  }
}

export const reminderApi = {
  list: listReminders,
  create: createReminder,
  update: updateReminder,
  remove: deleteReminder,
}
