import jsPDF from 'jspdf'

/** Build a PNG dataURL of a simple progress ring. */
export function progressRingPng({ percent, size = 160, stroke = 14, color = '#3f8344', track = '#dcecdc' }) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  const r = (size - stroke) / 2
  const cx = size / 2

  ctx.lineWidth = stroke
  ctx.lineCap = 'round'

  // track
  ctx.strokeStyle = track
  ctx.beginPath()
  ctx.arc(cx, cx, r, 0, Math.PI * 2)
  ctx.stroke()

  // progress
  const p = Math.max(0, Math.min(1, percent))
  if (p > 0) {
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.arc(cx, cx, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p)
    ctx.stroke()
  }
  return c.toDataURL('image/png')
}
