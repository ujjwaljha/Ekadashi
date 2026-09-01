/** The two lunar fortnights: Shukla (waxing) and Krishna (waning). */
export type Paksha = "Shukla" | "Krishna";

/** Parana is the fast-breaking window observed on the day after Ekadashi. */
export interface Parana {
  /** ISO date (YYYY-MM-DD) on which the fast is broken. */
  date: string;
  /** Local start time (HH:mm, 24h) of the Parana window. */
  start: string;
  /** Local end time (HH:mm, 24h) of the Parana window. */
  end: string;
}

/** A single Ekadashi observance. */
export interface Ekadashi {
  /** Stable id, equal to the ISO fasting date. */
  id: string;
  /** ISO date (YYYY-MM-DD) of the Ekadashi fast. */
  date: string;
  /** Traditional name, e.g. "Nirjala", "Yogini", "Utpanna". */
  name: string;
  paksha: Paksha;
  /** Hindu lunar month, e.g. "Jyeshtha". */
  month: string;
  parana: Parana;
  /** Short description of the observance's significance. */
  significance: string;
}

export interface EkadashiDataset {
  meta: {
    region: string;
    timezone: string;
    tradition: string;
    note: string;
  };
  ekadashis: Ekadashi[];
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
