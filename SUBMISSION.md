# App Store & Play Store Submission Guide

---

## Store Descriptions

### Apple App Store

**App Name:** VolunTrack — Volunteer Hour Tracker

**Subtitle:** Track hours, earn badges, generate reports

**Category:** Education

**Description:**

VolunTrack is a calm, focused volunteer hour tracker designed for students, volunteers, and school administrators.

Track your service hours, set weekly or monthly goals, earn achievement badges as you hit milestones, and generate detailed PDF reports — all in one place.

• Log hours with activity descriptions, categories, and locations
• Set personal volunteering goals and track your progress
• Earn badges for consistency, milestones, and special achievements
• Generate and export PDF reports for school or community service requirements
• Sync your account across devices with QR code pairing
• Dark mode support
• Works offline with local storage

For schools and organizations, VolunTrack provides admin dashboards to manage students, review submissions, and send announcements.

**Keywords:** volunteer, volunteer hours, community service, service hours, tracking, student, school, charity, nonprofit, hours log

**Support URL:** https://github.com/hriday21223/VolunteerTrack

**Marketing URL:** https://hriday21223.github.io/VolunteerTrack

**Privacy Policy URL:** https://hriday21223.github.io/VolunteerTrack/privacy.html

---

### Google Play Store

**Title:** VolunTrack — Volunteer Hour Tracker

**Short description (80 chars):**
Track volunteer hours, set goals, earn badges, and export reports.

**Full description:**

VolunTrack is a volunteer hour tracker designed for students, volunteers, and school administrators.

Log your service hours with activity descriptions, categories, and location auto-fill. Set weekly or monthly goals and watch your progress. Earn achievement badges as you hit milestones — consistent logging, hour thresholds, and special categories.

Key features:
• Log hours with date, activity, category, hours, notes, and supervisor info
• Goal setting with progress tracking
• Achievement badges for milestones and consistency
• PDF report generation and export
• Calendar view of your logged hours
• Reminders to keep you on track
• QR code cross-device account sync
• School admin dashboards for reviewing submissions
• Dark mode support
• Works offline with local storage fallback

VolunTrack is built with privacy in mind. Your data is stored securely and you can delete your account at any time.

**Category:** Education

**Content rating:** Everyone

**Support email:** volunteertrack@googlegroups.com

**Support URL:** https://github.com/hriday21223/VolunteerTrack

**Privacy Policy URL:** https://hriday21223.github.io/VolunteerTrack/privacy.html

---

## Screenshot Checklist

### iOS (App Store Connect requires)

| Device | Screen size | Orientation | What to capture |
|--------|-------------|-------------|-----------------|
| iPhone 15 Pro Max / 16 Plus (6.7") | 1290×2796 | Portrait | Dashboard + Log Hours |
| iPhone 15 Pro (6.1"/6.3") | 1206×2622 | Portrait | Dashboard + Achievements |
| iPhone SE (5.5") | 1242×2208 | Portrait | Dashboard + Reports |
| iPad Pro 12.9" (3rd gen+) | 2048×2732 | Landscape | Dashboard (shows full-width layout) |
| iPad Pro 12.9" (3rd gen+) | 2048×2732 | Portrait | School Dashboard or Admin |

**Recommended sets:**
1. **Dashboard** — shows summary stats, recent logs, goal progress
2. **Log Hours** — the log form with fields filled in
3. **Achievements** — earned badges display
4. **Reports** — generated report preview
5. **Settings** — sync PIN/QR code, theme toggle, account deletion

### Android (Play Console requires)

| Device | Size | Orientation | What to capture |
|--------|------|-------------|-----------------|
| Phone (6.7") | 1080×2400 | Portrait | Dashboard + Log Hours + Achievements |
| Phone (6.7") | 1080×2400 | Portrait | Reports + Settings with QR code |
| Tablet (10") | 1920×1200 | Landscape | Dashboard (tablet layout) |
| Tablet (10") | 1920×1200 | Landscape | School Dashboard or Admin |

Min 2 screenshots required for phones, 2 for tablets. 8 total is typical.

### Tips

- Use **Simulator** (Xcode) for iOS screenshots at exact sizes
- Use **Android Emulator** with the right skin/resolution for Play Store
- Enable "Show full screen" (hide status bar) in simulators for clean screenshots
- Capture the **light theme** for screenshots (more legible at small sizes)
- Add a subtle device frame overlay if desired (App Store Connect strips them anyway)
- Keep the content realistic — use demo data (sample logs, hours, goals)

---

## Build & Sign Commands

### Android — Keystore & Signed Bundle

```bash
# 1. Generate upload keystore (one time)
keytool -genkey -v -keystore upload-keystore.jks \
  -alias upload \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# 2. Build the signed Android App Bundle (AAB)
npx cap sync android
cd android
./gradlew bundleRelease
cd ..

# 3. The AAB will be at:
#    android/app/build/outputs/bundle/release/app-release.aab
#
# 4. Upload this to Play Console → Internal Testing
```

**Important:** Keep `upload-keystore.jks` safe and backed up. You need it for all future updates. Set the keystore password, key password, and alias in your env or gradle properties.

### iOS — Xcode Archive & TestFlight

```bash
# 1. Sync Capacitor
npx cap sync ios

# 2. Open Xcode
npx cap open ios

# 3. In Xcode:
#    - Select your team under Signing & Capabilities
#    - Set bundle identifier to com.voluntrack.voluntrack
#    - Choose a development team with App Store distribution cert

# 4. Archive & Upload:
#    Product → Archive (wait for build to finish)
#    Organizer window → Distribute App → App Store Connect
#    Upload → let it validate → Submit

# 5. The build appears in App Store Connect → TestFlight
#    Add internal testers, enable "TestFlight Internal Testing"
```

**Prerequisites:**
- Apple Developer account ($99/yr) with active membership
- Distribution certificate in Xcode (auto-managed signing recommended)
- App record created in App Store Connect

### Automation (optional)

Once signed, automate builds with:

```bash
# Android
npx cap sync android && cd android && ./gradlew bundleRelease

# iOS (from command line)
npx cap sync ios
xcodebuild -workspace ios/App/App.xcworkspace \
  -scheme App \
  -configuration Release \
  -archivePath build/VolunTrack.xcarchive \
  archive
```

---

## Colors & Brand

| Element | Hex |
|---------|-----|
| Primary brand | `#3f8344` |
| Background | `#f1f8f1` |
| Dark background | Dark mode handled by theme hook |

These are already set in `vite.config.js` PWA manifest for the web wrapper and in the Capacitor config.
