import rawData from "@/data/ekadashi-2026-2030.json";
import { formatLunarMonth, getCalendar } from "@/constants/calendars";
import { DEFAULT_CITY_ID, getCity } from "@/constants/cities";
import { buildRecord, inferLunarContext, nameFromContext } from "@/lib/ekadashiCatalog";
import {
  calculateParana,
  computeFastsInRange,
  findLocalFastDate,
  type ComputedFast,
} from "@/lib/ekadashiCompute";
import { addDaysIso } from "@/lib/astronomy";
import { compareISO, isoDayDelta, todayISO } from "@/lib/timezone";
import type {
  CalendarId,
  Ekadashi,
  EkadashiDataset,
  EkadashiRecord,
  Observance,
  TraditionId,
} from "@/types";

const DATASET = rawData as EkadashiDataset;
const RECORDS: EkadashiRecord[] = [...DATASET.ekadashis];

export interface EkadashiQuery {
  tradition?: TraditionId;
  calendarId?: CalendarId;
  cityId?: string;
}

export function queryFromSettings(settings: {
  tradition: TraditionId;
  calendarId: CalendarId;
  cityId?: string;
}): EkadashiQuery {
  return { tradition: settings.tradition, calendarId: settings.calendarId, cityId: settings.cityId };
}

const DEFAULT_QUERY: Required<EkadashiQuery> = {
  tradition: "smarta",
  calendarId: "north-indian",
  cityId: DEFAULT_CITY_ID,
};

export function getDatasetMeta(): EkadashiDataset["meta"] {
  return DATASET.meta;
}

export function getEkadashiRecords(): EkadashiRecord[] {
  return RECORDS;
}

function traditionDates(record: EkadashiRecord, tradition: TraditionId) {
  return record[tradition];
}

function localizeDate(
  publishedIso: string,
  cityId: string,
  tradition: TraditionId
): { date: string; source: "published" | "calculated"; localAdjusted: boolean } {
  const city = getCity(cityId);
  if (city.usePublishedDates) {
    return { date: publishedIso, source: "published", localAdjusted: false };
  }
  const found = findLocalFastDate(publishedIso, city, tradition);
  if (found && found !== publishedIso) {
    return { date: found, source: "calculated", localAdjusted: true };
  }
  return { date: publishedIso, source: found ? "published" : "calculated", localAdjusted: false };
}

export function resolveEkadashi(
  record: EkadashiRecord,
  tradition: TraditionId = DEFAULT_QUERY.tradition,
  calendarId: CalendarId = DEFAULT_QUERY.calendarId,
  cityId: string = DEFAULT_QUERY.cityId
): Ekadashi {
  const dates = traditionDates(record, tradition);
  const city = getCity(cityId);
  const localized = localizeDate(dates.date, cityId, tradition);
  const calendar = getCalendar(calendarId);
  const monthKey = calendar.monthSystem === "amanta" ? record.monthAmanta : record.monthPurnimanta;
  const other = tradition === "smarta" ? record.vaishnava : record.smarta;
  const otherLocalized = localizeDate(
    other.date,
    cityId,
    tradition === "smarta" ? "vaishnava" : "smarta"
  );
  const displayName = record.names?.[calendarId] ?? record.name;
  const parana = calculateParana(localized.date, city, tradition);
  const recordSource = record.origin === "calculated" ? "calculated" : localized.source;

  return {
    id: record.id,
    date: localized.date,
    name: displayName,
    paksha: record.paksha,
    month: formatLunarMonth(monthKey, Boolean(record.adhika), calendarId),
    parana,
    significance: record.significance,
    tradition,
    calendarId,
    adhika: Boolean(record.adhika),
    monthKey,
    otherTraditionDate:
      otherLocalized.date !== localized.date
        ? { tradition: tradition === "smarta" ? "vaishnava" : "smarta", date: otherLocalized.date }
        : undefined,
    source: recordSource,
    localAdjusted: localized.localAdjusted,
  };
}

function pairComputedFasts(smarta: ComputedFast[], vaishnava: ComputedFast[]): EkadashiRecord[] {
  const used = new Set<string>();
  const records: EkadashiRecord[] = [];
  for (const s of smarta) {
    const match =
      vaishnava.find(
        (v) =>
          !used.has(v.date) &&
          v.date >= s.date &&
          v.date <= addDaysIso(s.date, 2) &&
          v.paksha === s.paksha
      ) ?? s;
    used.add(match.date);
    const ctx = inferLunarContext(s.date);
    const name = nameFromContext(ctx.paksha, ctx.monthPurnimanta, false);
    records.push(
      buildRecord({
        name,
        smartaDate: s.date,
        vaishnavaDate: match.date,
        smartaParana: s.parana,
        vaishnavaParana: match.parana,
        origin: "calculated",
        paksha: ctx.paksha,
        monthPurnimanta: ctx.monthPurnimanta,
      })
    );
  }
  return records;
}

/** Astronomy fallback when a civil year is missing from the bundled file. */
export function calculateRecordsInRange(startIso: string, endIso: string, cityId = DEFAULT_CITY_ID): EkadashiRecord[] {
  const city = getCity(cityId);
  return pairComputedFasts(
    computeFastsInRange(startIso, endIso, city, "smarta"),
    computeFastsInRange(startIso, endIso, city, "vaishnava")
  );
}

const resolveCache = new Map<string, Ekadashi[]>();

function resolveAll(query: EkadashiQuery = {}): Ekadashi[] {
  const tradition = query.tradition ?? DEFAULT_QUERY.tradition;
  const calendarId = query.calendarId ?? DEFAULT_QUERY.calendarId;
  const cityId = query.cityId ?? DEFAULT_QUERY.cityId;
  const key = `${cityId}|${tradition}|${calendarId}`;
  const cached = resolveCache.get(key);
  if (cached) return cached;

  const list = RECORDS.map((record) => resolveEkadashi(record, tradition, calendarId, cityId)).sort((a, b) =>
    compareISO(a.date, b.date)
  );
  resolveCache.set(key, list);
  return list;
}

export function getAllEkadashis(query: EkadashiQuery = {}): Ekadashi[] {
  return resolveAll(query);
}

/** The next Ekadashi on or after the zoned "today", or null if none remain. */
export function getNextEkadashi(
  now: Date = new Date(),
  timezone = "device",
  query: EkadashiQuery = {}
): Ekadashi | null {
  const today = todayISO(now, timezone);
  return resolveAll(query).find((e) => compareISO(e.date, today) >= 0) ?? null;
}

/** The next `count` Ekadashis on or after the zoned "today". */
export function getUpcomingEkadashis(
  count: number,
  now: Date = new Date(),
  timezone = "device",
  query: EkadashiQuery = {}
): Ekadashi[] {
  const today = todayISO(now, timezone);
  return resolveAll(query)
    .filter((e) => compareISO(e.date, today) >= 0)
    .slice(0, count);
}

/** All Ekadashis whose fasting date falls in the given (0-indexed) Gregorian month. */
export function getEkadashisInMonth(
  year: number,
  monthIndex: number,
  query: EkadashiQuery = {}
): Ekadashi[] {
  const prefix = `${year}-${String(monthIndex + 1).padStart(2, "0")}-`;
  return resolveAll(query).filter((e) => e.date.startsWith(prefix));
}

export function getEkadashiByDate(iso: string, query: EkadashiQuery = {}): Ekadashi | undefined {
  return resolveAll(query).find((e) => e.date === iso);
}

export function getEkadashiById(id: string, query: EkadashiQuery = {}): Ekadashi | undefined {
  const record = RECORDS.find((e) => e.id === id);
  if (!record) return undefined;
  return resolveEkadashi(
    record,
    query.tradition ?? DEFAULT_QUERY.tradition,
    query.calendarId ?? DEFAULT_QUERY.calendarId,
    query.cityId ?? DEFAULT_QUERY.cityId
  );
}

export function getYearRange(): { min: number; max: number } {
  const years = RECORDS.flatMap((e) => [Number(e.smarta.date.slice(0, 4)), Number(e.vaishnava.date.slice(0, 4))]);
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
export function getObservance(now: Date, timezone = "device", query: EkadashiQuery = {}): Observance {
  const today = todayISO(now, timezone);
  const all = resolveAll(query);
  const parana = all.find((e) => e.parana.date === today);
  if (parana) return { kind: "parana", ekadashi: parana };
  const fasting = all.find((e) => e.date === today);
  if (fasting) return { kind: "fasting", ekadashi: fasting };
  return { kind: "none", ekadashi: null };
}
