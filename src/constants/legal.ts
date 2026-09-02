/** In-app privacy policy. Host the /privacy route or this text as the store listing URL. */
export const PRIVACY_UPDATED = "2 September 2026";

export const PRIVACY_SECTIONS: { title: string; body: string }[] = [
  {
    title: "What this app is",
    body: "Ekadashi Reminder is a calendar and local-alarm app for Ekadashi fasting days and Parana windows. It works on the device. There is no account and no sign-in.",
  },
  {
    title: "What we collect",
    body: "The app does not collect, sell, or share personal information. It does not include analytics, advertising, crash reporting, or a remote push server.",
  },
  {
    title: "What stays on your device",
    body: "Your calendar, city, tradition, reminder times, and alarm sound are stored in on-device preferences (AsyncStorage). The city is a list you pick — the app does not read GPS. Ekadashi dates for 2026–2030 ship inside the app.",
  },
  {
    title: "Notifications",
    body: "Reminders and alarms are local notifications scheduled by the operating system. They are not sent through our servers. You can turn them off in the app or in system settings.",
  },
  {
    title: "Internet use",
    body: "A production or development build does not need a network connection to show dates or fire alarms. Expo development tools may contact Expo while you are developing.",
  },
  {
    title: "Children",
    body: "The app is a religious calendar tool and is not directed at children. It does not knowingly collect data from anyone, including children.",
  },
  {
    title: "Changes",
    body: "If this policy changes, the in-app Privacy screen will show a new date. Store listings should link to this same text (the /privacy route on a web export, or a hosted copy).",
  },
];
