/**
 * Timezone helpers built on `Intl.DateTimeFormat` so wall-clock times in a
 * chosen IANA zone (or the device clock) convert to real `Date` instants.
 * No extra date library is required — Hermes and modern JS engines ship Intl.
 */

export const DEVICE_TIMEZONE = "device";

export function resolveTimezone(timezone: string): string {
  if (!timezone || timezone === DEVICE_TIMEZONE) {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  }
  return timezone;
}

export interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Read calendar parts of `date` as they appear in `timezone`. */
export function getZonedParts(date: Date, timezone: string): ZonedParts {
  const tz = resolveTimezone(timezone);
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(dtf.formatToParts(date).map((p) => [p.type, p.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

/** YYYY-MM-DD of `date` in the selected timezone. */
export function zonedISODate(date: Date, timezone: string): string {
  const p = getZonedParts(date, timezone);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

/** Offset (ms) of `timezone` at the given instant: zonedWall - UTC. */
function offsetAt(date: Date, timezone: string): number {
  const p = getZonedParts(date, timezone);
  const asUTC = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUTC - date.getTime();
}

/**
 * Build a `Date` that displays as `isoDate` + `hhmm` in `timezone`.
 * Two-pass offset correction handles DST transitions.
 */
export function wallTimeInZone(isoDate: string, hhmm: string, timezone: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  const [hour, minute] = hhmm.split(":").map(Number);

  if (!timezone || timezone === DEVICE_TIMEZONE) {
    return new Date(year, month - 1, day, hour, minute, 0, 0);
  }

  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));
  const first = new Date(utcGuess.getTime() - offsetAt(utcGuess, timezone));
  return new Date(first.getTime() - (offsetAt(first, timezone) - offsetAt(utcGuess, timezone)));
}

/** Local-calendar "today" ISO date in the selected timezone. */
export function todayISO(now: Date, timezone: string): string {
  if (!timezone || timezone === DEVICE_TIMEZONE) {
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }
  return zonedISODate(now, timezone);
}

/** Compare two YYYY-MM-DD strings. */
export function compareISO(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/** Whole days from `fromISO` until `toISO` (negative if in the past). */
export function isoDayDelta(fromISO: string, toISO: string): number {
  const [fy, fm, fd] = fromISO.split("-").map(Number);
  const [ty, tm, td] = toISO.split("-").map(Number);
  const from = Date.UTC(fy, fm - 1, fd);
  const to = Date.UTC(ty, tm - 1, td);
  return Math.round((to - from) / 86_400_000);
}
