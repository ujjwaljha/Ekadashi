import rawData from "@/data/ekadashi-2026-2030.json";
import { formatLunarMonth, getCalendar } from "@/constants/calendars";
import { addDaysIso, julianDay, rashiIndex } from "@/lib/astronomy";
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

const CHAITRA_SHUKLA_1 = [
  "2026-03-19",
  "2027-04-06",
  "2028-03-26",
  "2029-03-15",
  "2030-04-03",
  "2031-03-23",
];
const KARTIK_SHUKLA_1 = [
  "2025-11-21",
  "2026-11-10",
  "2027-10-31",
  "2028-10-19",
  "2029-11-07",
  "2030-10-28",
  "2031-11-16",
];
const GAURA_PURNIMA = ["2026-03-03", "2027-03-22", "2028-03-11", "2029-03-01", "2030-03-19", "2031-03-08"];
const TAMIL_YEARS: { start: string; name: string; kali: number }[] = [
  { start: "2025-04-14", name: "Visvavasu", kali: 5126 },
  { start: "2026-04-14", name: "Parabhava", kali: 5127 },
  { start: "2027-04-14", name: "Plavanga", kali: 5128 },
  { start: "2028-04-14", name: "Kilaka", kali: 5129 },
  { start: "2029-04-14", name: "Saumya", kali: 5130 },
  { start: "2030-04-14", name: "Sadharana", kali: 5131 },
  { start: "2031-04-14", name: "Virodhikrit", kali: 5132 },
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

function lastOnOrBefore(iso: string, boundaries: string[]): string {
  let chosen = boundaries[0];
  for (const b of boundaries) {
    if (b <= iso) chosen = b;
    else break;
  }
  return chosen;
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
      const newYear = lastOnOrBefore(iso, CHAITRA_SHUKLA_1);
      const year = gregorianYear(newYear) - 78;
      return { year, name: "Shaka Samvat", label: `Saka ${year}` };
    }
    case "vikram-chaitra": {
      const newYear = lastOnOrBefore(iso, CHAITRA_SHUKLA_1);
      const year = gregorianYear(newYear) + 57;
      return { year, name: "Vikram Samvat", label: `V.S. ${year}` };
    }
    case "vikram-kartik": {
      const newYear = lastOnOrBefore(iso, KARTIK_SHUKLA_1);
      const year = gregorianYear(newYear) + 57;
      return { year, name: "Vikram Samvat", label: `V.S. ${year}` };
    }
    case "gaurabda": {
      const purnima = lastOnOrBefore(iso, GAURA_PURNIMA);
      const year = gregorianYear(purnima) - 1486;
      return { year, name: "Gaurabda", label: `Gaurabda ${year}` };
    }
    case "tamil": {
      let row = TAMIL_YEARS[0];
      for (const candidate of TAMIL_YEARS) {
        if (candidate.start <= iso) row = candidate;
      }
      return { year: row.kali, name: row.name, label: `${row.name} ${row.kali}` };
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

function smartaDate(record: EkadashiRecord): string {
  return record.smarta.date;
}

/**
 * Approximate sunrise tithi from the curated Ekadashi anchors.
 * Fasting days are forced to Ekadashi (11) so labels never drift from the dataset.
 */
export function getLunarDate(iso: string, records: EkadashiRecord[] = RECORDS): LunarDate {
  const sorted = [...records].sort((a, b) => (smartaDate(a) < smartaDate(b) ? -1 : 1));
  const exact = sorted.find((r) => smartaDate(r) === iso);
  if (exact) {
    return {
      tithi: 11,
      paksha: exact.paksha,
      monthPurnimanta: exact.monthPurnimanta,
      monthAmanta: exact.monthAmanta,
      adhika: Boolean(exact.adhika),
    };
  }

  let prev = sorted[0];
  let next = sorted[sorted.length - 1];
  for (let i = 0; i < sorted.length; i += 1) {
    if (smartaDate(sorted[i]) <= iso) prev = sorted[i];
    if (smartaDate(sorted[i]) >= iso) {
      next = sorted[i];
      break;
    }
  }

  const delta = isoDayDelta(smartaDate(prev), iso);
  let tithi = 11 + delta;
  let paksha = prev.paksha;
  let monthPurnimanta = prev.monthPurnimanta;
  let monthAmanta = prev.monthAmanta;
  let adhika = Boolean(prev.adhika);

  if (tithi > 15) {
    tithi -= 15;
    paksha = paksha === "Shukla" ? "Krishna" : "Shukla";
    monthPurnimanta = next.monthPurnimanta;
    monthAmanta = next.monthAmanta;
    adhika = Boolean(next.adhika);
  } else if (tithi < 1) {
    tithi += 15;
    paksha = paksha === "Shukla" ? "Krishna" : "Shukla";
  }

  if (tithi < 1) tithi = 1;
  if (tithi > 15) tithi = 15;

  return { tithi, paksha, monthPurnimanta, monthAmanta, adhika };
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
