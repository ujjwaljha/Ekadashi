# Ship Ekadashi Reminder

This app is an Expo SDK 57 project. Dates, Parana, and settings work in the web preview. **Custom alarm sounds, exact local notifications, and store binaries require an EAS build.** Expo Go can show the UI but will not include the temple-bell / conch notification sounds from `app.json`.

## One-time accounts

1. [Expo](https://expo.dev) account (`npx eas-cli login`).
2. [Apple Developer](https://developer.apple.com) for TestFlight / App Store (bundle id `com.ekadashi.reminder`).
3. [Google Play Console](https://play.google.com/console) for internal testing / production (package `com.ekadashi.reminder`).

Then create the Expo project and write the id into `app.json`:

```bash
npx eas-cli init
```

That adds `expo.extra.eas.projectId`. Do not invent a project id by hand. After `eas init`, put your App Store Connect app id in `eas.json` → `submit.production.ios.ascAppId`.

## Build profiles (`eas.json`)

| Profile | What you get |
| --- | --- |
| `development` | Dev client APK / device build. Install this to test custom sounds and alarms. |
| `development-simulator` | iOS Simulator + Android APK for the same client. |
| `preview` | Internal release APK (sideload / internal testers). |
| `production` | Android App Bundle + iOS store binary. Version codes increment remotely. |

```bash
# Device install with custom sounds (recommended for QA)
npx eas-cli build --profile development --platform android
npx eas-cli build --profile development --platform ios

# Internal tester APK
npx eas-cli build --profile preview --platform android

# Store binaries
npx eas-cli build --profile production --platform all
npx eas-cli submit --profile production --platform android
npx eas-cli submit --profile production --platform ios
```

Android submit uses the Play **internal** track as a **draft**. Promote in Play Console when the listing is ready. iOS submit stays in App Store Connect until you add `ascAppId` and submit for review.

## What this app already configures

- Bundle / package `com.ekadashi.reminder`, version `1.1.0` (iOS build 2, Android versionCode 2).
- Portrait, dark UI, saffron primary color, notification icon + bundled sounds.
- Android: `POST_NOTIFICATIONS`, exact alarms, full-screen intent, boot reschedule, wake lock. Legacy storage permissions are blocked.
- iOS: local-notification usage string, `audio` background mode for the looping alarm, `ITSAppUsesNonExemptEncryption` = false.
- Runtime version follows `appVersion` so EAS Update can be added later without a native rebuild mismatch.
- In-app **Privacy** (`/privacy`) and **About** (`/about`). Use `/privacy` on a web export, or a hosted copy of that text, as the store privacy-policy URL.

## Store listing (you still do this)

Play Console and App Store Connect need screenshots, a short description, and a public privacy-policy URL. Data-safety / nutrition labels for this app:

- No account, no analytics, no advertising, no location.
- Preferences stay on device.
- Notifications are local, not server push.

Confirm Parana with a local panchang before relying on the window for observance — say that in the listing.

## Device QA checklist

1. Install a **development** or **preview** build (not Expo Go) on a physical phone.
2. Finish onboarding: calendar → city → tradition.
3. Settings: allow notifications; on Android 12+ also allow exact alarms if the OS asks.
4. Apply & Reschedule — status should show a non-zero scheduled count.
5. Send Test Notification.
6. Preview alarm sound; open `/alarm` from a test if needed; hardware back must stop the sound.
7. Kill the app, tap an alarm notification: the full-screen alarm must open (cold start).
8. iOS: lock-screen **Snooze 5 min** / **Dismiss** actions.
9. Change city / tradition and confirm the dashboard and calendar update.

## Web preview (not a substitute for a device)

```bash
npm install
npm run web
npm test
npm run typecheck
```

Use this for calendar / city / Parana UI. Scheduling is a no-op on web.
