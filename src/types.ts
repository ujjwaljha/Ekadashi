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

/** How many days before Ekadashi an advance reminder should fire. */
export type LeadDay = 0 | 1 | 2 | 3 | 4;

/** Persisted user preferences. */
export interface Settings {
  /** Master switch for all reminders. */
  notificationsEnabled: boolean;
  /** Which advance lead-times are active (0 = on the day). */
  leadDays: LeadDay[];
  /** Time of day (HH:mm, 24h) advance reminders should fire. */
  reminderTime: string;
  /** Persistent "alarm" mode for a louder, high-priority alert. */
  alarmEnabled: boolean;
  /** Chosen alarm sound id. */
  alarmSound: string;
  /** IANA timezone id used to align schedules, or "device" to follow the OS. */
  timezone: string;
}
