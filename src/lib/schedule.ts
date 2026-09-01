import { wallTimeInZone } from "@/lib/timezone";
import type { Ekadashi, PlannedNotification, Settings } from "@/types";

function shiftISODate(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + days));
  const yy = utc.getUTCFullYear();
  const mm = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(utc.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/**
 * iOS allows at most 64 pending local notifications. Stay well under that so
 * the OS does not silently drop later alarms. We fill the budget with the
 * soonest observances first (reminders, then repeating alarms).
 */
export const MAX_SCHEDULED_NOTIFICATIONS = 56;

export interface BuildPlanOptions {
  now: Date;
  settings: Settings;
  upcoming: Ekadashi[];
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

function leadPhrase(lead: number): string {
  if (lead === 0) return "is today";
  if (lead === 1) return "is tomorrow";
  return `is in ${lead} days`;
}

/**
 * Pure planner: turns settings + upcoming Ekadashis into a time-ordered list
 * of local notifications. Kept free of `expo-notifications` so it can be unit
 * tested in Node.
 */
export function buildNotificationPlan(options: BuildPlanOptions): PlannedNotification[] {
  const { now, settings, upcoming } = options;
  // Advance reminders and the persistent alarm are independent toggles.
  // Turning reminders off must not cancel an enabled alarm (and vice versa).
  if (!settings.notificationsEnabled && !settings.alarmEnabled) return [];

  const planned: PlannedNotification[] = [];
  const tz = settings.timezone;

  for (const e of upcoming) {
    if (settings.notificationsEnabled) {
      for (const lead of settings.leadDays) {
        const fireAt = wallTimeInZone(shiftISODate(e.date, -lead), settings.reminderTime, tz);
        if (fireAt.getTime() <= now.getTime()) continue;
        planned.push({
          key: `reminder:${e.id}:${lead}`,
          kind: "reminder",
          fireAt,
          title: `${e.name} Ekadashi ${lead === 0 ? "Today" : "Approaching"}`,
          body: `${e.name} Ekadashi ${leadPhrase(lead)}. Parana: ${e.parana.start}–${e.parana.end} on ${e.parana.date}.`,
          ekadashiId: e.id,
        });
      }
    }

    if (!settings.alarmEnabled) continue;

    const repeats = Math.max(0, Math.min(4, settings.alarmRepeatCount));
    const every = Math.max(1, settings.alarmRepeatMinutes);

    const morning = wallTimeInZone(e.date, settings.alarmTime, tz);
    for (let i = 0; i <= repeats; i += 1) {
      const fireAt = addMinutes(morning, i * every);
      if (fireAt.getTime() <= now.getTime()) continue;
      planned.push({
        key: `alarm-fasting:${e.id}:${i}`,
        kind: "alarm-fasting",
        fireAt,
        title: `Ekadashi Alarm — ${e.name}`,
        body:
          i === 0
            ? `Today is ${e.name} Ekadashi. Begin your fast and observance.`
            : `${e.name} Ekadashi continues. This is a persistent reminder (${i + 1}/${repeats + 1}).`,
        ekadashiId: e.id,
      });
    }

    const paranaStart = wallTimeInZone(e.parana.date, e.parana.start, tz);
    for (let i = 0; i <= repeats; i += 1) {
      const fireAt = addMinutes(paranaStart, i * every);
      const windowEnd = wallTimeInZone(e.parana.date, e.parana.end, tz);
      if (fireAt.getTime() <= now.getTime()) continue;
      if (fireAt.getTime() > windowEnd.getTime()) continue;
      planned.push({
        key: `alarm-parana:${e.id}:${i}`,
        kind: "alarm-parana",
        fireAt,
        title: "Parana Time — Break Your Fast",
        body:
          i === 0
            ? `The Parana window for ${e.name} Ekadashi is open (${e.parana.start}–${e.parana.end}).`
            : `Parana window is still open for ${e.name} (${e.parana.start}–${e.parana.end}).`,
        ekadashiId: e.id,
      });
    }
  }

  planned.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime());
  return planned.slice(0, MAX_SCHEDULED_NOTIFICATIONS);
}
