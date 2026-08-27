import rawData from "@/data/ekadashi-2026-2027.json";
import type { Ekadashi } from "@/types";

// The static dataset, sorted ascending by date. Imported once at module load.
const ALL: Ekadashi[] = [...(rawData as Ekadashi[])].sort((a, b) =>
  a.date < b.date ? -1 : a.date > b.date ? 1 : 0
);

export function getAllEkadashis(): Ekadashi[] {
  return ALL;
}

/** Parse a `YYYY-MM-DD` string into a local Date at midnight (TZ-safe). */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Local midnight for a given date, so day comparisons ignore the clock time. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Whole days from `from` until the given ISO date (negative if in the past). */
export function daysUntil(iso: string, from: Date = new Date()): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((parseISODate(iso).getTime() - startOfDay(from).getTime()) / msPerDay);
}

/** The next Ekadashi occurring on or after `from`, or null if none remain. */
export function getNextEkadashi(from: Date = new Date()): Ekadashi | null {
  const today = startOfDay(from);
  return ALL.find((e) => parseISODate(e.date) >= today) ?? null;
}

/** The next `count` Ekadashis on or after `from`. */
export function getUpcomingEkadashis(count: number, from: Date = new Date()): Ekadashi[] {
  const today = startOfDay(from);
  return ALL.filter((e) => parseISODate(e.date) >= today).slice(0, count);
}

/** All Ekadashis whose fasting date falls in the given (0-indexed) month/year. */
export function getEkadashisInMonth(year: number, monthIndex: number): Ekadashi[] {
  return ALL.filter((e) => {
    const d = parseISODate(e.date);
    return d.getFullYear() === year && d.getMonth() === monthIndex;
  });
}

/** Lookup an Ekadashi by its fasting date, if any. */
export function getEkadashiByDate(iso: string): Ekadashi | undefined {
  return ALL.find((e) => e.date === iso);
}

/** The inclusive [min, max] year range covered by the dataset. */
export function getYearRange(): { min: number; max: number } {
  const years = ALL.map((e) => parseISODate(e.date).getFullYear());
  return { min: Math.min(...years), max: Math.max(...years) };
}
