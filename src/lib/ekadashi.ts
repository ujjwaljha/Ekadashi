import smartaRaw from "@/data/ekadashi-2026-2027.json";
import vaishnavaRaw from "@/data/ekadashi-vaishnava-2026-2027.json";
import { compareISO, isoDayDelta, todayISO } from "@/lib/timezone";
import type { CalendarTradition, Ekadashi, EkadashiDataset, Observance } from "@/types";

const DATASETS: Record<CalendarTradition, EkadashiDataset> = {
  smarta: smartaRaw as EkadashiDataset,
  vaishnava: vaishnavaRaw as EkadashiDataset,
};

function sortCatalog(dataset: EkadashiDataset): Ekadashi[] {
  return [...dataset.ekadashis].sort((a, b) => compareISO(a.date, b.date));
}

const CATALOG: Record<CalendarTradition, Ekadashi[]> = {
  smarta: sortCatalog(DATASETS.smarta),
  vaishnava: sortCatalog(DATASETS.vaishnava),
};

function resolveTradition(tradition: CalendarTradition = "smarta"): CalendarTradition {
  return tradition === "vaishnava" ? "vaishnava" : "smarta";
}

function catalog(tradition: CalendarTradition = "smarta"): Ekadashi[] {
  return CATALOG[resolveTradition(tradition)];
}

export function getDatasetMeta(tradition: CalendarTradition = "smarta"): EkadashiDataset["meta"] {
  return DATASETS[resolveTradition(tradition)].meta;
}

export function getAllEkadashis(tradition: CalendarTradition = "smarta"): Ekadashi[] {
  return catalog(tradition);
}

/** The next Ekadashi on or after the zoned "today", or null if none remain. */
export function getNextEkadashi(
  now: Date = new Date(),
  timezone = "device",
  tradition: CalendarTradition = "smarta"
): Ekadashi | null {
  const today = todayISO(now, timezone);
  return catalog(tradition).find((e) => compareISO(e.date, today) >= 0) ?? null;
}

/** The next `count` Ekadashis on or after the zoned "today". */
export function getUpcomingEkadashis(
  count: number,
  now: Date = new Date(),
  timezone = "device",
  tradition: CalendarTradition = "smarta"
): Ekadashi[] {
  const today = todayISO(now, timezone);
  return catalog(tradition)
    .filter((e) => compareISO(e.date, today) >= 0)
    .slice(0, count);
}

/** All Ekadashis whose fasting date falls in the given (1-indexed month) year. */
export function getEkadashisInMonth(
  year: number,
  monthIndex: number,
  tradition: CalendarTradition = "smarta"
): Ekadashi[] {
  const prefix = `${year}-${String(monthIndex + 1).padStart(2, "0")}-`;
  return catalog(tradition).filter((e) => e.date.startsWith(prefix));
}

export function getEkadashiByDate(
  iso: string,
  tradition: CalendarTradition = "smarta"
): Ekadashi | undefined {
  return catalog(tradition).find((e) => e.date === iso);
}

/**
 * Look up by fasting-date id. Prefers the active tradition, then falls back
 * so a leftover notification from the other calendar still resolves.
 */
export function getEkadashiById(
  id: string,
  tradition: CalendarTradition = "smarta"
): Ekadashi | undefined {
  const preferred = resolveTradition(tradition);
  const other: CalendarTradition = preferred === "vaishnava" ? "smarta" : "vaishnava";
  return CATALOG[preferred].find((e) => e.id === id) ?? CATALOG[other].find((e) => e.id === id);
}

export function getYearRange(tradition: CalendarTradition = "smarta"): { min: number; max: number } {
  const years = catalog(tradition).map((e) => Number(e.date.slice(0, 4)));
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
export function getObservance(
  now: Date,
  timezone = "device",
  tradition: CalendarTradition = "smarta"
): Observance {
  const today = todayISO(now, timezone);
  const all = catalog(tradition);
  const parana = all.find((e) => e.parana.date === today);
  if (parana) return { kind: "parana", ekadashi: parana };
  const fasting = all.find((e) => e.date === today);
  if (fasting) return { kind: "fasting", ekadashi: fasting };
  return { kind: "none", ekadashi: null };
}
