# Ekadashi Reminder & Alarm

A production-ready, cross-platform (iOS + Android) **Expo** app that helps
devotees observe **Ekadashi** — the eleventh lunar day of each fortnight,
traditionally kept as a fast. It shows upcoming Ekadashi dates, their **Parana**
(fast-breaking) windows, and schedules flexible reminders and a persistent
"alarm" so the day is never missed.

## Features

- **Dashboard** — today's date, the next Ekadashi with a live countdown, its
  paksha/month, significance, and Parana window, plus an upcoming list.
- **Calendar** — a month grid highlighting every Ekadashi; tap a date for its
  Parana timing and significance. Navigates across the 2026–2027 dataset.
- **Flexible reminders** — toggle lead-times ("On the Day", "1–4 Days Before")
  and pick the time of day advance reminders fire.
- **Persistent Alarm** — a louder, MAX-priority Android channel (bypasses DnD)
  and time-sensitive iOS alert on the morning of Ekadashi and at the Parana
  window, with a selectable local alarm sound (temple bell / conch) that can
  loop in-app.
- **Settings** — manage lead-times, reminder time, alarm sound, and timezone
  alignment; send a test notification; reset to defaults.

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
    _layout.tsx             # Providers + first-launch notification bootstrap
    (tabs)/                 # Dashboard / Calendar / Settings tabs
  components/               # Screen, Card, TimePicker
  constants/                # theme palette, alarm-sound catalog
  data/                     # ekadashi-2026-2027.json (static dataset)
  lib/                      # ekadashi (data), format, notifications, alarm
  store/                    # settings context backed by AsyncStorage
  types.ts
assets/sounds/              # temple-bell.wav, conch.wav (local alarm sounds)
```

## Getting started

```bash
npm install
npm run ios       # or: npm run android
# Web preview (notifications/alarms are device-only):
npm run web
npm run typecheck # tsc --noEmit
```

Notifications and the persistent alarm require a **physical iOS/Android
device** (or a dev build); the web target is a visual preview only.

## Data note

Ekadashi dates and Parana timings in `src/data/ekadashi-2026-2027.json` are a
curated reference for 2026–2027. Exact timings vary by regional panchang and
location; align them to your locality before relying on them for observance.
