// VolunTrack pitch deck — built with @oai/artifact-tool (no React, no JSX).
import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const SIZE = { width: 1280, height: 720 };
const OUT_DIR = "/Users/hridaykarnatam/VolunteerTrack/output/deck/v2";
const PREVIEW_DIR = path.join(OUT_DIR, "previews");
const ASSET_DIR = path.join(OUT_DIR, "assets");

const C = {
  brand50:  "#f1f8f1", brand100: "#dcecdc", brand200: "#bcdabc", brand300: "#8fbf90",
  brand400: "#5fa062", brand500: "#3f8344", brand600: "#2f6935", brand700: "#27542d",
  brand800: "#214327", brand900: "#1c3720",
  earth50:  "#faf7f2", earth100: "#f1ead9", earth200: "#e2d4b3", earth300: "#cdb585",
  earth400: "#b8955d", earth500: "#a07c44", earth700: "#6c502d", earth900: "#4a3722",
  ink:      "#102016", body: "#384a3f", muted: "#6b7a70", white: "#ffffff",
  amber500: "#f59e0b", amber100: "#fef3c7",
  rose500:  "#e11d48", rose100:  "#ffe4e6",
  sky500:   "#0ea5e9", sky100:   "#e0f2fe",
  emerald500: "#10b981", emerald100: "#d1fae5",
};

const T = {
  body:       { fontFamily: "Inter", fontSize: 16, color: C.body, lineHeight: 1.45 },
  bodyLg:     { fontFamily: "Inter", fontSize: 18, color: C.body, lineHeight: 1.55 },
  muted:      { fontFamily: "Inter", fontSize: 14, color: C.muted, lineHeight: 1.5 },
  small:      { fontFamily: "Inter", fontSize: 12, color: C.muted, lineHeight: 1.4 },
  h1:         { fontFamily: "Plus Jakarta Sans", fontSize: 52, color: C.ink, bold: true, lineHeight: 1.05 },
  h2:         { fontFamily: "Plus Jakarta Sans", fontSize: 36, color: C.ink, bold: true, lineHeight: 1.12 },
  h3:         { fontFamily: "Plus Jakarta Sans", fontSize: 22, color: C.ink, bold: true, lineHeight: 1.2 },
  eyebrow:    { fontFamily: "Inter", fontSize: 12, color: C.brand600, bold: true, characterSpacing: 4 },
  chip:       { fontFamily: "Inter", fontSize: 12, color: C.brand700, bold: true },
  metric:     { fontFamily: "Plus Jakarta Sans", fontSize: 44, color: C.brand600, bold: true, lineHeight: 1 },
  cta:        { fontFamily: "Inter", fontSize: 16, color: C.white, bold: true },
};

function txt(slide, text, pos, style) {
  const tb = slide.shapes.add({
    geometry: "textbox",
    position: pos,
    fill: { color: "transparent" },
    line: { style: "none" },
  });
  tb.text = text;
  if (style) tb.text.style = { ...style };
  return tb;
}

function rect(slide, pos, fill, opts = {}) {
  return slide.shapes.add({
    geometry: "roundRect",
    position: pos,
    fill: { color: fill },
    line: opts.border ? { style: "solid", color: opts.border, width: 1 } : { style: "none" },
    borderRadius: opts.radius ?? 16,
    shadow: opts.shadow,
  });
}

function line(slide, x1, y1, x2, y2, color = C.earth100, width = 1) {
  return slide.shapes.add({
    geometry: "line",
    position: { left: x1, top: y1, width: x2 - x1, height: y2 - y1 },
    fill: { color: "transparent" },
    line: { style: "solid", color, width },
  });
}

async function loadLogo() {
  const buf = await fs.readFile("/Users/hridaykarnatam/VolunteerTrack/dist/logo.png");
  return new Uint8Array(buf);
}

const presentation = Presentation.create({ slideSize: SIZE });
const logo = await loadLogo();

// ============= SLIDE 1 — Cover =============
{
  const s = presentation.slides.add();
  s.background.fill = C.earth50;
  s.shapes.add({ geometry: "rect", position: { left: 720, top: 0, width: 560, height: 720 }, fill: { color: C.brand700 }, line: { style: "none" } });
  for (let i = 0; i < 6; i++) {
    s.shapes.add({
      geometry: "ellipse",
      position: { left: 760 + i * 14, top: 60 + i * 14, width: 360, height: 360 },
      fill: { color: "transparent" },
      line: { style: "solid", color: C.brand500, width: 1 },
    });
  }
  s.images.add({ blob: logo, contentType: "image/png", alt: "VolunTrack logo", position: { left: 80, top: 80, width: 80, height: 80 } });
  txt(s, "VOLUNTRACK", { left: 80, top: 170, width: 560, height: 30 }, T.eyebrow);
  txt(s, "The volunteer hour\ntracker students\nactually keep open.", { left: 80, top: 210, width: 600, height: 240 }, { ...T.h1, fontSize: 56 });
  txt(s, "A privacy-first PWA for logging service hours, hitting goals, and exporting\nreports that survive a college application. Built for students, schools, and clubs.", { left: 80, top: 470, width: 600, height: 70 }, { ...T.bodyLg, color: C.earth700 });

  const chipLabels = ["React 18 + Vite", "PWA, offline-first", "localStorage private", "MIT licensed"];
  let cx = 80;
  for (const label of chipLabels) {
    const w = 16 + label.length * 7.6;
    rect(s, { left: cx, top: 560, width: w, height: 32 }, C.brand100, { radius: 16 });
    txt(s, label, { left: cx, top: 560, width: w, height: 32 }, { ...T.chip, align: "center", verticalAlign: "middle" });
    cx += w + 10;
  }
  txt(s, "LIVE", { left: 760, top: 100, width: 200, height: 24 }, { ...T.eyebrow, color: C.brand300 });
  txt(s, "hriday21223.github.io\n/VolunteerTrack", { left: 760, top: 130, width: 460, height: 100 }, { ...T.h3, color: C.white, fontSize: 28, lineHeight: 1.2 });
  const stats = [
    { value: "12", label: "auto-earning\nbadges" },
    { value: "PWA", label: "installs on\nany device" },
    { value: "0", label: "account server\nneeded" },
  ];
  let sy = 290;
  for (const st of stats) {
    rect(s, { left: 760, top: sy, width: 460, height: 90 }, C.brand600, { radius: 14 });
    txt(s, st.value, { left: 780, top: sy + 12, width: 120, height: 60 }, { ...T.metric, color: C.white, fontSize: 44 });
    txt(s, st.label, { left: 910, top: sy + 18, width: 290, height: 60 }, { ...T.body, color: C.brand100 });
    sy += 105;
  }
  txt(s, "Showcase + pitch · v2.0", { left: 80, top: 670, width: 600, height: 20 }, T.small);
}

// ============= SLIDE 2 — What it is =============
{
  const s = presentation.slides.add();
  s.background.fill = C.white;
  txt(s, "WHAT IT IS", { left: 80, top: 64, width: 400, height: 24 }, T.eyebrow);
  txt(s, "A real product, not a mockup.", { left: 80, top: 96, width: 1120, height: 60 }, T.h2);
  txt(s, "VolunTrack is already live, already deployed, and already in use. It runs as an installable PWA, ships with a school/admin layer, and exports PDF reports a counselor will actually accept.", { left: 80, top: 168, width: 1120, height: 50 }, T.bodyLg);
  const stats = [
    { metric: "5 user roles", desc: "Student, supervisor, school admin, district admin, and platform admin. Each gets the right surface — nothing more.", tint: C.brand100, accent: C.brand600 },
    { metric: "12 badges", desc: "Auto-earning achievements turn consistency into something students can see, share, and feel good about.", tint: C.amber100, accent: C.amber500 },
    { metric: "PWA install", desc: "Installs on iOS, Android, Windows, macOS, and Linux. Works offline after the first visit. No app store gate.", tint: C.sky100, accent: C.sky500 },
  ];
  let x = 80;
  for (const st of stats) {
    rect(s, { left: x, top: 270, width: 360, height: 240 }, st.tint, { radius: 20 });
    rect(s, { left: x, top: 270, width: 6, height: 240 }, st.accent, { radius: 3 });
    txt(s, st.metric, { left: x + 24, top: 296, width: 320, height: 60 }, { ...T.h3, fontSize: 28 });
    txt(s, st.desc, { left: x + 24, top: 366, width: 320, height: 130 }, T.body);
    x += 380;
  }
  rect(s, { left: 80, top: 555, width: 1120, height: 90 }, C.earth50, { radius: 16, border: C.earth200 });
  txt(s, "THE POINT", { left: 100, top: 572, width: 200, height: 20 }, { ...T.eyebrow, color: C.earth700 });
  txt(s, "Take the friction out of proving you showed up — and the data lives on the student's own device, not in someone else's system.", { left: 100, top: 596, width: 1080, height: 40 }, { ...T.body, fontSize: 17, color: C.ink });
  txt(s, "voluntrack.app", { left: 80, top: 670, width: 400, height: 20 }, T.small);
  txt(s, "Slide 2", { left: 1180, top: 670, width: 80, height: 20, align: "right" }, T.small);
}

// ============= SLIDE 3 — Workflow =============
{
  const s = presentation.slides.add();
  s.background.fill = C.earth50;
  txt(s, "THE WORKFLOW", { left: 80, top: 64, width: 400, height: 24 }, T.eyebrow);
  txt(s, "Five minutes from service hour to verified record.", { left: 80, top: 96, width: 1120, height: 60 }, T.h2);
  const steps = [
    { num: "1", title: "Log it", body: "Activity, hours, supervisor, notes — and a photo of proof — in one form." },
    { num: "2", title: "Track it", body: "Progress ring, weekly chart, and 12 badges keep momentum visible." },
    { num: "3", title: "Prove it", body: "PDF report, CSV export, or a printable certificate in one click." },
    { num: "4", title: "Verify it", body: "Optional school dashboard with PIN join, rosters, and PDF review." },
    { num: "5", title: "Own it", body: "Data stays in the student's browser. No account server, no data harvesting." },
  ];
  const stepW = 200, gap = 22;
  const totalW = steps.length * stepW + (steps.length - 1) * gap;
  const startX = (1280 - totalW) / 2;
  steps.forEach((step, i) => {
    const x = startX + i * (stepW + gap), y = 230;
    rect(s, { left: x, top: y, width: stepW, height: 320 }, C.white, { radius: 18, shadow: "shadow-sm" });
    rect(s, { left: x + 24, top: y + 24, width: 56, height: 56 }, C.brand500, { radius: 28 });
    txt(s, step.num, { left: x + 24, top: y + 24, width: 56, height: 56 }, { ...T.metric, color: C.white, fontSize: 28, align: "center", verticalAlign: "middle" });
    txt(s, step.title, { left: x + 24, top: y + 100, width: stepW - 48, height: 40 }, T.h3);
    txt(s, step.body, { left: x + 24, top: y + 148, width: stepW - 48, height: 150 }, { ...T.body, fontSize: 14 });
    if (i < steps.length - 1) {
      s.shapes.add({ geometry: "rightArrow", position: { left: x + stepW + 4, top: y + 38, width: 14, height: 14 }, fill: { color: C.brand300 }, line: { style: "none" } });
    }
  });
  txt(s, "Every step fits on one screen. Every record stays portable. That's the whole product.", { left: 80, top: 600, width: 1120, height: 30 }, { ...T.body, color: C.muted, italic: true, align: "center" });
  txt(s, "voluntrack.app", { left: 80, top: 670, width: 400, height: 20 }, T.small);
  txt(s, "Slide 3", { left: 1180, top: 670, width: 80, height: 20, align: "right" }, T.small);
}

// ============= SLIDE 4 — Product surface =============
{
  const s = presentation.slides.add();
  s.background.fill = C.white;
  txt(s, "THE PRODUCT", { left: 80, top: 64, width: 400, height: 24 }, T.eyebrow);
  txt(s, "Calm UI, dense info, no clutter.", { left: 80, top: 96, width: 1120, height: 60 }, T.h2);

  const dashX = 80, dashY = 200, dashW = 720, dashH = 420;
  rect(s, { left: dashX, top: dashY, width: dashW, height: dashH }, C.earth50, { radius: 18, border: C.earth200 });
  rect(s, { left: dashX, top: dashY, width: dashW, height: 44 }, C.brand700, { radius: 18 });
  rect(s, { left: dashX, top: dashY + 26, width: dashW, height: 18 }, C.brand700);
  txt(s, "voluntrack", { left: dashX + 18, top: dashY + 12, width: 200, height: 22 }, { ...T.body, color: C.white, bold: true });
  txt(s, "Dashboard", { left: dashX + 220, top: dashY + 12, width: 200, height: 22 }, { ...T.body, color: C.brand200 });
  txt(s, "Alex · Senior · Lincoln High", { left: dashX + 440, top: dashY + 14, width: 260, height: 20, align: "right" }, { ...T.small, color: C.brand200 });

  rect(s, { left: dashX + 24, top: dashY + 70, width: 220, height: 200 }, C.white, { radius: 14 });
  txt(s, "TOTAL HOURS", { left: dashX + 40, top: dashY + 90, width: 180, height: 18 }, { ...T.eyebrow, fontSize: 10, color: C.muted });
  txt(s, "62.5", { left: dashX + 40, top: dashY + 116, width: 180, height: 60 }, { ...T.metric, fontSize: 56 });
  txt(s, "of 100 hour goal", { left: dashX + 40, top: dashY + 178, width: 180, height: 20 }, T.muted);
  rect(s, { left: dashX + 40, top: dashY + 210, width: 180, height: 10 }, C.earth100, { radius: 5 });
  rect(s, { left: dashX + 40, top: dashY + 210, width: 112, height: 10 }, C.brand500, { radius: 5 });

  rect(s, { left: dashX + 260, top: dashY + 70, width: 200, height: 95 }, C.white, { radius: 14 });
  txt(s, "THIS MONTH", { left: dashX + 276, top: dashY + 84, width: 160, height: 16 }, { ...T.eyebrow, fontSize: 10, color: C.muted });
  txt(s, "12.5", { left: dashX + 276, top: dashY + 102, width: 160, height: 44 }, { ...T.metric, fontSize: 32 });
  txt(s, "+3.5 vs last month", { left: dashX + 276, top: dashY + 144, width: 160, height: 18 }, { ...T.small, color: C.emerald500 });

  rect(s, { left: dashX + 476, top: dashY + 70, width: 220, height: 95 }, C.white, { radius: 14 });
  txt(s, "BADGES EARNED", { left: dashX + 492, top: dashY + 84, width: 180, height: 16 }, { ...T.eyebrow, fontSize: 10, color: C.muted });
  txt(s, "7 / 12", { left: dashX + 492, top: dashY + 102, width: 180, height: 44 }, { ...T.metric, fontSize: 32 });
  for (let i = 0; i < 12; i++) {
    rect(s, { left: dashX + 492 + i * 16, top: dashY + 152, width: 10, height: 10 }, i < 7 ? C.amber500 : C.earth200, { radius: 5 });
  }

  rect(s, { left: dashX + 260, top: dashY + 180, width: 436, height: 90 }, C.white, { radius: 14 });
  txt(s, "RECENT", { left: dashX + 276, top: dashY + 192, width: 400, height: 16 }, { ...T.eyebrow, fontSize: 10, color: C.muted });
  txt(s, "Food bank — 3.0h · Sat", { left: dashX + 276, top: dashY + 212, width: 400, height: 18 }, { ...T.body, fontSize: 13 });
  txt(s, "Park cleanup — 2.5h · Sun", { left: dashX + 276, top: dashY + 232, width: 400, height: 18 }, { ...T.body, fontSize: 13 });
  txt(s, "Tutoring — 1.5h · Wed", { left: dashX + 276, top: dashY + 252, width: 400, height: 18 }, { ...T.body, fontSize: 13 });

  rect(s, { left: dashX + 24, top: dashY + 285, width: 672, height: 110 }, C.white, { radius: 14 });
  txt(s, "THIS WEEK", { left: dashX + 40, top: dashY + 298, width: 200, height: 16 }, { ...T.eyebrow, fontSize: 10, color: C.muted });
  const bars = [40, 70, 30, 90, 55, 20, 60];
  bars.forEach((h, i) => {
    rect(s, { left: dashX + 50 + i * 90, top: dashY + 370 - h, width: 50, height: h }, C.brand400, { radius: 4 });
  });
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
  dayLabels.forEach((d, i) => {
    txt(s, d, { left: dashX + 50 + i * 90, top: dashY + 378, width: 50, height: 14, align: "center" }, { ...T.small, color: C.muted, fontSize: 11 });
  });

  const features = [
    { tag: "ONE SENTENCE", title: "AI hour logger", body: "Type a sentence — the on-device agent drafts a full log entry. Confirm and you're done." },
    { tag: "PROGRESS", title: "Streaks + rings", body: "Daily streak, weekly chart, and a progress ring toward the primary goal." },
    { tag: "PORTABLE", title: "PDF + CSV export", body: "Counselor-ready service log and a printable certificate. No locked-in formats." },
  ];
  let fy = 200;
  for (const f of features) {
    rect(s, { left: 830, top: fy, width: 370, height: 130 }, C.earth50, { radius: 14, border: C.earth200 });
    txt(s, f.tag, { left: 850, top: fy + 16, width: 200, height: 16 }, { ...T.eyebrow, fontSize: 10, color: C.brand600 });
    txt(s, f.title, { left: 850, top: fy + 36, width: 330, height: 28 }, { ...T.h3, fontSize: 18 });
    txt(s, f.body, { left: 850, top: fy + 70, width: 330, height: 52 }, { ...T.body, fontSize: 13 });
    fy += 142;
  }
  txt(s, "voluntrack.app", { left: 80, top: 670, width: 400, height: 20 }, T.small);
  txt(s, "Slide 4", { left: 1180, top: 670, width: 80, height: 20, align: "right" }, T.small);
}

// ============= SLIDE 5 — Audience =============
{
  const s = presentation.slides.add();
  s.background.fill = C.brand900;
  txt(s, "AUDIENCE", { left: 80, top: 64, width: 400, height: 24 }, { ...T.eyebrow, color: C.brand300 });
  txt(s, "One product, three real buyers.", { left: 80, top: 96, width: 1120, height: 60 }, { ...T.h2, color: C.white });
  const personas = [
    { tag: "STUDENTS", title: "Log it once, prove it forever.", bullets: ["One-tap logging with photo proof", "12 badges that turn consistency into something visible", "PDF report that survives a college application"], accent: C.brand400 },
    { tag: "SCHOOLS", title: "Stop chasing spreadsheets.", bullets: ["School PIN join — no manual roster uploads", "Verified supervisor flow with PDF review", "Bulk CSV import + export for counseling"], accent: C.amber500 },
    { tag: "DISTRICTS", title: "One rollout, every student.", bullets: ["Multi-school admin dashboard", "Payment + subscription tracking already built", "An AI agent that monitors system health 24/7"], accent: C.sky500 },
  ];
  let x = 80;
  for (const p of personas) {
    rect(s, { left: x, top: 210, width: 360, height: 410 }, C.brand800, { radius: 20, border: p.accent });
    rect(s, { left: x, top: 210, width: 360, height: 6 }, p.accent, { radius: 3 });
    txt(s, p.tag, { left: x + 24, top: 240, width: 320, height: 18 }, { ...T.eyebrow, color: p.accent });
    txt(s, p.title, { left: x + 24, top: 270, width: 320, height: 80 }, { ...T.h3, color: C.white, fontSize: 22 });
    let by = 360;
    for (const b of p.bullets) {
      rect(s, { left: x + 24, top: by + 8, width: 8, height: 8 }, p.accent, { radius: 4 });
      txt(s, b, { left: x + 44, top: by, width: 296, height: 40 }, { ...T.body, color: C.brand100, fontSize: 14, lineHeight: 1.4 });
      by += 50;
    }
    x += 380;
  }
  txt(s, "voluntrack.app", { left: 80, top: 670, width: 400, height: 20 }, { ...T.small, color: C.brand300 });
  txt(s, "Slide 5", { left: 1180, top: 670, width: 80, height: 20, align: "right" }, { ...T.small, color: C.brand300 });
}

// ============= SLIDE 6 — Trust / Privacy =============
{
  const s = presentation.slides.add();
  s.background.fill = C.white;
  txt(s, "WHY IT'S SAFE", { left: 80, top: 64, width: 400, height: 24 }, T.eyebrow);
  txt(s, "Privacy isn't a feature. It's the foundation.", { left: 80, top: 96, width: 1120, height: 60 }, T.h2);
  txt(s, "Counselors and parents ask the same question first. Here's the honest answer.", { left: 80, top: 168, width: 1120, height: 30 }, T.bodyLg);
  const guarantees = [
    { title: "Local-first by default", body: "Volunteer logs live in the student's browser (localStorage). No cloud, no account, no server talking to volunteer data.", tint: C.brand100, mark: C.brand500 },
    { title: "No tracking, no telemetry", body: "The only analytics are Vercel pageviews and speed metrics. There is no event tracking on hours, names, schools, or activity.", tint: C.amber100, mark: C.amber500 },
    { title: "School data is opt-in", body: "When a school signs up, only then does the server see anything — and only what the student explicitly submits.", tint: C.sky100, mark: C.sky500 },
    { title: "JWT + bcrypt, rate-limited", body: "Server-side auth uses bcrypt password hashing, JWT tokens, parameterized queries, and request rate limiting. See SECURITY.md.", tint: C.rose100, mark: C.rose500 },
    { title: "Open source, MIT", body: "Every line is on GitHub. Schools can self-host, audit, and extend without vendor lock-in.", tint: C.emerald100, mark: C.emerald500 },
    { title: "Recovery without lockout", body: "Forgot your PIN or password? A 6-digit recovery code is emailed — works for both new and returning students.", tint: C.brand100, mark: C.brand500 },
  ];
  const cols = 3, rows = 2;
  const cellW = 360, cellH = 200, gap = 20;
  const startX = (1280 - (cols * cellW + (cols - 1) * gap)) / 2;
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const g = guarantees[idx++];
      const x = startX + c * (cellW + gap);
      const y = 230 + r * (cellH + gap);
      rect(s, { left: x, top: y, width: cellW, height: cellH }, g.tint, { radius: 16 });
      rect(s, { left: x + 24, top: y + 24, width: 40, height: 40 }, g.mark, { radius: 20 });
      txt(s, "✓", { left: x + 24, top: y + 24, width: 40, height: 40 }, { ...T.metric, color: C.white, fontSize: 22, align: "center", verticalAlign: "middle" });
      txt(s, g.title, { left: x + 24, top: y + 80, width: cellW - 48, height: 28 }, { ...T.h3, fontSize: 18 });
      txt(s, g.body, { left: x + 24, top: y + 116, width: cellW - 48, height: 76 }, { ...T.body, fontSize: 13 });
    }
  }
  txt(s, "voluntrack.app", { left: 80, top: 670, width: 400, height: 20 }, T.small);
  txt(s, "Slide 6", { left: 1180, top: 670, width: 80, height: 20, align: "right" }, T.small);
}

// ============= SLIDE 7 — Stack =============
{
  const s = presentation.slides.add();
  s.background.fill = C.earth50;
  txt(s, "THE STACK", { left: 80, top: 64, width: 400, height: 24 }, T.eyebrow);
  txt(s, "Modern, boring, and ready to extend.", { left: 80, top: 96, width: 1120, height: 60 }, T.h2);
  txt(s, "Everything is documented in the repo, runs on free tiers, and survives being handed to a junior dev.", { left: 80, top: 168, width: 1120, height: 30 }, T.bodyLg);
  const layers = [
    { name: "Frontend", stack: "React 18 · Vite 5 · React Router 6 · Tailwind CSS 3", note: "PWA via vite-plugin-pwa. No Webpack, no Next.js, no lock-in." },
    { name: "State", stack: "localStorage namespaces · React Context · custom hooks", note: "Data lives under the voluntrack: namespace — fully exportable, fully portable." },
    { name: "Backend", stack: "Express 4 · PostgreSQL (Neon) · JWT + bcrypt", note: "Optional. The full app works without it. School features turn it on." },
    { name: "Exports", stack: "jsPDF · jspdf-autotable · CSV stringifier", note: "Counselor-ready PDF logs, CSV exports, and printable certificates." },
    { name: "AI helper", stack: "On-device agent for log drafting + system monitoring", note: "Drafts entries from a single sentence. Detects + auto-fixes production incidents." },
    { name: "Delivery", stack: "GitHub Actions · GitHub Pages · Render · Vercel Analytics", note: "CI runs lint + build + preview as three jobs. Green commits auto-deploy." },
  ];
  let y = 220;
  for (const l of layers) {
    rect(s, { left: 80, top: y, width: 1120, height: 70 }, C.white, { radius: 12, border: C.earth200 });
    rect(s, { left: 80, top: y, width: 6, height: 70 }, C.brand500, { radius: 3 });
    txt(s, l.name.toUpperCase(), { left: 100, top: y + 12, width: 200, height: 18 }, { ...T.eyebrow, fontSize: 10, color: C.brand600 });
    txt(s, l.stack, { left: 100, top: y + 32, width: 600, height: 26 }, { ...T.body, fontSize: 15, bold: true });
    txt(s, l.note, { left: 720, top: y + 22, width: 460, height: 36 }, { ...T.body, fontSize: 13, color: C.muted });
    y += 80;
  }
  txt(s, "voluntrack.app", { left: 80, top: 670, width: 400, height: 20 }, T.small);
  txt(s, "Slide 7", { left: 1180, top: 670, width: 80, height: 20, align: "right" }, T.small);
}

// ============= SLIDE 8 — Traction =============
{
  const s = presentation.slides.add();
  s.background.fill = C.white;
  txt(s, "WHAT'S SHIPPED", { left: 80, top: 64, width: 400, height: 24 }, T.eyebrow);
  txt(s, "Phases 1 through 3 are live. Phase 4 is on deck.", { left: 80, top: 96, width: 1120, height: 60 }, T.h2);
  const metrics = [
    { value: "11", label: "Pages live in the SPA", sub: "Dashboard, log, calendar, achievements, reports, profile, settings, about, contact, status, admin." },
    { value: "12", label: "Auto-earning badges", sub: "First Hour, Streak, 10/50/100 Hours, Category Master, Community Hero, etc." },
    { value: "100%", label: "Client-side privacy", sub: "All volunteer data in the browser under the voluntrack: namespace." },
    { value: "0", label: "Account server needed", sub: "The core app is fully usable without ever talking to a server." },
  ];
  let x = 80;
  for (const m of metrics) {
    rect(s, { left: x, top: 200, width: 270, height: 200 }, C.earth50, { radius: 16, border: C.earth200 });
    txt(s, m.value, { left: x + 24, top: 220, width: 220, height: 70 }, { ...T.metric, fontSize: 56 });
    txt(s, m.label, { left: x + 24, top: 290, width: 220, height: 20 }, { ...T.body, bold: true });
    txt(s, m.sub, { left: x + 24, top: 312, width: 220, height: 80 }, { ...T.small, color: C.muted, fontSize: 12 });
    x += 285;
  }
  txt(s, "RECENT RELEASES", { left: 80, top: 440, width: 400, height: 24 }, { ...T.eyebrow, color: C.muted });
  const releases = [
    { hash: "latest", title: "Email reset for PIN recovery", date: "Jul 2025" },
    { hash: "ci", title: "CI: 3 jobs (lint · build · preview) on Node 24", date: "Jun 2025" },
    { hash: "v0.1", title: "Initial VolunteerTrack release", date: "Apr 2025" },
  ];
  let ry = 480;
  releases.forEach((r) => {
    rect(s, { left: 80, top: ry + 8, width: 10, height: 10 }, C.brand500, { radius: 5 });
    txt(s, r.title, { left: 110, top: ry, width: 700, height: 24 }, { ...T.body, bold: true, fontSize: 15 });
    rect(s, { left: 870, top: ry - 2, width: 200, height: 24 }, C.brand100, { radius: 12 });
    txt(s, r.date, { left: 870, top: ry - 2, width: 200, height: 24, align: "center", verticalAlign: "middle" }, { ...T.small, color: C.brand700, fontSize: 11, bold: true });
    txt(s, r.hash, { left: 1100, top: ry, width: 100, height: 24, align: "right" }, { ...T.small, color: C.muted, fontSize: 11 });
    ry += 50;
  });
  txt(s, "voluntrack.app", { left: 80, top: 670, width: 400, height: 20 }, T.small);
  txt(s, "Slide 8", { left: 1180, top: 670, width: 80, height: 20, align: "right" }, T.small);
}

// ============= SLIDE 9 — Monetization =============
{
  const s = presentation.slides.add();
  s.background.fill = C.earth50;
  txt(s, "HOW IT EARNS", { left: 80, top: 64, width: 400, height: 24 }, T.eyebrow);
  txt(s, "Free for students. Paid for the orgs that need admin.", { left: 80, top: 96, width: 1120, height: 60 }, T.h2);
  const tiers = [
    { name: "STUDENT", price: "Free", period: "forever", body: "Every student gets the full app, every badge, every export, no strings.", features: ["Full hour logging + badges", "PDF, CSV, certificate export", "Offline PWA install", "All 12 auto-earning badges"], accent: C.brand500, headerBg: C.brand600, cta: "Open the app", ctaBg: C.brand600 },
    { name: "SCHOOL", price: "$2", period: "per student / year", body: "Everything in Student, plus the school admin layer. PIN join, rosters, supervisor flow.", features: ["School PIN join (no CSV upload)", "Verified supervisor + PDF review", "Bulk import + roster management", "Counselor-ready reports"], accent: C.amber500, headerBg: C.amber500, cta: "Pilot a school", ctaBg: C.amber500 },
    { name: "DISTRICT", price: "Custom", period: "per district", body: "Multi-school rollout, white-glove onboarding, AI system monitoring, and SLA support.", features: ["Multi-school admin dashboard", "Custom branding + subdomain", "AI agent monitoring + fix log", "Priority support · 24h SLA"], accent: C.sky500, headerBg: C.sky500, cta: "Talk to us", ctaBg: C.sky500 },
  ];
  let x = 80;
  for (const t of tiers) {
    const w = 360, h = 470, y = 200;
    rect(s, { left: x, top: y, width: w, height: h }, C.white, { radius: 18, border: t.accent });
    rect(s, { left: x, top: y, width: w, height: 60 }, t.headerBg, { radius: 18 });
    rect(s, { left: x, top: y + 30, width: w, height: 30 }, t.headerBg);
    txt(s, t.name, { left: x + 24, top: y + 18, width: w - 48, height: 24 }, { ...T.eyebrow, color: C.white });
    txt(s, t.price, { left: x + 24, top: y + 76, width: w - 48, height: 60 }, { ...T.metric, color: C.ink, fontSize: 44 });
    txt(s, t.period, { left: x + 24, top: y + 132, width: w - 48, height: 20 }, { ...T.body, color: C.muted, fontSize: 13 });
    txt(s, t.body, { left: x + 24, top: y + 158, width: w - 48, height: 56 }, { ...T.body, fontSize: 13, lineHeight: 1.4 });
    let fy = y + 230;
    for (const f of t.features) {
      rect(s, { left: x + 24, top: fy + 6, width: 6, height: 6 }, t.accent, { radius: 3 });
      txt(s, f, { left: x + 38, top: fy, width: w - 62, height: 24 }, { ...T.body, fontSize: 13 });
      fy += 28;
    }
    rect(s, { left: x + 24, top: y + h - 50, width: w - 48, height: 32 }, t.ctaBg, { radius: 16 });
    txt(s, t.cta, { left: x + 24, top: y + h - 50, width: w - 48, height: 32, align: "center", verticalAlign: "middle" }, { ...T.cta });
    x += 380;
  }
  txt(s, "voluntrack.app", { left: 80, top: 690, width: 400, height: 20 }, T.small);
  txt(s, "Slide 9", { left: 1180, top: 690, width: 80, height: 20, align: "right" }, T.small);
}

// ============= SLIDE 10 — Roadmap =============
{
  const s = presentation.slides.add();
  s.background.fill = C.white;
  txt(s, "ROADMAP", { left: 80, top: 64, width: 400, height: 24 }, T.eyebrow);
  txt(s, "Phased, scoped, and already underway.", { left: 80, top: 96, width: 1120, height: 60 }, T.h2);
  const phases = [
    { phase: "PHASE 1", title: "Core app", status: "SHIPPED", statusBg: C.brand500, items: ["Hour logging", "Goals + progress", "12 badges", "Reminders + dark mode", "PWA install"] },
    { phase: "PHASE 2", title: "Auth + recovery", status: "SHIPPED", statusBg: C.brand500, items: ["Email + password login", "PIN protection", "Recovery codes", "Account dashboards", "Multi-user isolation"] },
    { phase: "PHASE 3", title: "School partnerships", status: "SHIPPED", statusBg: C.brand500, items: ["School PIN join", "Verified supervisor flow", "Payment + subscription tracking", "Admin dashboard", "AI system monitoring"] },
    { phase: "PHASE 4", title: "Native + integrations", status: "NEXT", statusBg: C.amber500, items: ["Native iOS + Android", "Public REST API", "Zapier + Make webhooks", "Bulk CSV import v2", "Calendar integrations"] },
  ];
  let x = 80;
  for (const p of phases) {
    const w = 270, y = 210;
    rect(s, { left: x, top: y, width: w, height: 420 }, C.earth50, { radius: 16, border: C.earth200 });
    rect(s, { left: x, top: y, width: w, height: 6 }, p.statusBg, { radius: 3 });
    txt(s, p.phase, { left: x + 20, top: y + 22, width: w - 40, height: 18 }, { ...T.eyebrow, fontSize: 10, color: C.muted });
    txt(s, p.title, { left: x + 20, top: y + 46, width: w - 40, height: 60 }, { ...T.h3, fontSize: 20 });
    rect(s, { left: x + 20, top: y + 110, width: 80, height: 24 }, p.statusBg, { radius: 12 });
    txt(s, p.status, { left: x + 20, top: y + 110, width: 80, height: 24, align: "center", verticalAlign: "middle" }, { ...T.small, color: C.white, fontSize: 10, bold: true });
    let iy = y + 160;
    for (const it of p.items) {
      rect(s, { left: x + 20, top: iy + 6, width: 8, height: 8 }, p.statusBg, { radius: 4 });
      txt(s, it, { left: x + 36, top: iy, width: w - 56, height: 30 }, { ...T.body, fontSize: 13 });
      iy += 36;
    }
    x += 285;
  }
  txt(s, "voluntrack.app", { left: 80, top: 670, width: 400, height: 20 }, T.small);
  txt(s, "Slide 10", { left: 1180, top: 670, width: 80, height: 20, align: "right" }, T.small);
}

// ============= SLIDE 11 — Case study =============
{
  const s = presentation.slides.add();
  s.background.fill = C.earth50;
  txt(s, "HOW IT PLAYS OUT", { left: 80, top: 64, width: 400, height: 24 }, T.eyebrow);
  txt(s, "Lincoln High · 1,200 students · one semester.", { left: 80, top: 96, width: 1120, height: 60 }, T.h2);
  rect(s, { left: 80, top: 200, width: 560, height: 420 }, C.white, { radius: 16, border: C.earth200 });
  txt(s, "THE STORY", { left: 100, top: 220, width: 200, height: 20 }, T.eyebrow);
  txt(s, "Maria is a senior at Lincoln High. She needs 100 verified hours to graduate and 75 for her scholarship application.", { left: 100, top: 248, width: 520, height: 60 }, T.bodyLg);
  txt(s, "She joins VolunTrack with the school PIN and gets a private account on her own device.", { left: 100, top: 322, width: 520, height: 60 }, T.body);
  txt(s, "She logs hours at the food bank. The AI agent drafts the entry from a one-sentence description. She confirms.", { left: 100, top: 388, width: 520, height: 60 }, T.body);
  txt(s, "Her supervisor uploads a signed PDF. The school admin verifies it inline. Maria's record updates automatically.", { left: 100, top: 454, width: 520, height: 60 }, T.body);
  txt(s, "Counselor exports her full log for the scholarship committee. Done — 12 minutes, end to end.", { left: 100, top: 520, width: 520, height: 60 }, T.body);

  rect(s, { left: 660, top: 200, width: 560, height: 420 }, C.brand700, { radius: 16 });
  txt(s, "THE OUTCOMES", { left: 680, top: 220, width: 200, height: 20 }, { ...T.eyebrow, color: C.brand300 });
  const outcomes = [
    { value: "12 min", label: "average time to log + verify a single session" },
    { value: "$0", label: "student pays for the app" },
    { value: "100%", label: "of her hours are exportable, portable, and provable" },
    { value: "1 link", label: "instead of a backpack full of paper sign-in sheets" },
  ];
  let oy = 260;
  for (const o of outcomes) {
    txt(s, o.value, { left: 680, top: oy, width: 200, height: 50 }, { ...T.metric, color: C.white, fontSize: 36 });
    txt(s, o.label, { left: 880, top: oy + 8, width: 320, height: 50 }, { ...T.body, color: C.brand100, fontSize: 14 });
    oy += 88;
  }
  txt(s, "voluntrack.app", { left: 80, top: 670, width: 400, height: 20 }, T.small);
  txt(s, "Slide 11", { left: 1180, top: 670, width: 80, height: 20, align: "right" }, T.small);
}

// ============= SLIDE 12 — Services =============
{
  const s = presentation.slides.add();
  s.background.fill = C.brand900;
  txt(s, "HIRE ME", { left: 80, top: 64, width: 400, height: 24 }, { ...T.eyebrow, color: C.brand300 });
  txt(s, "I built VolunTrack. I can build yours too.", { left: 80, top: 96, width: 1120, height: 60 }, { ...T.h2, color: C.white });
  txt(s, "Same stack, same discipline, applied to your product, your school, or your internal tool.", { left: 80, top: 168, width: 1120, height: 30 }, { ...T.bodyLg, color: C.brand200 });
  const services = [
    { tag: "BUILD", title: "Custom product", price: "$8k – $25k", body: "A full React + Vite + Tailwind PWA, deployed to your domain, branded to you. 3–6 weeks.", tint: C.brand700, accent: C.brand400 },
    { tag: "EXTEND", title: "Add a feature", price: "$500 – $4k", body: "Auth, payments, dashboards, AI helpers, export pipelines, integrations. Scoped per ticket.", tint: C.brand700, accent: C.amber500 },
    { tag: "WHITE-LABEL", title: "License VolunTrack", price: "$5k + $1k/yr", body: "Your branding, your domain, your student data on your Postgres. Source code included.", tint: C.brand700, accent: C.sky500 },
    { tag: "RETAIN", title: "Monthly partnership", price: "$2k – $6k / mo", body: "Hosting, monitoring, AI agent ops, feature requests, and on-call. Cancel any month.", tint: C.brand700, accent: C.emerald500 },
  ];
  let x = 80;
  for (const sv of services) {
    rect(s, { left: x, top: 220, width: 270, height: 360 }, sv.tint, { radius: 18, border: sv.accent });
    rect(s, { left: x, top: 220, width: 270, height: 6 }, sv.accent, { radius: 3 });
    txt(s, sv.tag, { left: x + 22, top: 248, width: 240, height: 18 }, { ...T.eyebrow, color: sv.accent });
    txt(s, sv.title, { left: x + 22, top: 278, width: 240, height: 50 }, { ...T.h3, color: C.white, fontSize: 22 });
    txt(s, sv.price, { left: x + 22, top: 332, width: 240, height: 44 }, { ...T.metric, color: C.white, fontSize: 32 });
    txt(s, sv.body, { left: x + 22, top: 386, width: 240, height: 180 }, { ...T.body, color: C.brand200, fontSize: 14, lineHeight: 1.4 });
    x += 280;
  }
  txt(s, "voluntrack.app", { left: 80, top: 670, width: 400, height: 20 }, { ...T.small, color: C.brand300 });
  txt(s, "Slide 12", { left: 1180, top: 670, width: 80, height: 20, align: "right" }, { ...T.small, color: C.brand300 });
}

// ============= SLIDE 13 — CTA =============
{
  const s = presentation.slides.add();
  s.background.fill = C.earth50;
  txt(s, "NEXT STEPS", { left: 80, top: 64, width: 400, height: 24 }, T.eyebrow);
  txt(s, "Three ways to take the next ten minutes.", { left: 80, top: 96, width: 1120, height: 60 }, T.h2);
  const ctas = [
    { num: "01", title: "Try the live demo", body: "Open the app, sign in with any email + password, and log a single hour. Time it — it's under 90 seconds.", link: "hriday21223.github.io/VolunteerTrack", linkLabel: "OPEN THE APP" },
    { num: "02", title: "Read the source", body: "Everything is on GitHub under MIT. Read SECURITY.md for the auth model, README.md for the stack.", link: "github.com/Hriday21223/VolunteerTrack", linkLabel: "VIEW ON GITHUB" },
    { num: "03", title: "Start the conversation", body: "Email is the fastest path. I reply within a business day, and I'm happy to do a 20-minute call before any commitment.", link: "volunteertrack@googlegroups.com", linkLabel: "EMAIL ME" },
  ];
  let cy = 200;
  for (const c of ctas) {
    rect(s, { left: 80, top: cy, width: 1120, height: 130 }, C.white, { radius: 16, border: C.earth200 });
    rect(s, { left: 80, top: cy, width: 6, height: 130 }, C.brand500, { radius: 3 });
    txt(s, c.num, { left: 110, top: cy + 24, width: 100, height: 80 }, { ...T.metric, color: C.brand200, fontSize: 56 });
    txt(s, c.title, { left: 220, top: cy + 30, width: 500, height: 36 }, { ...T.h3, fontSize: 24 });
    txt(s, c.body, { left: 220, top: cy + 72, width: 540, height: 50 }, { ...T.body, fontSize: 14 });
    txt(s, c.linkLabel, { left: 780, top: cy + 32, width: 400, height: 18 }, { ...T.eyebrow, fontSize: 11, color: C.brand600, align: "right" });
    txt(s, c.link, { left: 780, top: cy + 58, width: 400, height: 30 }, { ...T.body, bold: true, color: C.brand700, fontSize: 18, align: "right" });
    cy += 145;
  }
  txt(s, "voluntrack.app", { left: 80, top: 670, width: 400, height: 20 }, T.small);
  txt(s, "Slide 13", { left: 1180, top: 670, width: 80, height: 20, align: "right" }, T.small);
}

// ============= RENDER + EXPORT =============
await fs.mkdir(PREVIEW_DIR, { recursive: true });
await fs.mkdir(ASSET_DIR, { recursive: true });

const slideItems = presentation.slides.items;
console.log(`[deck] slides: ${slideItems.length}`);

for (let i = 0; i < slideItems.length; i++) {
  const slide = slideItems[i];
  const stem = `slide-${String(i + 1).padStart(2, "0")}`;
  const png = await presentation.export({ slide, format: "png", scale: 1 });
  await fs.writeFile(path.join(PREVIEW_DIR, `${stem}.png`), new Uint8Array(await png.arrayBuffer()));
  console.log(`[deck] rendered ${stem}`);
}

const montage = await presentation.export({ format: "webp", montage: true, scale: 1 });
await fs.writeFile(path.join(PREVIEW_DIR, "deck-montage.webp"), new Uint8Array(await montage.arrayBuffer()));
console.log(`[deck] montage written`);

const pptx = await PresentationFile.exportPptx(presentation);
await pptx.save(path.join(OUT_DIR, "voluntrack-pitch.pptx"));
console.log(`[deck] pptx written`);
