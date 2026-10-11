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
import { getSolarDate } from "@/lib/panchang";
import { compareISO, getZonedParts, isoDayDelta, todayISO } from "@/lib/timezone";
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

const DATASET_YEARS = RECORDS.flatMap((e) => [
  Number(e.smarta.date.slice(0, 4)),
  Number(e.vaishnava.date.slice(0, 4)),
]);
/** First and last civil year with bundled (published) dates. */
export const DATASET_MIN_YEAR = Math.min(...DATASET_YEARS);
export const DATASET_MAX_YEAR = Math.max(...DATASET_YEARS);

/** Furthest year ever calculated beyond the bundled file. */
const MAX_CALCULATED_YEAR = DATASET_MAX_YEAR + 70;

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

function zonedYear(now: Date, timezone: string): number {
  return getZonedParts(now, timezone).year;
}

/**
 * Last year the app should be able to show for `now`: the bundled range,
 * extended by astronomy so the calendar always reaches next year.
 */
export function horizonYear(now: Date = new Date(), timezone = "device"): number {
  return Math.min(MAX_CALCULATED_YEAR, Math.max(DATASET_MAX_YEAR, zonedYear(now, timezone) + 1));
}

const calculatedYearCache = new Map<string, EkadashiRecord[]>();

/** Astronomy records for one civil year beyond the bundled file, per city. */
function calculatedRecordsForYear(year: number, cityId: string): EkadashiRecord[] {
  const key = `${cityId}|${year}`;
  const cached = calculatedYearCache.get(key);
  if (cached) return cached;
  const records = calculateRecordsInRange(`${year}-01-01`, `${year}-12-31`, cityId).filter(
    (record) => Number(record.smarta.date.slice(0, 4)) === year
  );
  calculatedYearCache.set(key, records);
  return records;
}

/**
 * Bundled records plus calculated years up to and including `throughYear`.
 * India / Nepal cities share the New Delhi reference, like the published
 * file; distant cities are calculated from their own sunrise.
 */
function recordsThrough(throughYear: number, cityId: string): EkadashiRecord[] {
  const last = Math.min(MAX_CALCULATED_YEAR, throughYear);
  if (last <= DATASET_MAX_YEAR) return RECORDS;
  const referenceCityId = getCity(cityId).usePublishedDates ? DEFAULT_CITY_ID : cityId;
  const extra: EkadashiRecord[] = [];
  for (let year = DATASET_MAX_YEAR + 1; year <= last; year += 1) {
    extra.push(...calculatedRecordsForYear(year, referenceCityId));
  }
  return [...RECORDS, ...extra];
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

/** Solar-month names used in the South: 8 = Dhanu (Margazhi), 7 = Vrischika. */
const DHANU = 8;
const VRISCHIKA = 7;

/**
 * Vaikuntha and Guruvayur Ekadashi follow the solar month, so they attach
 * to Mokshada in most years and to Pausha Putrada in others.
 */
function solarRegionalName(record: EkadashiRecord, calendarId: CalendarId, iso: string): string | undefined {
  if (record.paksha !== "Shukla" || (calendarId !== "tamil" && calendarId !== "malayalam")) return undefined;
  const solarMonth = getSolarDate(iso).monthIndex;
  if (solarMonth === DHANU) return "Vaikuntha";
  if (calendarId === "malayalam" && solarMonth === VRISCHIKA) return "Guruvayur";
  return undefined;
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
  const displayName =
    solarRegionalName(record, calendarId, record.smarta.date) ?? record.names?.[calendarId] ?? record.name;
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
    const name = nameFromContext(ctx.paksha, ctx.monthPurnimanta, ctx.adhika);
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
        adhika: ctx.adhika,
      })
    );
  }
  return records;
}

/** Astronomy fallback when a civil year is missing from the bundled file. */
export function calculateRecordsInRange(startIso: string, endIso: string, cityId = DEFAULT_CITY_ID): EkadashiRecord[] {
  const city = getCity(cityId);
  // Scan a margin so a Vaishnava fast shifted across the range edge still pairs.
  return pairComputedFasts(
    computeFastsInRange(startIso, endIso, city, "smarta"),
    computeFastsInRange(addDaysIso(startIso, -1), addDaysIso(endIso, 2), city, "vaishnava")
  );
}

const resolveCache = new Map<string, Ekadashi[]>();

function resolveAll(query: EkadashiQuery = {}, throughYear = DATASET_MAX_YEAR): Ekadashi[] {
  const tradition = query.tradition ?? DEFAULT_QUERY.tradition;
  const calendarId = query.calendarId ?? DEFAULT_QUERY.calendarId;
  const cityId = query.cityId ?? DEFAULT_QUERY.cityId;
  const last = Math.max(DATASET_MAX_YEAR, Math.min(MAX_CALCULATED_YEAR, throughYear));
  const key = `${cityId}|${tradition}|${calendarId}|${last}`;
  const cached = resolveCache.get(key);
  if (cached) return cached;

  const list = recordsThrough(last, cityId)
    .map((record) => resolveEkadashi(record, tradition, calendarId, cityId))
    .sort((a, b) => compareISO(a.date, b.date));
  if (resolveCache.size > 64) resolveCache.clear();
  resolveCache.set(key, list);
  return list;
}

/** Every Ekadashi through the horizon for `now` (bundled years plus calculated ones). */
export function getAllEkadashis(
  query: EkadashiQuery = {},
  now: Date = new Date(),
  timezone = "device"
): Ekadashi[] {
  return resolveAll(query, horizonYear(now, timezone));
}

/** The next Ekadashi on or after the zoned "today", or null if none could be calculated. */
export function getNextEkadashi(
  now: Date = new Date(),
  timezone = "device",
  query: EkadashiQuery = {}
): Ekadashi | null {
  const today = todayISO(now, timezone);
  return resolveAll(query, horizonYear(now, timezone)).find((e) => compareISO(e.date, today) >= 0) ?? null;
}

/** The next `count` Ekadashis on or after the zoned "today". */
export function getUpcomingEkadashis(
  count: number,
  now: Date = new Date(),
  timezone = "device",
  query: EkadashiQuery = {}
): Ekadashi[] {
  const today = todayISO(now, timezone);
  return resolveAll(query, horizonYear(now, timezone))
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
  return resolveAll(query, year).filter((e) => e.date.startsWith(prefix));
}

export function getEkadashiByDate(iso: string, query: EkadashiQuery = {}): Ekadashi | undefined {
  return resolveAll(query, Number(iso.slice(0, 4))).find((e) => e.date === iso);
}

export function getEkadashiById(id: string, query: EkadashiQuery = {}): Ekadashi | undefined {
  const year = Number(id.slice(0, 4));
  const cityId = query.cityId ?? DEFAULT_QUERY.cityId;
  const record = recordsThrough(Number.isFinite(year) ? year : DATASET_MAX_YEAR, cityId).find((e) => e.id === id);
  if (!record) return undefined;
  return resolveEkadashi(record, query.tradition ?? DEFAULT_QUERY.tradition, query.calendarId ?? DEFAULT_QUERY.calendarId, cityId);
}

/** Years the calendar can show: bundled years, extended by astronomy as time passes. */
export function getYearRange(now: Date = new Date(), timezone = "device"): { min: number; max: number } {
  return { min: DATASET_MIN_YEAR, max: horizonYear(now, timezone) };
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
  const all = resolveAll(query, horizonYear(now, timezone));
  const parana = all.find((e) => e.parana.date === today);
  if (parana) return { kind: "parana", ekadashi: parana };
  const fasting = all.find((e) => e.date === today);
  if (fasting) return { kind: "fasting", ekadashi: fasting };
  return { kind: "none", ekadashi: null };
}
