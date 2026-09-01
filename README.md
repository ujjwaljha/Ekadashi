# Ekadashi Reminder & Alarm

A production-ready, cross-platform (iOS + Android) **Expo** app that helps devotees observe **Ekadashi** — the eleventh lunar day of each fortnight. It shows upcoming Ekadashi dates in the devotee’s own regional calendar (Mithila, Bengali, Tamil, ISKCON, and more), their **Parana** (fast-breaking) windows, and schedules flexible reminders plus a persistent alarm so the day is not missed.

## Features

- **Your calendar** — first-run picker for 15 regional systems: Mithila/Tirhuta, North Indian Vikram, Nepali Bikram Sambat, Bengali, Odia, Gujarati, Marathi, Telugu, Kannada, Tamil, Malayalam (Kollam), Punjabi, ISKCON/Gaudiya, Vaishnava, and Smarta. Dates, month names, and era years (Lakshman Samvat, Vikram, Shaka, Bengali San, Kollam, Gaurabda, Tamil year) follow the selected panchang.
- **Smarta or Vaishnava** — switch the fasting-day rule. When Dashami touches sunrise, Vaishnava / ISKCON dates move to the next day; the app shows the other tradition’s date when they differ.
- **Dashboard** — today’s Gregorian and regional date, the next Ekadashi (or today’s fast / Parana state) with countdown, paksha/month, significance, and the Parana window.
- **Calendar** — month grid highlighting every Ekadashi; each cell shows the regional day label. Tap a date or the monthly list for Parana timing.
- **Flexible reminders** — toggle lead-times ("On the Day", "1–4 Days Before") and pick the time of day advance reminders fire.
- **Persistent Alarm** — MAX-priority Android channel (bypasses DnD, alarm audio usage) and time-sensitive iOS alerts on the morning of Ekadashi and throughout the Parana window. Repeating local notifications plus an in-app full-screen alarm with looping sound, dismiss, and snooze.
- **Settings** — calendar and tradition, lead-times, reminder time, alarm sound/time/repeats, timezone alignment; test notification; reset to defaults. Preferences persist via AsyncStorage.
- First-launch notification permission request and Android channel registration.

## Tech stack

- **Expo SDK 57** + **TypeScript**, **Expo Router** (tab navigation)
- **NativeWind** (Tailwind CSS) for styling
- **expo-notifications** for scheduled local notifications + Android channels
- **expo-audio** for the in-app looping alarm sound
- **@react-native-async-storage/async-storage** to persist preferences
- **lucide-react-native** icons, **expo-linear-gradient** background

## Project structure

```
src/
  app/                      # Expo Router routes
    _layout.tsx             # Providers, onboarding gate, notification bootstrap
    (tabs)/                 # Dashboard / Calendar / Settings
    alarm.tsx               # Full-screen persistent alarm
  components/               # CalendarPicker, Onboarding, shared UI
  constants/calendars.ts    # Regional calendar catalog
  data/ekadashi-2026-2027.json
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

Notifications and the persistent alarm require a **physical iOS/Android device** (or a development build). The web target is a visual preview; scheduling is guarded to no-op there.

On first launch the app asks which calendar and tradition you follow, then requests local-notification permission. Android also registers a high-priority reminder channel and a MAX-importance alarm channel (`SCHEDULE_EXACT_ALARM`, `USE_FULL_SCREEN_INTENT`).

## Data note

Ekadashi dates in `src/data/ekadashi-2026-2027.json` are an **India Standard Time** reference for 2026–2027, including the 2026 Adhika Jyeshtha (Padmini and Parama). Smarta dates follow the sunrise (udaya) tithi; Vaishnava dates follow the shuddha-tithi rule used by ISKCON and Gaudiya panchangs. Exact Parana windows vary by city sunrise. Confirm with a local panchang before relying on them for observance.
