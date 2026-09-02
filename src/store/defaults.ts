import { DEFAULT_CALENDAR_ID, isCalendarId } from "@/constants/calendars";
import { DEFAULT_CITY_ID, isCityId } from "@/constants/cities";
import type { LeadDay, Settings, TraditionId } from "@/types";

export const STORAGE_KEY = "ekadashi.settings.v2";

export const DEFAULT_SETTINGS: Settings = {
  notificationsEnabled: true,
  leadDays: [0, 1],
  reminderTime: "08:00",
  alarmEnabled: false,
  alarmSound: "temple-bell",
  alarmTime: "06:00",
  alarmRepeatMinutes: 5,
  alarmRepeatCount: 2,
  timezone: "device",
  calendarId: DEFAULT_CALENDAR_ID,
  tradition: "smarta",
  cityId: DEFAULT_CITY_ID,
  onboardingCompleted: false,
};

function isTradition(value: unknown): value is TraditionId {
  return value === "smarta" || value === "vaishnava";
}

/** Merge persisted data over defaults so newly added fields always have a value. */
export function normalizeSettings(raw: unknown): Settings {
  if (!raw || typeof raw !== "object") return DEFAULT_SETTINGS;
  const parsed = raw as Partial<Settings>;
  const leadDays = Array.isArray(parsed.leadDays)
    ? ([...new Set(parsed.leadDays)].filter((d) => d >= 0 && d <= 4) as LeadDay[])
    : DEFAULT_SETTINGS.leadDays;
  const alarmRepeatCount =
    typeof parsed.alarmRepeatCount === "number"
      ? Math.max(0, Math.min(4, Math.round(parsed.alarmRepeatCount)))
      : DEFAULT_SETTINGS.alarmRepeatCount;
  const alarmRepeatMinutes =
    typeof parsed.alarmRepeatMinutes === "number"
      ? Math.max(1, Math.min(15, Math.round(parsed.alarmRepeatMinutes)))
      : DEFAULT_SETTINGS.alarmRepeatMinutes;
  return {
    ...DEFAULT_SETTINGS,
    ...parsed,
    leadDays,
    alarmRepeatCount,
    alarmRepeatMinutes,
    calendarId: isCalendarId(parsed.calendarId) ? parsed.calendarId : DEFAULT_SETTINGS.calendarId,
    tradition: isTradition(parsed.tradition) ? parsed.tradition : DEFAULT_SETTINGS.tradition,
    cityId: isCityId(parsed.cityId) ? parsed.cityId : DEFAULT_SETTINGS.cityId,
    onboardingCompleted: parsed.onboardingCompleted === true,
  };
}
