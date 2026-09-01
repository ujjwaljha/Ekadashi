import rawData from "@/data/ekadashi-2026-2027.json";
import { compareISO, isoDayDelta, todayISO } from "@/lib/timezone";
import type { Ekadashi, EkadashiDataset, Observance } from "@/types";

const DATASET = rawData as EkadashiDataset;

const ALL: Ekadashi[] = [...DATASET.ekadashis].sort((a, b) => compareISO(a.date, b.date));

export function getDatasetMeta(): EkadashiDataset["meta"] {
  return DATASET.meta;
}

export function getAllEkadashis(): Ekadashi[] {
  return ALL;
}

/** The next Ekadashi on or after the zoned "today", or null if none remain. */
export function getNextEkadashi(now: Date = new Date(), timezone = "device"): Ekadashi | null {
  const today = todayISO(now, timezone);
  return ALL.find((e) => compareISO(e.date, today) >= 0) ?? null;
}

/** The next `count` Ekadashis on or after the zoned "today". */
export function getUpcomingEkadashis(
  count: number,
  now: Date = new Date(),
  timezone = "device"
): Ekadashi[] {
  const today = todayISO(now, timezone);
  return ALL.filter((e) => compareISO(e.date, today) >= 0).slice(0, count);
}

/** All Ekadashis whose fasting date falls in the given (1-indexed month) year. */
export function getEkadashisInMonth(year: number, monthIndex: number): Ekadashi[] {
  const prefix = `${year}-${String(monthIndex + 1).padStart(2, "0")}-`;
  return ALL.filter((e) => e.date.startsWith(prefix));
}

export function getEkadashiByDate(iso: string): Ekadashi | undefined {
  return ALL.find((e) => e.date === iso);
}

export function getEkadashiById(id: string): Ekadashi | undefined {
  return ALL.find((e) => e.id === id);
}

export function getYearRange(): { min: number; max: number } {
  const years = ALL.map((e) => Number(e.date.slice(0, 4)));
  return { min: Math.min(...years), max: Math.max(...years) };
}

/** Whole days from zoned "today" until the fasting date. */
export function daysUntil(iso: string, now: Date = new Date(), timezone = "device"): number {
  return isoDayDelta(todayISO(now, timezone), iso);
}

/**
 * Whether `now` (in the selected timezone) is a fasting day or a Parana day.
 * Parana wins if both somehow overlap (they never do in this dataset).
 */
export function getObservance(now: Date, timezone = "device"): Observance {
  const today = todayISO(now, timezone);
  const parana = ALL.find((e) => e.parana.date === today);
  if (parana) return { kind: "parana", ekadashi: parana };
  const fasting = ALL.find((e) => e.date === today);
  if (fasting) return { kind: "fasting", ekadashi: fasting };
  return { kind: "none", ekadashi: null };
}
