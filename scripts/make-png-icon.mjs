// Minimal pure-Node PNG writer. Produces a simple gradient shield icon at the
// given size. No native deps — uses zlib's deflate.
//
// Usage: node scripts/make-png-icon.mjs <out> <size>
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, resolve } from 'path'
import { deflateSync } from 'zlib'

const out = resolve(process.argv[2])
const size = Number(process.argv[3]) || 192
mkdirSync(dirname(out), { recursive: true })

// RGBA pixels
const pixels = Buffer.alloc(size * size * 4)
const cx = (size - 1) / 2
const r = size * 0.46
const innerR = size * 0.36

for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4
    const dx = x - cx, dy = y - cx
    const dist = Math.sqrt(dx * dx + dy * dy)
    // Rounded square background
    const corner = size * 0.18
    const inSquare = (Math.abs(dx) < size/2 - corner && Math.abs(dy) < size/2 - corner) ||
                     circleInCorner(x, y, size, corner)
    if (!inSquare) { pixels[i] = 0; pixels[i+1] = 0; pixels[i+2] = 0; pixels[i+3] = 0; continue }
    // Vertical gradient green
    const t = y / size
    const R = Math.round(0x5f + (0x27 - 0x5f) * t)
    const G = Math.round(0xa0 + (0x54 - 0xa0) * t)
    const B = Math.round(0x62 + (0x2d - 0x62) * t)
    pixels[i] = R; pixels[i+1] = G; pixels[i+2] = B; pixels[i+3] = 255
    // White shield in the middle
    if (dist < r) {
      pixels[i] = 255; pixels[i+1] = 255; pixels[i+2] = 255; pixels[i+3] = 250
    }
  }
}

// Draw a green checkmark inside the white shield
const checkColor = [0x27, 0x54, 0x2d, 255]
drawCheck(pixels, size, checkColor)

const png = encodePNG(pixels, size, size)
writeFileSync(out, png)
console.log(`wrote ${out} (${size}x${size}, ${png.length} bytes)`)

function circleInCorner(x, y, size, r) {
  const c = r
  if (x < c && y < c)              return dist(x, y, c, c) <= c
  if (x > size-1-c && y < c)       return dist(x, y, size-1-c, c) <= c
  if (x < c && y > size-1-c)       return dist(x, y, c, size-1-c) <= c
  if (x > size-1-c && y > size-1-c) return dist(x, y, size-1-c, size-1-c) <= c
  return false
}
function dist(ax, ay, bx, by) { const dx = ax-bx, dy = ay-by; return Math.sqrt(dx*dx+dy*dy) }

function drawCheck(buf, size, color) {
  // Check goes from (0.30, 0.52) to (0.45, 0.66) to (0.72, 0.40)
  const pts = [
    [0.30, 0.52], [0.45, 0.66], [0.72, 0.40],
  ]
  const t = size * 0.04
  // Segment 1: p0 -> p1
  strokeLine(buf, size, pts[0], pts[1], t, color)
  // Segment 2: p1 -> p2
  strokeLine(buf, size, pts[1], pts[2], t, color)
}
function strokeLine(buf, size, a, b, thickness, color) {
  const x0 = a[0] * size, y0 = a[1] * size
  const x1 = b[0] * size, y1 = b[1] * size
  const steps = Math.ceil(Math.hypot(x1-x0, y1-y0))
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const x = Math.round(x0 + (x1-x0) * t)
    const y = Math.round(y0 + (y1-y0) * t)
    for (let dy = -thickness; dy <= thickness; dy++) {
      for (let dx = -thickness; dx <= thickness; dx++) {
        if (dx*dx + dy*dy > thickness*thickness) continue
        const px = x + dx, py = y + dy
        if (px < 0 || py < 0 || px >= size || py >= size) continue
        const i = (py * size + px) * 4
        if (buf[i+3] === 0) continue
        buf[i] = color[0]; buf[i+1] = color[1]; buf[i+2] = color[2]; buf[i+3] = color[3]
      }
    }
  }
}

function encodePNG(rgba, w, h) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8]  = 8   // bit depth
  ihdr[9]  = 6   // RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  // Add filter byte (0) at the start of each row
  const stride = w * 4
  const raw = Buffer.alloc((stride + 1) * h)
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride)
  }
  const idat = deflateSync(raw)

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcInput = Buffer.concat([typeBuf, data])
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(crcInput), 0)
  return Buffer.concat([len, typeBuf, data, crc])
}

function buildCrcTable() {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
    t[n] = c >>> 0
  }
  return t
}
const CRC_TABLE = buildCrcTable()
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
