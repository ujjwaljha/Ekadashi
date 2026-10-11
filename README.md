# Ekadashi Reminder & Alarm

A production-ready, cross-platform (iOS + Android) **Expo** app that helps devotees observe **Ekadashi** — the eleventh lunar day of each fortnight. It shows upcoming Ekadashi dates in the devotee’s own regional calendar (Mithila, Bengali, Tamil, ISKCON, and more), their **Parana** (fast-breaking) windows, and schedules flexible reminders plus a persistent alarm so the day is not missed.

## Features

- **Your calendar** — first-run picker for 15 regional systems: Mithila/Tirhuta, North Indian Vikram, Nepali Bikram Sambat, Bengali, Odia, Gujarati, Marathi, Telugu, Kannada, Tamil, Malayalam (Kollam), Punjabi, ISKCON/Gaudiya, Vaishnava, and Smarta. Dates, month names, and era years (Lakshman Samvat, Vikram, Shaka, Bengali San, Kollam, Gaurabda, Tamil year) follow the selected panchang.
- **Smarta or Vaishnava** — switch the fasting-day rule. Smarta follows the sunrise tithi as Drik Panchang applies it (kshaya, vriddhi and trisprsa cases included); Vaishnava / ISKCON requires a shuddha Ekadashi at arunodaya and keeps Mahadvadashi fasts on Dwadashi. The app shows the other tradition’s date when they differ.
- **Dashboard** — today’s Gregorian and regional date, the next Ekadashi (or today’s fast / Parana state) with countdown, paksha/month, significance, and the Parana window.
- **Calendar** — month grid highlighting every Ekadashi; each cell shows the regional day label. Tap a date or the monthly list for Parana timing.
- **Fasting guide** — for every Ekadashi: why it is kept, the deity and rituals particular to it, the day-by-day sequence from Dashami evening through Jagaran to the Parana window, fasting levels, what to eat and avoid, and how the dates were decided.
- **Add to your calendar** — export all dates (or a single Ekadashi) as an `.ics` file with all-day fasting events, timed Parana windows and an optional reminder, for Google Calendar, Apple Calendar or Outlook.
- **Flexible reminders** — toggle lead-times ("On the Day", "1–4 Days Before") and pick the time of day advance reminders fire.
- **Persistent Alarm** — MAX-priority Android channel (bypasses DnD, alarm audio usage) and time-sensitive iOS alerts on the morning of Ekadashi and throughout the Parana window. Repeating local notifications plus an in-app full-screen alarm with looping sound, dismiss, and snooze.
- **Your city** — sunrise in the chosen city sets the Parana window (Pratahkal / Aparahna for Smarta, after Hari Vasara for Vaishnava). India and Nepal keep published fasting dates; other cities calculate the local day when it shifts.
- **Five years in the app, then astronomy** — 2026–2030 dates are stored on device. When the calendar runs past them the same engine calculates later years, Adhika months included.
- **Settings** — calendar, city, and tradition, lead-times, reminder time, alarm sound/time/repeats, timezone alignment, calendar export; live permission + scheduled-count status; test notification; reset to defaults. Preferences persist via AsyncStorage.
- **About / Privacy** — version, dataset note, and a store-ready local privacy policy.
- First-launch notification permission, Android channels, iOS alarm categories, and cold-start alarm routing.

## Tech stack

- **Expo SDK 57** + **TypeScript**, **Expo Router** (tab navigation)
- **NativeWind** (Tailwind CSS) for styling
- **expo-notifications** for scheduled local notifications + Android channels + iOS categories
- **expo-dev-client** + **EAS** for installable builds (`eas.json`)
- **expo-audio** + **expo-keep-awake** for the in-app looping alarm
- **@react-native-async-storage/async-storage** to persist preferences
- **lucide-react-native** icons, **expo-linear-gradient** background

## Project structure

```
src/
  app/                      # Expo Router routes
    _layout.tsx             # Providers, onboarding gate, notification bootstrap
    (tabs)/                 # Dashboard / Calendar / Settings
    alarm.tsx               # Full-screen persistent alarm
    ekadashi/[id].tsx       # Fasting guide + single-event calendar export
    about.tsx / privacy.tsx # Version + store privacy policy
  components/               # CalendarPicker, Onboarding, shared UI
  constants/calendars.ts    # Regional calendar catalog
  constants/observance.ts   # Fasting guidance and per-Ekadashi rituals
  data/ekadashi-2026-2030.json
  lib/                      # astronomy, lunarMonth, ekadashiCompute, ekadashi, panchang, ics, …
  store/settings.tsx        # AsyncStorage-backed preferences
scripts/
  generate-ekadashi-dataset.ts        # Rebuild the bundled file from the reference
  reference/drik-ekadashi-2026-2030.json  # Drik Panchang / ISKCON New Delhi lists
assets/sounds/              # temple-bell.wav, conch.wav
```

## Getting started

```bash
npm install
npm run ios       # or: npm run android
# Web preview (notifications/alarms are device-only):
npm run web
npm run typecheck
npm test
```

Notifications and the persistent alarm require a **physical iOS/Android device** and a **development or production build**. The web target is a visual preview; scheduling is a no-op there. Expo Go can show the UI but does **not** include the custom temple-bell / conch notification sounds.

On first launch the app asks which calendar, city, and tradition you follow, then requests local-notification permission. Android also registers a high-priority reminder channel and a MAX-importance alarm channel (`SCHEDULE_EXACT_ALARM`, `USE_FULL_SCREEN_INTENT`). iOS alarm notifications expose Snooze / Dismiss actions. Tapping an alarm after a cold start opens the full-screen alarm.

## Build and ship

Store binaries, internal APKs, and the custom-sound dev client are built with EAS. See **[STORE.md](STORE.md)** for `eas init`, profiles, submit tracks, privacy URL, and the device QA checklist.

```bash
npx eas-cli login
npx eas-cli init                          # writes extra.eas.projectId
npx eas-cli build --profile development --platform android
npx eas-cli build --profile preview --platform android
npx eas-cli build --profile production --platform all
```

In-app **About** and **Privacy** screens ship with the binary. Host the `/privacy` route (or the same text) as the App Store / Play Store privacy-policy URL.

## Data note

Ekadashi dates in `src/data/ekadashi-2026-2030.json` are a five-year **New Delhi** reference (2026–2030): Smarta days from the Drik Panchang list and Vaishnava days from the ISKCON list, both kept with provenance in `scripts/reference/`. The file includes the Adhika months of Jyeshtha 2026 and Chaitra 2029 (Padmini 26 Mar 2029, Parama 9 Apr 2029). Run `npm run generate:dataset` to rebuild it.

The bundled astronomy engine (Meeus sun/moon, sankranti-based lunar months, the Smarta and Vaishnava day rules above) reproduces the published Smarta days 123/123 and the ISKCON days 122/123 for 2026–2030, with tithi boundaries within about three minutes and Parana windows within five; the unit tests assert this against the reference. The same engine calculates Parana from city sunrise, the local fasting day for distant cities, and every year after 2030. Confirm with a local panchang before relying on a date for observance.
