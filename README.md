# VolunTrack

[![CI](https://github.com/Hriday21223/VolunteerTrack/actions/workflows/ci.yml/badge.svg)](https://github.com/Hriday21223/VolunteerTrack/actions/workflows/ci.yml)
[![CodeQL](https://github.com/Hriday21223/VolunteerTrack/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/Hriday21223/VolunteerTrack/actions/workflows/codeql-analysis.yml)
[![Deploy](https://github.com/Hriday21223/VolunteerTrack/actions/workflows/deploy.yml/badge.svg)](https://github.com/Hriday21223/VolunteerTrack/actions/workflows/deploy.yml)
[![Dependabot](https://github.com/Hriday21223/VolunteerTrack/security/dependabot)](https://github.com/Hriday21223/VolunteerTrack/security/dependabot)

**Live demo:** [hriday21223.github.io/VolunteerTrack](https://hriday21223.github.io/VolunteerTrack)

A warm, focused volunteer hour tracker. Log hours, set goals, earn achievements, and generate reports for school or community organizations.

## Stack

- **React 18** + **Vite 5**
- **React Router 6**
- **Tailwind CSS 3** (custom `brand` greens + `earth` warm neutrals)
- **localStorage** persistence (no backend needed)
- **jsPDF** + **jspdf-autotable** for report exports
- **lucide-react** for icons
- **date-fns** for date math

## Features

- 🔐 Auth (local-only): login, register, password reset, PIN reset
- 📊 Dashboard with total/monthly hours, weekly chart, progress ring, recent activity
- ⏰ Log hours with drag-and-drop proof upload, supervisor verification fields
- 📅 Calendar view with session indicators per day
- 🎯 Goal tracking + 12 auto-earning achievement badges
- 📄 PDF volunteer log, CSV export, printable certificate
- 👤 Profile with avatar, school/grade, quick stats
- ⚙️ Settings: dark mode, goal management, account
- 🌐 Public About + Contact pages

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run backend   # optional: enable real recovery emails (see below)
npm run build     # production build to /dist
npm run preview   # preview the build
```

### Recovery emails (optional)

The recovery backend lives in `server.js` and is wired to `POST /api/send-reset-email`,
which Vite proxies to `http://localhost:5174` for you. By default no SMTP credentials
are set, so `ResetPin` and `ForgotPassword` show the recovery code locally and skip
the email step.

To deliver real emails, copy `.env.example` to `.env` and fill in your SMTP details,
then run `npm run backend` in a second terminal:

```bash
cp .env.example .env
# edit .env, then:
npm run backend
```

Any SMTP provider works (Resend, SendGrid, Mailgun, Gmail app passwords, etc.).
The backend returns 503 when SMTP isn't configured, and the UI gracefully falls back
to "code on screen" so you never get a dead-end.

## Data model

All state lives in `localStorage` under the `voluntrack:` namespace:

| Key                      | Shape                                              |
|--------------------------|----------------------------------------------------|
| `voluntrack:user`        | `{ id, name, email, school, grade, avatar }`       |
| `voluntrack:logs`        | `VolunteerLog[]`                                   |
| `voluntrack:goals`       | `Goal[]`                                           |
| `voluntrack:achievements`| `string[]` (badge IDs the user has earned)         |
| `voluntrack:theme`       | `'light' \| 'dark'`                                |

See `src/lib/storage.js` and `src/lib/achievements.js` for the rules.

## Project layout

```
src/
  api/         # data layer over localStorage
  components/  # reusable UI (cards, buttons, charts, etc.)
  hooks/       # shared React hooks (useLocalStorage, useTheme, etc.)
  lib/         # pure utilities (achievements, date math, export)
  pages/       # route-level pages
  utils/       # small helpers (cn, format, etc.)
```

## Notes

- This is a single-user demo: signing in is local and doesn't talk to a server.
- Drag-and-drop proof uploads read files via `FileReader` and store as base64 — convenient, but it does inflate `localStorage`. Keep proof files under ~1 MB.
- Dark mode is opt-in per device; the choice is persisted in `voluntrack:theme`.
