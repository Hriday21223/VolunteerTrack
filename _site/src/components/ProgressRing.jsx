import { cn } from '@/utils/cn.js'

/** Circular progress ring (SVG, no canvas). */
export default function ProgressRing({ percent, size = 160, stroke = 14, label, sublabel, className }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const p = Math.max(0, Math.min(1, percent))
  const offset = c * (1 - p)

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="currentColor" strokeWidth={stroke} fill="none"
          className="text-earth-100 dark:text-[#1b2a22]"
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="currentColor" strokeWidth={stroke} fill="none"
          strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          className="text-brand-500 transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          {label && <div className="text-3xl font-bold text-earth-900 dark:text-earth-100">{label}</div>}
          {sublabel && <div className="text-xs text-earth-500 dark:text-earth-400 mt-0.5">{sublabel}</div>}
        </div>
      </div>
    </div>
  )
}
