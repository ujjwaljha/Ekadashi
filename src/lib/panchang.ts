import rawData from "@/data/ekadashi-2026-2030.json";
import { formatLunarMonth, getCalendar } from "@/constants/calendars";
import { addDaysIso, julianDay, rashiIndex } from "@/lib/astronomy";
import {
  chaitraShukla1,
  gauraPurnima,
  kaliYear,
  kartikShukla1,
  lunarContextForIso,
  meshaSankrantiIso,
  samvatsaraName,
} from "@/lib/lunarMonth";
import { isoDayDelta } from "@/lib/timezone";
import type {
  CalendarId,
  EkadashiDataset,
  EkadashiRecord,
  EraId,
  HinduMonth,
  Paksha,
  PanchangDay,
} from "@/types";

const RECORDS: EkadashiRecord[] = (rawData as EkadashiDataset).ekadashis;

const TITHI_NAMES = [
  "",
  "Pratipada",
  "Dwitiya",
  "Tritiya",
  "Chaturthi",
  "Panchami",
  "Shashthi",
  "Saptami",
  "Ashtami",
  "Navami",
  "Dashami",
  "Ekadashi",
  "Dwadashi",
  "Trayodashi",
  "Chaturdashi",
  "Purnima",
];

export interface SolarDate {
  monthIndex: number;
  day: number;
  startIso: string;
}

export interface LunarDate {
  tithi: number;
  paksha: Paksha;
  monthPurnimanta: HinduMonth;
  monthAmanta: HinduMonth;
  adhika: boolean;
}

/**
 * Gregorian year whose lunar new-year day (per `boundaryFor`) is the latest
 * one on or before `iso`.
 */
function lunarYearStartingBefore(iso: string, boundaryFor: (year: number) => string): number {
  const y = gregorianYear(iso);
  return iso >= boundaryFor(y) ? y : y - 1;
}

function gregorianYear(iso: string): number {
  return Number(iso.slice(0, 4));
}

export function getSolarDate(iso: string): SolarDate {
  const [y, m, d] = iso.split("-").map(Number);
  const monthIndex = rashiIndex(julianDay(y, m, d, 6.5));
  let startIso = iso;
  let cursor = iso;
  for (let i = 0; i < 32; i += 1) {
    const prev = addDaysIso(cursor, -1);
    const [py, pm, pd] = prev.split("-").map(Number);
    if (rashiIndex(julianDay(py, pm, pd, 6.5)) !== monthIndex) {
      startIso = cursor;
      break;
    }
    cursor = prev;
  }
  return {
    monthIndex,
    day: isoDayDelta(startIso, iso) + 1,
    startIso,
  };
}

export function eraYear(iso: string, era: EraId): { year: number; name: string; label: string } {
  const y = gregorianYear(iso);
  switch (era) {
    case "lakshman": {
      const year = iso >= `${y}-04-14` ? y - 1118 : y - 1119;
      return { year, name: "Lakshman Samvat", label: `L.S. ${year}` };
    }
    case "nepali": {
      const year = iso >= `${y}-04-14` ? y + 57 : y + 56;
      return { year, name: "Bikram Sambat", label: `B.S. ${year}` };
    }
    case "bengali": {
      const year = iso >= `${y}-04-15` ? y - 593 : y - 594;
      return { year, name: "Bengali San", label: `B.E. ${year}` };
    }
    case "kollam": {
      const year = iso >= `${y}-08-17` ? y - 824 : y - 825;
      return { year, name: "Kollam Era", label: `K.E. ${year}` };
    }
    case "saka": {
      const year = lunarYearStartingBefore(iso, chaitraShukla1) - 78;
      return { year, name: "Shaka Samvat", label: `Saka ${year}` };
    }
    case "vikram-chaitra": {
      const year = lunarYearStartingBefore(iso, chaitraShukla1) + 57;
      return { year, name: "Vikram Samvat", label: `V.S. ${year}` };
    }
    case "vikram-kartik": {
      const year = lunarYearStartingBefore(iso, kartikShukla1) + 57;
      return { year, name: "Vikram Samvat", label: `V.S. ${year}` };
    }
    case "gaurabda": {
      const year = lunarYearStartingBefore(iso, gauraPurnima) - 1486;
      return { year, name: "Gaurabda", label: `Gaurabda ${year}` };
    }
    case "tamil": {
      const start = lunarYearStartingBefore(iso, meshaSankrantiIso);
      const name = samvatsaraName(start);
      const kali = kaliYear(start);
      return { year: kali, name, label: `${name} ${kali}` };
    }
    default: {
      return { year: y, name: "Gregorian", label: String(y) };
    }
  }
}

function tithiName(tithi: number, paksha: Paksha): string {
  if (tithi === 15) return paksha === "Shukla" ? "Purnima" : "Amavasya";
  return TITHI_NAMES[tithi] ?? `Tithi ${tithi}`;
}

const FAST_DAYS = new Map(RECORDS.map((record) => [record.smarta.date, record]));
const lunarCache = new Map<string, LunarDate>();

/**
 * Sunrise tithi, paksha and lunar month (New Delhi reference). Published
 * fasting days are pinned to Ekadashi (11) so labels never contradict the
 * bundled dates; every other day comes straight from the ephemeris.
 */
export function getLunarDate(iso: string, records?: EkadashiRecord[]): LunarDate {
  const exact = records ? records.find((r) => r.smarta.date === iso) : FAST_DAYS.get(iso);
  if (exact) {
    return {
      tithi: 11,
      paksha: exact.paksha,
      monthPurnimanta: exact.monthPurnimanta,
      monthAmanta: exact.monthAmanta,
      adhika: Boolean(exact.adhika),
    };
  }
  const cached = lunarCache.get(iso);
  if (cached) return cached;
  const ctx = lunarContextForIso(iso);
  const lunar: LunarDate = {
    tithi: ctx.tithi,
    paksha: ctx.paksha,
    monthPurnimanta: ctx.monthPurnimanta,
    monthAmanta: ctx.monthAmanta,
    adhika: ctx.adhika,
  };
  if (lunarCache.size > 5000) lunarCache.clear();
  lunarCache.set(iso, lunar);
  return lunar;
}

export function getPanchangDay(iso: string, calendarId: CalendarId): PanchangDay {
  const calendar = getCalendar(calendarId);
  const solar = getSolarDate(iso);
  const lunar = getLunarDate(iso);
  const era = eraYear(iso, calendar.era);
  const monthKey = calendar.monthSystem === "amanta" ? lunar.monthAmanta : lunar.monthPurnimanta;
  const lunarMonth = formatLunarMonth(monthKey, lunar.adhika, calendarId);
  const tithi = lunar.tithi;
  const weekday = new Date(`${iso}T12:00:00Z`).getUTCDay();

  const solarMonth = calendar.solarMonths[solar.monthIndex] ?? calendar.solarMonths[0];
  const solarLabel = `${solarMonth.name} ${solar.day}`;

  let civilLabel: string;
  let civilShort: string;
  if (calendar.civilKind === "solar") {
    civilLabel = `${solarLabel}, ${era.label}`;
    civilShort = `${solar.day} ${solarMonth.name.slice(0, 3)}`;
  } else {
    civilLabel = `${lunarMonth} ${lunar.paksha} ${tithiName(tithi, lunar.paksha)}, ${era.label}`;
    civilShort = `${tithi} ${lunar.paksha.slice(0, 1)}`;
  }

  return {
    iso,
    calendarId,
    eraYear: era.year,
    eraName: era.name,
    eraLabel: era.label,
    civilLabel,
    civilShort,
    lunarMonth,
    lunarPaksha: lunar.paksha,
    tithi,
    tithiName: tithiName(tithi, lunar.paksha),
    adhika: lunar.adhika,
    weekday,
  };
}

export function formatPanchangLong(iso: string, calendarId: CalendarId): string {
  const day = getPanchangDay(iso, calendarId);
  const calendar = getCalendar(calendarId);
  if (calendar.civilKind === "solar") {
    return `${day.civilLabel} · ${day.lunarMonth} ${day.lunarPaksha} ${day.tithiName}`;
  }
  return day.civilLabel;
}

export function formatPanchangShort(iso: string, calendarId: CalendarId): string {
  return getPanchangDay(iso, calendarId).civilShort;
}
