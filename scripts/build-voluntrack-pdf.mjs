import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const require = createRequire(import.meta.url)
const { jsPDF } = require('jspdf')
const autoTable = require('jspdf-autotable').default || require('jspdf-autotable')

// Letter portrait, generous margins.
const PAGE_W = 612
const PAGE_H = 792
const MARGIN_X = 54
const MARGIN_Y = 54

const COLOR = {
  ink:    [15, 23, 18],
  body:   [38, 50, 44],
  muted:  [110, 122, 116],
  rule:   [217, 217, 213],
  brand:  [63, 131, 68],
  brandDk:[33, 67, 39],
  accent: [37, 99, 235],
  warn:   [217, 119, 6],
  chipBg: [240, 247, 240],
  panel:  [248, 250, 248],
}

const FONT_S = { sans: 'helvetica', serif: 'times' }

function setFill(doc, [r, g, b]) { doc.setFillColor(r, g, b) }
function setText(doc, [r, g, b]) { doc.setTextColor(r, g, b) }
function setDraw(doc, [r, g, b]) { doc.setDrawColor(r, g, b) }

function pageHeader(doc, section, pageNum, totalPages) {
  // Brand chip (left) + section + page (right)
  doc.setFont(FONT_S.sans, 'bold')
  doc.setFontSize(8)
  setText(doc, COLOR.brand)
  doc.text('VOLUNTRACK', MARGIN_X, 38)

  setText(doc, COLOR.muted)
  doc.text(section.toUpperCase(), PAGE_W / 2, 38, { align: 'center' })

  doc.text(`${String(pageNum).padStart(2, '0')} / ${String(totalPages).padStart(2, '0')}`, PAGE_W - MARGIN_X, 38, { align: 'right' })

  setDraw(doc, COLOR.rule)
  doc.setLineWidth(0.5)
  doc.line(MARGIN_X, 44, PAGE_W - MARGIN_X, 44)
}

function pageFooter(doc) {
  setText(doc, COLOR.muted)
  doc.setFont(FONT_S.sans, 'normal')
  doc.setFontSize(8)
  doc.text('hriday21223.github.io/VolunteerTrack', MARGIN_X, PAGE_H - 28)
  doc.text('github.com/Hriday21223/VolunteerTrack', PAGE_W - MARGIN_X, PAGE_H - 28, { align: 'right' })
}

function h1(doc, text, y) {
  doc.setFont(FONT_S.sans, 'bold')
  doc.setFontSize(28)
  setText(doc, COLOR.ink)
  const split = doc.splitTextToSize(text, PAGE_W - 2 * MARGIN_X)
  doc.text(split, MARGIN_X, y)
  return y + split.length * 30
}

function h2(doc, text, y) {
  doc.setFont(FONT_S.sans, 'bold')
  doc.setFontSize(16)
  setText(doc, COLOR.ink)
  doc.text(text, MARGIN_X, y)
  return y + 22
}

function lead(doc, text, y, opts = {}) {
  doc.setFont(FONT_S.sans, opts.style || 'normal')
  doc.setFontSize(opts.size || 11)
  setText(doc, opts.color || COLOR.body)
  const split = doc.splitTextToSize(text, PAGE_W - 2 * MARGIN_X)
  doc.text(split, MARGIN_X, y)
  return y + split.length * (opts.lineHeight || 14)
}

function paragraph(doc, text, y, opts = {}) {
  doc.setFont(FONT_S.sans, opts.style || 'normal')
  doc.setFontSize(opts.size || 10.5)
  setText(doc, opts.color || COLOR.body)
  const split = doc.splitTextToSize(text, PAGE_W - 2 * MARGIN_X)
  doc.text(split, MARGIN_X, y)
  return y + split.length * (opts.lineHeight || 13.5)
}

function divider(doc, y, color = COLOR.rule) {
  setDraw(doc, color)
  doc.setLineWidth(0.5)
  doc.line(MARGIN_X, y, PAGE_W - MARGIN_X, y)
  return y + 12
}

function chip(doc, x, y, label, fill = COLOR.chipBg, text = COLOR.brandDk) {
  doc.setFont(FONT_S.sans, 'bold')
  doc.setFontSize(8)
  const w = doc.getTextWidth(label) + 14
  setFill(doc, fill)
  doc.roundedRect(x, y - 9, w, 14, 7, 7, 'F')
  setText(doc, text)
  doc.text(label, x + 7, y + 1)
  return w + 8
}

function card(doc, x, y, w, h, opts = {}) {
  setFill(doc, opts.fill || COLOR.panel)
  setDraw(doc, opts.border || COLOR.rule)
  doc.setLineWidth(0.5)
  doc.roundedRect(x, y, w, h, 8, 8, 'FD')
}

function tag(doc, x, y, label, color = COLOR.brand) {
  doc.setFont(FONT_S.sans, 'bold')
  doc.setFontSize(7)
  const w = doc.getTextWidth(label) + 10
  setFill(doc, color)
  doc.roundedRect(x, y - 7, w, 11, 5.5, 5.5, 'F')
  doc.setTextColor(255, 255, 255)
  doc.text(label, x + 5, y + 0.5)
  return w + 6
}

// ============================================================
// DOCUMENT
// ============================================================
const doc = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'portrait' })
doc.setProperties({
  title: "VolunTrack Pitch Overview",
  subject: "Volunteer hour tracker — product, privacy, and roadmap",
  author: "VolunTrack",
  keywords: "volunteer hours, PWA, localStorage, privacy",
  creator: "VolunTrack build script"
})

// We need a stable total page count for headers. Author content first, then
// re-emit headers after knowing the page total.
const pages = [] // { section, draw } — we capture a "page" abstraction by writing
                  // content into a fresh page each call. To keep the page count
                  // accurate, we author page-by-page and remember the index.

const TOTAL = 8
let pageNum = 0

function startPage(section) {
  if (pageNum > 0) doc.addPage()
  pageNum += 1
  pageHeader(doc, section, pageNum, TOTAL)
  return MARGIN_Y
}

// ----- Page 1: Cover -----
{
  let y = startPage('Cover')
  y = 130
  // Logo plate
  setFill(doc, COLOR.brand)
  doc.roundedRect(MARGIN_X, y, 80, 80, 14, 14, 'F')
  doc.setFont(FONT_S.sans, 'bold')
  doc.setFontSize(40)
  doc.setTextColor(255, 255, 255)
  doc.text('V', MARGIN_X + 40, y + 56, { align: 'center' })

  y += 110
  doc.setFont(FONT_S.sans, 'bold')
  doc.setFontSize(10)
  setText(doc, COLOR.brand)
  doc.text('VOLUNTRACK  ·  PITCH OVERVIEW', MARGIN_X, y)
  y += 30

  doc.setFont(FONT_S.sans, 'bold')
  doc.setFontSize(34)
  setText(doc, COLOR.ink)
  const title = doc.splitTextToSize('A calmer way to track volunteer hours.', PAGE_W - 2 * MARGIN_X)
  doc.text(title, MARGIN_X, y)
  y += title.length * 36

  y += 10
  y = lead(doc,
    'VolunTrack is a privacy-first PWA for students and clubs to log service hours, set goals, earn badges, and export reports — without an account server.',
    y, { size: 13, color: COLOR.body, lineHeight: 18 })

  y += 18
  // Pill row
  let px = MARGIN_X
  for (const label of ['React 18 · Vite', 'PWA · offline-first', 'localStorage only', 'Open source']) {
    px += chip(doc, px, y, label)
  }

  // Highlight block
  y += 60
  card(doc, MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 96, { fill: [241, 248, 241], border: COLOR.brand })
  doc.setFont(FONT_S.sans, 'bold')
  doc.setFontSize(12)
  setText(doc, COLOR.brandDk)
  doc.text('Why it exists', MARGIN_X + 18, y + 26)
  doc.setFont(FONT_S.sans, 'normal')
  doc.setFontSize(10.5)
  setText(doc, COLOR.body)
  const w = doc.splitTextToSize('Students lose hours to lost sign-in sheets, fragile spreadsheets, and school portals they can\'t access after graduation. VolunTrack keeps the record portable, the proof attached, and the friction low.', PAGE_W - 2 * MARGIN_X - 36)
  doc.text(w, MARGIN_X + 18, y + 46)

  y += 96 + 30
  // Live + repo callout
  setText(doc, COLOR.muted)
  doc.setFontSize(9)
  doc.setFont(FONT_S.sans, 'bold')
  doc.text('LIVE', MARGIN_X, y)
  setText(doc, COLOR.ink)
  doc.setFont(FONT_S.sans, 'normal')
  doc.text('hriday21223.github.io/VolunteerTrack', MARGIN_X + 36, y)
  y += 14
  setText(doc, COLOR.muted)
  doc.setFont(FONT_S.sans, 'bold')
  doc.text('REPO', MARGIN_X, y)
  setText(doc, COLOR.ink)
  doc.setFont(FONT_S.sans, 'normal')
  doc.text('github.com/Hriday21223/VolunteerTrack', MARGIN_X + 36, y)

  pageFooter(doc)
}

// ----- Page 2: The problem -----
{
  let y = startPage('Problem')
  y = h1(doc, 'Today, tracking volunteer hours is painful.', y)
  y = lead(doc,
    'Students juggle five tools to do one job — and lose hours to the cracks between them.',
    y, { size: 11, color: COLOR.muted })
  y += 10

  const items = [
    { title: 'Sign-in sheets get lost',     body: 'Paper sign-ins disappear in backpacks. Supervisors misfile emails. Hours vanish.' },
    { title: 'Spreadsheets are fragile',    body: 'Manual totals, broken formulas, and no proof of work when colleges ask.' },
    { title: 'School portals lock you out', body: 'Once you graduate, the records you need are owned by someone else\'s system.' },
    { title: 'Notifications live in 4 apps', body: 'Reminder emails, group chats, calendars, and notebooks all carry fragments.' },
  ]
  const colW = (PAGE_W - 2 * MARGIN_X - 18) / 2
  const cardH = 116
  items.forEach((it, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = MARGIN_X + col * (colW + 18)
    const cy = y + row * (cardH + 18)

    card(doc, x, cy, colW, cardH, { fill: COLOR.panel })
    // number
    setFill(doc, [254, 226, 226])
    doc.roundedRect(x + 16, cy + 16, 28, 28, 6, 6, 'F')
    setText(doc, COLOR.warn)
    doc.setFont(FONT_S.sans, 'bold')
    doc.setFontSize(14)
    doc.text(String(i + 1), x + 30, cy + 35, { align: 'center' })

    doc.setFont(FONT_S.sans, 'bold')
    doc.setFontSize(12)
    setText(doc, COLOR.ink)
    doc.text(it.title, x + 56, cy + 32)

    doc.setFont(FONT_S.sans, 'normal')
    doc.setFontSize(10)
    setText(doc, COLOR.body)
    const lines = doc.splitTextToSize(it.body, colW - 72)
    doc.text(lines, x + 56, cy + 50)
  })

  y += 2 * (cardH + 18) + 14

  card(doc, MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 60, { fill: [255, 251, 235], border: COLOR.warn })
  doc.setFont(FONT_S.sans, 'bold')
  doc.setFontSize(10)
  setText(doc, COLOR.warn)
  doc.text('THE COST', MARGIN_X + 18, y + 24)
  doc.setFont(FONT_S.sans, 'normal')
  doc.setFontSize(10.5)
  setText(doc, COLOR.ink)
  doc.text('Hours that are real but unprovable are hours a college application never gets to use.',
    MARGIN_X + 18, y + 44)

  pageFooter(doc)
}

// ----- Page 3: Product -----
{
  let y = startPage('Product')
  y = h1(doc, 'One app. Five jobs. No account server.', y)
  y = lead(doc,
    'VolunTrack replaces the spreadsheet, the reminder email, and the certificate generator — all on the student\'s own device.',
    y, { size: 11, color: COLOR.muted })
  y += 14

  const pillars = [
    { tag: 'LOG',    title: 'Smart hour logging',     body: 'Activity, time, location, supervisor, and proof in one form. Paste a sentence and the agent drafts the rest.' },
    { tag: 'TRACK',  title: 'Progress that adds up',  body: 'Progress ring, weekly chart, and 12 auto-earning badges make consistency visible without nagging.' },
    { tag: 'REMIND', title: 'Browser-native nudges',  body: 'Daily, weekly, monthly, or one-off reminders with built-in browser notifications — no third-party service.' },
    { tag: 'REPORT', title: 'Reports in one click',   body: 'PDF service log, CSV export, and a printable certificate ready for college applications.' },
    { tag: 'OWN',    title: 'Your data stays yours',  body: 'Everything lives in localStorage under your account id. Nothing is uploaded; nothing is shared.' },
  ]

  // First row: 3 columns
  const colW = (PAGE_W - 2 * MARGIN_X - 2 * 14) / 3
  const cardH = 138
  pillars.slice(0, 3).forEach((p, i) => {
    const x = MARGIN_X + i * (colW + 14)
    const cy = y
    card(doc, x, cy, colW, cardH)
    setFill(doc, [220, 236, 220])
    doc.roundedRect(x + 14, cy + 14, 44, 16, 8, 8, 'F')
    setText(doc, COLOR.brandDk)
    doc.setFont(FONT_S.sans, 'bold')
    doc.setFontSize(8)
    doc.text(p.tag, x + 36, cy + 25, { align: 'center' })

    doc.setFont(FONT_S.sans, 'bold')
    doc.setFontSize(12)
    setText(doc, COLOR.ink)
    doc.text(p.title, x + 14, cy + 56)

    doc.setFont(FONT_S.sans, 'normal')
    doc.setFontSize(9.5)
    setText(doc, COLOR.body)
    const lines = doc.splitTextToSize(p.body, colW - 28)
    doc.text(lines, x + 14, cy + 76)
  })

  y += cardH + 14
  // Second row: 2 columns
  const colW2 = (PAGE_W - 2 * MARGIN_X - 14) / 2
  pillars.slice(3).forEach((p, i) => {
    const x = MARGIN_X + i * (colW2 + 14)
    const cy = y
    card(doc, x, cy, colW2, cardH)
    setFill(doc, [220, 236, 220])
    doc.roundedRect(x + 14, cy + 14, 44, 16, 8, 8, 'F')
    setText(doc, COLOR.brandDk)
    doc.setFont(FONT_S.sans, 'bold')
    doc.setFontSize(8)
    doc.text(p.tag, x + 36, cy + 25, { align: 'center' })

    doc.setFont(FONT_S.sans, 'bold')
    doc.setFontSize(12)
    setText(doc, COLOR.ink)
    doc.text(p.title, x + 14, cy + 56)

    doc.setFont(FONT_S.sans, 'normal')
    doc.setFontSize(9.5)
    setText(doc, COLOR.body)
    const lines = doc.splitTextToSize(p.body, colW2 - 28)
    doc.text(lines, x + 14, cy + 76)
  })

  y += cardH + 24
  y = paragraph(doc,
    'The whole loop — log, track, remind, report, own — fits on one screen per step, in roughly a minute per entry.',
    y, { size: 10, color: COLOR.muted, style: 'italic' })

  pageFooter(doc)
}

// ----- Page 4: Privacy & per-user isolation -----
{
  let y = startPage('Privacy')
  y = h1(doc, 'Your hours, your device, your account.', y)
  y = lead(doc,
    'VolunTrack is local-first. The only "account" is a JSON blob on the student\'s own device — no server, no telemetry on volunteer data.',
    y, { size: 11, color: COLOR.muted })
  y += 14

  // Two-column layout: data model (left), per-user isolation (right)
  const leftW = (PAGE_W - 2 * MARGIN_X - 18) * 0.55
  const rightW = (PAGE_W - 2 * MARGIN_X - 18) - leftW
  const colH = 460

  // Left: data model card
  card(doc, MARGIN_X, y, leftW, colH)
  setText(doc, COLOR.brandDk)
  doc.setFont(FONT_S.sans, 'bold')
  doc.setFontSize(10)
  doc.text('DATA MODEL  ·  LOCALSTORAGE NAMESPACES', MARGIN_X + 18, y + 24)

  const rows = [
    ['voluntrack:user',         'Profile, school, grade, avatar'],
    ['voluntrack:logs',         'VolunteerLog[] (hours, proof, supervisor)'],
    ['voluntrack:goals',        'Goal[] with targetHours + primary flag'],
    ['voluntrack:achievements', 'Earned badge IDs'],
    ['voluntrack:reminders',    'Reminder[] (daily / weekly / monthly)'],
    ['voluntrack:theme',        'Light / dark preference'],
  ]
  let ry = y + 44
  rows.forEach((r) => {
    setFill(doc, [252, 252, 250])
    setDraw(doc, COLOR.rule)
    doc.roundedRect(MARGIN_X + 14, ry, leftW - 28, 38, 4, 4, 'FD')
    setText(doc, COLOR.accent)
    doc.setFont('courier', 'bold')
    doc.setFontSize(9.5)
    doc.text(r[0], MARGIN_X + 24, ry + 16)
    setText(doc, COLOR.body)
    doc.setFont(FONT_S.sans, 'normal')
    doc.setFontSize(9.5)
    const lines = doc.splitTextToSize(r[1], leftW - 28 - 160)
    doc.text(lines, MARGIN_X + 178, ry + 16)
    ry += 50
  })

  // Right: per-user isolation
  const rx = MARGIN_X + leftW + 18
  card(doc, rx, y, rightW, colH)
  setText(doc, COLOR.brandDk)
  doc.setFont(FONT_S.sans, 'bold')
  doc.setFontSize(10)
  doc.text('PER-USER ISOLATION', rx + 18, y + 24)

  // User cards
  const userH = 170
  const drawUser = (ux, name, email, scope) => {
    card(doc, ux, y + 50, rightW - 36, userH, { fill: [252, 252, 250] })
    setFill(doc, COLOR.brand)
    doc.circle(ux + 28, y + 80, 16, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont(FONT_S.sans, 'bold')
    doc.setFontSize(13)
    doc.text(name[0], ux + 28, y + 85, { align: 'center' })

    setText(doc, COLOR.ink)
    doc.setFont(FONT_S.sans, 'bold')
    doc.setFontSize(12)
    doc.text(name, ux + 56, y + 76)

    setText(doc, COLOR.muted)
    doc.setFont(FONT_S.sans, 'normal')
    doc.setFontSize(9)
    doc.text(email, ux + 56, y + 90)

    let py = y + 110
    scope.forEach((s) => {
      setFill(doc, [220, 236, 220])
      doc.roundedRect(ux + 16, py, rightW - 68, 16, 8, 8, 'F')
      setText(doc, COLOR.brandDk)
      doc.setFont(FONT_S.sans, 'bold')
      doc.setFontSize(8)
      doc.text(s, ux + 16 + (rightW - 68) / 2, py + 11, { align: 'center' })
      py += 18
    })
  }
  drawUser(rx + 18, 'Alex', 'alex@school.edu', ['logs', 'goals', 'reminders', 'agent memory'])

  // The "no cross-user" stamp on top of the right card
  setDraw(doc, COLOR.warn)
  doc.setLineWidth(1.5)
  doc.line(rx + 12, y + 40, rx + rightW - 12, y + colH - 12)
  doc.line(rx + 12, y + colH - 12, rx + rightW - 12, y + 40)
  setText(doc, COLOR.warn)
  doc.setFont(FONT_S.sans, 'bold')
  doc.setFontSize(9)
  doc.text('NO SHARED MEMORY', rx + rightW / 2, y + colH - 20, { align: 'center' })

  // Bottom: a one-line promise
  y += colH + 18
  y = paragraph(doc,
    'No shared memory. No cross-user access. The agent only ever reads the signed-in user\'s localStorage scope.',
    y, { size: 10, color: COLOR.muted, style: 'italic' })

  pageFooter(doc)
}

// ----- Page 5: Tech stack -----
{
  let y = startPage('Stack')
  y = h1(doc, 'A stack that just gets out of the way.', y)
  y = lead(doc,
    'React + Vite for speed, Tailwind for visual consistency, jsPDF for exportable reports, date-fns for the calendar. localStorage replaces the database.',
    y, { size: 11, color: COLOR.muted })
  y += 10

  const rows = [
    ['Frontend',     'React 18 · React Router 6'],
    ['Build',        'Vite 7 with vite-plugin-pwa'],
    ['Styling',      'Tailwind CSS 3 (custom brand + earth palettes)'],
    ['Icons',        'lucide-react'],
    ['Dates',        'date-fns 3'],
    ['Export',       'jsPDF + jspdf-autotable'],
    ['Analytics',    '@vercel/analytics · @vercel/speed-insights'],
    ['Persistence',  'Browser localStorage (no server)'],
    ['Email',        'Optional: Express + nodemailer for recovery codes'],
    ['CI / Deploy',  'GitHub Actions → GitHub Pages'],
  ]
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN_X, right: MARGIN_X },
    tableWidth: PAGE_W - 2 * MARGIN_X,
    head: [['LAYER', 'WHAT WE USE']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: COLOR.brand,
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
      cellPadding: { top: 6, right: 8, bottom: 6, left: 10 },
    },
    bodyStyles: {
      fontSize: 10,
      textColor: COLOR.body,
      cellPadding: { top: 6, right: 8, bottom: 6, left: 10 },
    },
    alternateRowStyles: { fillColor: COLOR.panel },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: COLOR.ink, cellWidth: 130 },
    },
  })

  // Get current y after table
  const finalY = doc.lastAutoTable?.finalY || (y + 320)
  y = finalY + 30

  // Pull-quote about deployment
  card(doc, MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 80, { fill: [241, 248, 241], border: COLOR.brand })
  doc.setFont(FONT_S.sans, 'bold')
  doc.setFontSize(10)
  setText(doc, COLOR.brandDk)
  doc.text('DEPLOYMENT', MARGIN_X + 18, y + 22)
  doc.setFont(FONT_S.sans, 'normal')
  doc.setFontSize(10.5)
  setText(doc, COLOR.ink)
  const dp = doc.splitTextToSize('Static SPA on GitHub Pages. PWA-installable on iOS, Android, and desktop. Works offline after the first visit. No secrets, no tokens, no account server to operate.', PAGE_W - 2 * MARGIN_X - 36)
  doc.text(dp, MARGIN_X + 18, y + 42)

  pageFooter(doc)
}

// ----- Page 6: Roadmap -----
{
  let y = startPage('Roadmap')
  y = h1(doc, 'Where VolunTrack is headed.', y)
  y = lead(doc,
    'From core launch to certificates, premium tools, and paying school partners — the roadmap is already in motion.',
    y, { size: 11, color: COLOR.muted })
  y += 14

  const phases = [
    {
      tag: 'PHASE 1',
      title: 'Now',
      status: 'SHIPPED',
      items: ['Finish VolunTrack', 'Deploy to GitHub Pages', 'Get first users'],
      color: COLOR.brand,
    },
    {
      tag: 'PHASE 2',
      title: 'Next',
      status: 'SHIPPED',
      items: ['Printable certificates', 'Premium feature hooks', 'Email-based PIN & password reset'],
      color: COLOR.warn,
    },
    {
      tag: 'PHASE 3',
      title: 'Later',
      status: 'ON TRACK',
      items: ['School & organization plans', 'Verified supervisor flow', 'Bulk CSV import'],
      color: COLOR.accent,
    },
  ]
  const colW = (PAGE_W - 2 * MARGIN_X - 2 * 18) / 3
  const cardH = 380
  phases.forEach((p, i) => {
    const x = MARGIN_X + i * (colW + 18)
    card(doc, x, y, colW, cardH)

    setFill(doc, p.color)
    doc.rect(x + 0.5, y + 0.5, colW - 1, 6, 'F')

    setText(doc, p.color)
    doc.setFont(FONT_S.sans, 'bold')
    doc.setFontSize(9)
    doc.text(p.tag, x + 18, y + 32)

    setText(doc, COLOR.ink)
    doc.setFont(FONT_S.sans, 'bold')
    doc.setFontSize(22)
    doc.text(p.title, x + 18, y + 64)

    // status pill
    setFill(doc, p.color)
    doc.roundedRect(x + 18, y + 80, 86, 18, 9, 9, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont(FONT_S.sans, 'bold')
    doc.setFontSize(9)
    doc.text(p.status, x + 61, y + 92, { align: 'center' })

    // items
    let iy = y + 130
    p.items.forEach((it) => {
      setFill(doc, p.color)
      doc.circle(x + 28, iy + 4, 5, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont(FONT_S.sans, 'bold')
      doc.setFontSize(7)
      doc.text('v', x + 28, iy + 6, { align: 'center' })

      setText(doc, COLOR.ink)
      doc.setFont(FONT_S.sans, 'normal')
      doc.setFontSize(11)
      const lines = doc.splitTextToSize(it, colW - 50)
      doc.text(lines, x + 42, iy + 8)
      iy += Math.max(20, lines.length * 14 + 4)
    })
  })

  y += cardH + 26
  y = paragraph(doc,
    'Each phase builds on the previous one. Phase 3 features depend on the verified supervisor flow and the org-wide plan model — both of which are scoped but not started.',
    y, { size: 10, color: COLOR.muted, style: 'italic' })

  pageFooter(doc)
}

// ----- Page 7: Recent releases -----
{
  let y = startPage('Releases')
  y = h1(doc, 'What\'s new in the repo.', y)
  y = lead(doc,
    'A quick look at the most recent shipped work — straight from the commit log.',
    y, { size: 11, color: COLOR.muted })
  y += 14

  const items = [
    { hash: '44953da', title: 'Add email reset for PIN recovery',         date: 'Latest',  color: COLOR.brand },
    { hash: 'b079c7d', title: 'Bump CI to Node 24 (was Node 20)',         date: 'Recent',  color: COLOR.accent },
    { hash: '7b25e64', title: 'Split CI into 3 jobs: lint, build, preview', date: 'Recent',  color: COLOR.accent },
    { hash: 'f291f15', title: 'Add CI workflow',                           date: 'Earlier', color: COLOR.warn },
    { hash: '9954309', title: 'Initial commit: VolunteerTrack',            date: 'v0.1.0',  color: COLOR.muted },
  ]
  items.forEach((it, i) => {
    setFill(doc, it.color)
    doc.circle(MARGIN_X + 6, y + 8, 4, 'F')

    setFill(doc, COLOR.panel)
    setDraw(doc, COLOR.rule)
    doc.roundedRect(MARGIN_X + 22, y - 2, 100, 22, 4, 4, 'FD')
    setText(doc, it.color)
    doc.setFont('courier', 'bold')
    doc.setFontSize(10)
    doc.text(it.hash, MARGIN_X + 72, y + 12, { align: 'center' })

    setText(doc, COLOR.ink)
    doc.setFont(FONT_S.sans, 'normal')
    doc.setFontSize(12)
    doc.text(it.title, MARGIN_X + 136, y + 12)

    // date tag
    const tagW = 78
    setFill(doc, it.color)
    doc.roundedRect(PAGE_W - MARGIN_X - tagW, y - 2, tagW, 22, 11, 11, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont(FONT_S.sans, 'bold')
    doc.setFontSize(9)
    doc.text(it.date.toUpperCase(), PAGE_W - MARGIN_X - tagW / 2, y + 12, { align: 'center' })

    // separator
    setDraw(doc, COLOR.rule)
    doc.setLineWidth(0.4)
    doc.line(MARGIN_X, y + 34, PAGE_W - MARGIN_X, y + 34)
    y += 50
  })

  y += 10
  y = paragraph(doc,
    'CI is now Node 24, runs lint + build + preview as separate jobs, and pushes the production build straight to GitHub Pages on every green run.',
    y, { size: 10, color: COLOR.muted, style: 'italic' })

  pageFooter(doc)
}

// ----- Page 8: Audience + CTA -----
{
  let y = startPage('Next')
  y = h1(doc, 'Try it, fork it, ship it with your students.', y)
  y = lead(doc,
    'VolunTrack is free, open, and already running. Three ways to take the next step.',
    y, { size: 11, color: COLOR.muted })
  y += 18

  const ctas = [
    {
      tag: 'TRY',
      title: 'Use the live demo',
      body: 'Sign in with any email + password. Data stays on your device. The AI agent drafts a log entry from a single sentence.',
      link: 'hriday21223.github.io/VolunteerTrack',
      color: COLOR.brand,
    },
    {
      tag: 'BUILD',
      title: 'Fork the repo',
      body: 'Clone, npm install, npm run dev. PRs welcome. The whole stack is documented in the README.',
      link: 'github.com/Hriday21223/VolunteerTrack',
      color: COLOR.accent,
    },
    {
      tag: 'PARTNER',
      title: 'Bring it to your school',
      body: 'Phase 3: verified supervisor flow and org-wide plans. Open an issue to start the conversation.',
      link: 'github.com/Hriday21223/VolunteerTrack/issues',
      color: COLOR.warn,
    },
  ]
  const colW = (PAGE_W - 2 * MARGIN_X - 2 * 18) / 3
  const cardH = 230
  ctas.forEach((c, i) => {
    const x = MARGIN_X + i * (colW + 18)
    card(doc, x, y, colW, cardH, { border: c.color })
    setFill(doc, c.color)
    doc.roundedRect(x + 18, y + 18, 56, 18, 9, 9, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont(FONT_S.sans, 'bold')
    doc.setFontSize(9)
    doc.text(c.tag, x + 46, y + 30, { align: 'center' })

    setText(doc, COLOR.ink)
    doc.setFont(FONT_S.sans, 'bold')
    doc.setFontSize(16)
    const ttl = doc.splitTextToSize(c.title, colW - 36)
    doc.text(ttl, x + 18, y + 70)

    setText(doc, COLOR.body)
    doc.setFont(FONT_S.sans, 'normal')
    doc.setFontSize(10)
    const lines = doc.splitTextToSize(c.body, colW - 36)
    doc.text(lines, x + 18, y + 70 + ttl.length * 18 + 8)

    setDraw(doc, COLOR.rule)
    doc.setLineWidth(0.4)
    doc.line(x + 18, y + cardH - 30, x + colW - 18, y + cardH - 30)
    setText(doc, c.color)
    doc.setFont('courier', 'bold')
    doc.setFontSize(9)
    doc.text(c.link, x + 18, y + cardH - 14)
  })

  y += cardH + 30
  card(doc, MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 60, { fill: [241, 248, 241], border: COLOR.brand })
  doc.setFont(FONT_S.sans, 'bold')
  doc.setFontSize(11)
  setText(doc, COLOR.brandDk)
  doc.text('One sentence is all it takes', MARGIN_X + 18, y + 24)
  doc.setFont(FONT_S.sans, 'normal')
  doc.setFontSize(10)
  setText(doc, COLOR.body)
  doc.text('"Helped at the food bank for 3 hours on Saturday" — the on-device agent drafts the full log entry, and you confirm.', MARGIN_X + 18, y + 44)

  pageFooter(doc)
}

// ----- save -----
const outPath = path.resolve('outputs/voluntrack-overview.pdf')
const buf = Buffer.from(doc.output('arraybuffer'))
await fs.writeFile(outPath, buf)
const stat = await fs.stat(outPath)
console.log(`wrote ${outPath} (${stat.size} bytes, ${pageNum} pages)`)
