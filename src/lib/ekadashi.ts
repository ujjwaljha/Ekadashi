import rawData from "@/data/ekadashi-2026-2027.json";
import { formatLunarMonth, getCalendar } from "@/constants/calendars";
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
}

export function queryFromSettings(settings: { tradition: TraditionId; calendarId: CalendarId }): EkadashiQuery {
  return { tradition: settings.tradition, calendarId: settings.calendarId };
}

const DEFAULT_QUERY: Required<EkadashiQuery> = {
  tradition: "smarta",
  calendarId: "north-indian",
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

export function resolveEkadashi(
  record: EkadashiRecord,
  tradition: TraditionId = DEFAULT_QUERY.tradition,
  calendarId: CalendarId = DEFAULT_QUERY.calendarId
): Ekadashi {
  const dates = traditionDates(record, tradition);
  const calendar = getCalendar(calendarId);
  const monthKey = calendar.monthSystem === "amanta" ? record.monthAmanta : record.monthPurnimanta;
  const other = tradition === "smarta" ? record.vaishnava : record.smarta;
  const displayName = record.names?.[calendarId] ?? record.name;

  return {
    id: record.id,
    date: dates.date,
    name: displayName,
    paksha: record.paksha,
    month: formatLunarMonth(monthKey, Boolean(record.adhika), calendarId),
    parana: dates.parana,
    significance: record.significance,
    tradition,
    calendarId,
    adhika: Boolean(record.adhika),
    monthKey,
    otherTraditionDate:
      other.date !== dates.date ? { tradition: tradition === "smarta" ? "vaishnava" : "smarta", date: other.date } : undefined,
  };
}

function resolveAll(query: EkadashiQuery = {}): Ekadashi[] {
  const tradition = query.tradition ?? DEFAULT_QUERY.tradition;
  const calendarId = query.calendarId ?? DEFAULT_QUERY.calendarId;
  return RECORDS.map((record) => resolveEkadashi(record, tradition, calendarId)).sort((a, b) =>
    compareISO(a.date, b.date)
  );
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

export function getEkadashiByDate(
  iso: string,
  query: EkadashiQuery = {}
): Ekadashi | undefined {
  return resolveAll(query).find((e) => e.date === iso);
}

export function getEkadashiById(id: string, query: EkadashiQuery = {}): Ekadashi | undefined {
  const record = RECORDS.find((e) => e.id === id);
  if (!record) return undefined;
  return resolveEkadashi(
    record,
    query.tradition ?? DEFAULT_QUERY.tradition,
    query.calendarId ?? DEFAULT_QUERY.calendarId
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
