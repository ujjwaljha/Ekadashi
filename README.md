# Ekadashi Reminder & Alarm

A production-ready, cross-platform (iOS + Android) **Expo** app that helps devotees observe **Ekadashi** — the eleventh lunar day of each fortnight. It shows upcoming Ekadashi dates in the devotee’s own regional calendar (Mithila, Bengali, Tamil, ISKCON, and more), their **Parana** (fast-breaking) windows, and schedules flexible reminders plus a persistent alarm so the day is not missed.

## Features

- **Your calendar** — first-run picker for 15 regional systems: Mithila/Tirhuta, North Indian Vikram, Nepali Bikram Sambat, Bengali, Odia, Gujarati, Marathi, Telugu, Kannada, Tamil, Malayalam (Kollam), Punjabi, ISKCON/Gaudiya, Vaishnava, and Smarta. Dates, month names, and era years (Lakshman Samvat, Vikram, Shaka, Bengali San, Kollam, Gaurabda, Tamil year) follow the selected panchang.
- **Smarta or Vaishnava** — switch the fasting-day rule. When Dashami touches sunrise, Vaishnava / ISKCON dates move to the next day; the app shows the other tradition’s date when they differ.
- **Dashboard** — today’s Gregorian and regional date, the next Ekadashi (or today’s fast / Parana state) with countdown, paksha/month, significance, and the Parana window.
- **Calendar** — month grid highlighting every Ekadashi; each cell shows the regional day label. Tap a date or the monthly list for Parana timing.
- **Flexible reminders** — toggle lead-times ("On the Day", "1–4 Days Before") and pick the time of day advance reminders fire.
- **Persistent Alarm** — MAX-priority Android channel (bypasses DnD, alarm audio usage) and time-sensitive iOS alerts on the morning of Ekadashi and throughout the Parana window. Repeating local notifications plus an in-app full-screen alarm with looping sound, dismiss, and snooze.
- **Your city** — sunrise in the chosen city sets the Parana window. India and Nepal keep published fasting dates; other cities calculate the local day when it shifts.
- **Five years in the app** — 2026–2030 dates are stored on device. Published panchang dates are used when available; astronomy fills gaps and local shifts.
- **Settings** — calendar, city, and tradition, lead-times, reminder time, alarm sound/time/repeats, timezone alignment; live permission + scheduled-count status; test notification; reset to defaults. Preferences persist via AsyncStorage.
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
    about.tsx / privacy.tsx # Version + store privacy policy
  components/               # CalendarPicker, Onboarding, shared UI
  constants/calendars.ts    # Regional calendar catalog
  data/ekadashi-2026-2030.json
  lib/                      # ekadashi, panchang, timezone, schedule, notifications
  store/settings.tsx        # AsyncStorage-backed preferences
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

Ekadashi dates in `src/data/ekadashi-2026-2030.json` are a five-year **India Standard Time** reference (2026–2030), including Adhika months in 2026 and 2028. Published panchang dates are preferred; the bundled astronomy engine calculates Parana from city sunrise and, for distant cities or missing years, the local fasting day. Confirm with a local panchang before relying on them for observance.
