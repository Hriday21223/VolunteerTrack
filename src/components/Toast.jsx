import { useEffect } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { cn } from '@/utils/cn.js'

/** Tiny toast surface; auto-dismiss after `duration` ms. */
export default function Toast({ open, onClose, children, variant = 'success', duration = 2400 }) {
  useEffect(() => {
    if (!open) return
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [open, onClose, duration])

  if (!open) return null
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-2xl shadow-soft border',
          variant === 'success' && 'bg-white dark:bg-[#14201a] border-brand-200 text-brand-800 dark:text-brand-100',
          variant === 'error'   && 'bg-white dark:bg-[#14201a] border-red-200 text-red-800 dark:text-red-200',
          variant === 'info'    && 'bg-white dark:bg-[#14201a] border-sky-200 text-sky-800 dark:text-sky-200',
        )}
      >
        {variant === 'success' && <CheckCircle2 className="w-5 h-5 text-brand-600" />}
        <div className="text-sm font-medium">{children}</div>
        <button onClick={onClose} className="text-earth-400 hover:text-earth-700 dark:hover:text-earth-200">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
