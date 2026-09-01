# Ekadashi Reminder & Alarm

A production-ready, cross-platform (iOS + Android) **Expo** app that helps devotees observe **Ekadashi** — the eleventh lunar day of each fortnight. It shows upcoming Ekadashi dates, their **Parana** (fast-breaking) windows, and schedules flexible reminders plus a persistent alarm so the day is not missed.

## Features

- **Dashboard** — today's date in the chosen timezone, the next Ekadashi (or today's fast / Parana state) with countdown, paksha/month, significance, and the Parana window.
- **Calendar** — month grid highlighting every Ekadashi; tap a date or the monthly list for Parana timing. Jump-to-today and 2026–2027 navigation.
- **Flexible reminders** — toggle lead-times ("On the Day", "1–4 Days Before") and pick the time of day advance reminders fire.
- **Persistent Alarm** — MAX-priority Android channel (bypasses DnD, alarm audio usage) and time-sensitive iOS alerts on the morning of Ekadashi and throughout the Parana window. Repeating local notifications plus an in-app full-screen alarm with looping sound, dismiss, and snooze.
- **Settings** — lead-times, reminder time, alarm sound/time/repeats, timezone alignment; test notification; reset to defaults. Preferences persist via AsyncStorage.
- First-launch notification permission request (only while still undetermined) and Android channel registration. If access is denied, Dashboard and Settings show a banner that opens system Settings.

## Tech stack

- **Expo SDK 57** + **TypeScript**, **Expo Router** (tab navigation)
- **NativeWind** (Tailwind CSS) for styling
- **expo-notifications** for scheduled local notifications + Android channels
- **expo-audio** for the in-app looping alarm sound (background playback, no microphone permission)
- **@react-native-async-storage/async-storage** to persist preferences
- **lucide-react-native** icons, **expo-linear-gradient** background

## Project structure

```
src/
  app/                      # Expo Router routes
    _layout.tsx             # Providers + first-launch notification bootstrap
    (tabs)/                 # Dashboard / Calendar / Settings
    alarm.tsx               # Full-screen persistent alarm
  components/
  constants/
  data/ekadashi-2026-2027.json
  lib/                      # ekadashi, timezone, schedule, notifications, alarm
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

On first launch the app requests local-notification permission. Android also registers a high-priority reminder channel and a MAX-importance alarm channel (`SCHEDULE_EXACT_ALARM`, `USE_FULL_SCREEN_INTENT`).

## Data note

Ekadashi dates and Parana timings in `src/data/ekadashi-2026-2027.json` are a curated **Smarta IST** reference for 2026–2027. Exact timings vary by regional panchang, Vaishnava vs Smarta rules, and local sunrise. Align them to your locality before relying on them for observance.
