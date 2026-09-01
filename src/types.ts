/** The two lunar fortnights: Shukla (waxing) and Krishna (waning). */
export type Paksha = "Shukla" | "Krishna";

/** Canonical lunar month names (Chaitra-first). */
export const HINDU_MONTHS = [
  "Chaitra",
  "Vaishakha",
  "Jyeshtha",
  "Ashadha",
  "Shravana",
  "Bhadrapada",
  "Ashwin",
  "Kartik",
  "Margashirsha",
  "Pausha",
  "Magha",
  "Phalguna",
] as const;

export type HinduMonth = (typeof HINDU_MONTHS)[number];

/** Regional / traditional calendars used to label Ekadashi. */
export type CalendarId =
  | "mithila"
  | "north-indian"
  | "nepali"
  | "bengali"
  | "odia"
  | "gujarati"
  | "marathi"
  | "telugu"
  | "kannada"
  | "tamil"
  | "malayalam"
  | "punjabi"
  | "iskcon"
  | "vaishnava"
  | "smarta";

/** Fasting-day rule: sunrise tithi (Smarta) vs shuddha tithi (Vaishnava). */
export type TraditionId = "smarta" | "vaishnava";

export type MonthSystem = "purnimanta" | "amanta";

/** How the civil year is numbered in a regional calendar. */
export type EraId =
  | "vikram-chaitra"
  | "vikram-kartik"
  | "saka"
  | "bengali"
  | "kollam"
  | "lakshman"
  | "nepali"
  | "tamil"
  | "gaurabda";

/** Parana is the fast-breaking window observed on the day after Ekadashi. */
export interface Parana {
  /** ISO date (YYYY-MM-DD) on which the fast is broken. */
  date: string;
  /** Local start time (HH:mm, 24h) of the Parana window. */
  start: string;
  /** Local end time (HH:mm, 24h) of the Parana window. */
  end: string;
}

export interface TraditionDates {
  date: string;
  parana: Parana;
}

/** Raw dataset row — one named Ekadashi with both observance traditions. */
export interface EkadashiRecord {
  /** Stable id, based on the Smarta fasting date + name slug. */
  id: string;
  /** Pan-India name, e.g. "Nirjala", "Yogini". */
  name: string;
  /** Optional tradition/region specific display names. */
  names?: Partial<Record<CalendarId, string>>;
  paksha: Paksha;
  monthPurnimanta: HinduMonth;
  monthAmanta: HinduMonth;
  /** True for Adhika / Purushottama masa observances. */
  adhika?: boolean;
  smarta: TraditionDates;
  vaishnava: TraditionDates;
  significance: string;
}

/** A single Ekadashi observance resolved for the user's calendar + tradition. */
export interface Ekadashi {
  /** Stable id from the dataset record. */
  id: string;
  /** ISO date (YYYY-MM-DD) of the Ekadashi fast in the chosen tradition. */
  date: string;
  /** Display name in the chosen calendar (falls back to the pan-India name). */
  name: string;
  paksha: Paksha;
  /** Lunar month label in the chosen calendar (includes Adhika when needed). */
  month: string;
  parana: Parana;
  significance: string;
  tradition: TraditionId;
  calendarId: CalendarId;
  adhika: boolean;
  monthKey: HinduMonth;
  /** Present when Smarta and Vaishnava fasting days differ. */
  otherTraditionDate?: { tradition: TraditionId; date: string };
}

export interface EkadashiDataset {
  meta: {
    region: string;
    timezone: string;
    note: string;
  };
  ekadashis: EkadashiRecord[];
}

/** How many days before Ekadashi an advance reminder should fire. */
export type LeadDay = 0 | 1 | 2 | 3 | 4;

/** Persisted user preferences. */
export interface Settings {
  /** Master switch for all scheduled reminders. */
  notificationsEnabled: boolean;
  /** Which advance lead-times are active (0 = on the day). */
  leadDays: LeadDay[];
  /** Time of day (HH:mm, 24h) advance reminders should fire. */
  reminderTime: string;
  /** Persistent "alarm" mode for a louder, high-priority alert. */
  alarmEnabled: boolean;
  /** Chosen alarm sound id. */
  alarmSound: string;
  /** Morning-of-Ekadashi alarm time (HH:mm, 24h). */
  alarmTime: string;
  /** Repeat the alarm every N minutes during the burst window. */
  alarmRepeatMinutes: number;
  /** How many extra repeats after the first alarm fire (0–4). */
  alarmRepeatCount: number;
  /** IANA timezone id used to align schedules, or "device" to follow the OS. */
  timezone: string;
  /** Regional calendar used to label dates, months, and years. */
  calendarId: CalendarId;
  /** Smarta vs Vaishnava fasting-day rule. */
  tradition: TraditionId;
  /** False until the first-run calendar picker is finished. */
  onboardingCompleted: boolean;
}

export type NotificationKind = "reminder" | "alarm-fasting" | "alarm-parana" | "test";

/** A planned local notification, produced by the pure scheduler. */
export interface PlannedNotification {
  /** Stable key used for debugging and tests (not the OS identifier). */
  key: string;
  kind: NotificationKind;
  fireAt: Date;
  title: string;
  body: string;
  ekadashiId: string;
}

export type ObservanceKind = "fasting" | "parana" | "none";

export interface Observance {
  kind: ObservanceKind;
  ekadashi: Ekadashi | null;
}

export interface PanchangDay {
  iso: string;
  calendarId: CalendarId;
  eraYear: number;
  eraName: string;
  eraLabel: string;
  /** Primary civil date line in the selected calendar. */
  civilLabel: string;
  /** Compact civil date, suitable for calendar cells. */
  civilShort: string;
  lunarMonth: string;
  lunarPaksha: Paksha;
  tithi: number;
  tithiName: string;
  adhika: boolean;
  weekday: number;
}
