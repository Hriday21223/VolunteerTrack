import { useMemo } from 'react'
import { cn } from '@/utils/cn.js'

/** Inline SVG bar chart — no extra dep. */
export default function BarChart({ data, height = 120, color = '#3f8344' }) {
  const max = useMemo(() => Math.max(1, ...data.map((d) => d.value || 0)), [data])
  const w = 100 / data.length
  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full h-full">
        {data.map((d, i) => {
          const h = ((d.value || 0) / max) * (height - 18)
          return (
            <g key={d.label + i}>
              <rect
                x={i * w + w * 0.15}
                y={height - h - 14}
                width={w * 0.7}
                height={h}
                rx={2}
                fill={color}
                opacity={d.value ? 1 : 0.25}
              />
              <text
                x={i * w + w / 2}
                y={height - 2}
                textAnchor="middle"
                fontSize="8"
                fill="currentColor"
                className="text-earth-500 dark:text-earth-400"
              >
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
