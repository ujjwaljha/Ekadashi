/**
 * Lunar-month reckoning from new moons and solar sankrantis.
 *
 * An amanta month runs new moon → new moon and takes the name of the rashi
 * the sun enters during it (Mesha → Chaitra). A month with no sankranti is
 * Adhika and borrows the following month's name. This is the classical
 * definition used by every regional panchang, so Adhika months, Padmini /
 * Parama and era new-year days can be derived for any year without tables.
 */
import { DEFAULT_CITY_ID, getCity, type City } from "@/constants/cities";
import {
  addDaysIso,
  fullMoonAfter,
  julianToDate,
  newMoonAfter,
  newMoonBefore,
  rashiIndex,
  sankrantiJd,
  sunTimesUTC,
  tithiAt,
} from "@/lib/astronomy";
import { zonedISODate } from "@/lib/timezone";
import { HINDU_MONTHS, type HinduMonth, type Paksha } from "@/types";

const IST = "Asia/Kolkata";

export interface AmantaMonth {
  /** New moon that starts the month (JD, UT). */
  startJd: number;
  /** New moon that ends the month (JD, UT). */
  endJd: number;
  /** 0 = Chaitra … 11 = Phalguna. */
  monthIndex: number;
  month: HinduMonth;
  adhika: boolean;
}

export interface LunarContext {
  tithi: number;
  tithiIndex: number;
  paksha: Paksha;
  monthAmanta: HinduMonth;
  monthPurnimanta: HinduMonth;
  adhika: boolean;
}

const NEXT: Record<HinduMonth, HinduMonth> = {
  Chaitra: "Vaishakha",
  Vaishakha: "Jyeshtha",
  Jyeshtha: "Ashadha",
  Ashadha: "Shravana",
  Shravana: "Bhadrapada",
  Bhadrapada: "Ashwin",
  Ashwin: "Kartik",
  Kartik: "Margashirsha",
  Margashirsha: "Pausha",
  Pausha: "Magha",
  Magha: "Phalguna",
  Phalguna: "Chaitra",
};

export function nextMonth(month: HinduMonth): HinduMonth {
  return NEXT[month];
}

/** The amanta month containing the instant `jd`. */
export function amantaMonthAt(jd: number): AmantaMonth {
  const startJd = newMoonBefore(jd);
  const endJd = newMoonAfter(startJd + 1);
  return describeMonth(startJd, endJd);
}

function describeMonth(startJd: number, endJd: number): AmantaMonth {
  const r0 = rashiIndex(startJd);
  const r1 = rashiIndex(endJd);
  const adhika = r0 === r1;
  const monthIndex = adhika ? (r1 + 1) % 12 : r1;
  return { startJd, endJd, monthIndex, month: HINDU_MONTHS[monthIndex], adhika };
}

/** Lunar month, paksha and tithi at the instant `jd`. */
export function lunarContextAt(jd: number): LunarContext {
  const t = tithiAt(jd);
  const m = amantaMonthAt(jd);
  // Purnimanta months begin a fortnight early, so a Krishna paksha belongs
  // to the following month. Adhika months are counted new moon to new moon
  // in both systems.
  const monthPurnimanta = m.adhika || t.paksha === "Shukla" ? m.month : NEXT[m.month];
  return {
    tithi: t.tithi,
    tithiIndex: t.tithiIndex,
    paksha: t.paksha,
    monthAmanta: m.month,
    monthPurnimanta,
    adhika: m.adhika,
  };
}

const contextCache = new Map<string, LunarContext>();

/** Lunar context at local sunrise of a civil date (New Delhi by default). */
export function lunarContextForIso(iso: string, city: City = getCity(DEFAULT_CITY_ID)): LunarContext {
  const key = `${city.id}|${iso}`;
  const cached = contextCache.get(key);
  if (cached) return cached;
  const [y, m, d] = iso.split("-").map(Number);
  const sun = sunTimesUTC(y, m, d, city.latitude, city.longitude);
  // Polar fallback: 06:30 local mean time.
  const jd = sun.riseJd ?? julianDayAtLocalHour(y, m, d, city.longitude, 6.5);
  const ctx = lunarContextAt(jd);
  if (contextCache.size > 5000) contextCache.clear();
  contextCache.set(key, ctx);
  return ctx;
}

function julianDayAtLocalHour(y: number, m: number, d: number, longitude: number, hour: number): number {
  const utc = Date.UTC(y, m - 1, d, 0, 0, 0) + (hour - longitude / 15) * 3_600_000;
  return utc / 86_400_000 + 2440587.5;
}

function istDate(jd: number): string {
  return zonedISODate(julianToDate(jd), IST);
}

function sunriseJdIst(iso: string, city: City): number | null {
  const [y, m, d] = iso.split("-").map(Number);
  return sunTimesUTC(y, m, d, city.latitude, city.longitude).riseJd;
}

/**
 * Civil day (IST) observed as Shukla Pratipada after the new moon `jd`.
 * Normally the first day whose sunrise falls in Pratipada; when Pratipada
 * ends before that sunrise (kshaya) the day it prevailed is used, which is
 * how Gudi Padwa / Ugadi are fixed.
 */
export function shuklaPratipadaIso(newMoonJd: number, city: City = getCity(DEFAULT_CITY_ID)): string {
  const d0 = istDate(newMoonJd);
  for (let k = 0; k <= 2; k += 1) {
    const iso = addDaysIso(d0, k);
    const rise = sunriseJdIst(iso, city);
    if (rise == null) return iso;
    if (rise > newMoonJd) {
      const t = tithiAt(rise);
      if (t.tithiIndex === 1) return iso;
      return k === 0 ? iso : addDaysIso(iso, -1);
    }
  }
  return addDaysIso(d0, 1);
}

/**
 * Start of the amanta month that contains the sankranti into `rashi` for the
 * solar year beginning in `year`. When an Adhika month of the same name
 * precedes it, the Adhika month starts the (civil) new year instead.
 */
function firstMonthForSankranti(year: number, rashi: number): AmantaMonth {
  const sankranti = sankrantiJd(year, rashi);
  const nija = amantaMonthAt(sankranti);
  const previous = amantaMonthAt(nija.startJd - 1);
  return previous.adhika ? previous : nija;
}

const isoCache = new Map<string, string>();

function memo(key: string, compute: () => string): string {
  const hit = isoCache.get(key);
  if (hit) return hit;
  const value = compute();
  isoCache.set(key, value);
  return value;
}

/** Chaitra Shukla Pratipada (Vikram / Shaka new year) in Gregorian `year`. */
export function chaitraShukla1(year: number): string {
  return memo(`chaitra|${year}`, () => shuklaPratipadaIso(firstMonthForSankranti(year, 0).startJd));
}

/** Kartik Shukla Pratipada (Gujarati Bestu Varas) in Gregorian `year`. */
export function kartikShukla1(year: number): string {
  return memo(`kartik|${year}`, () => shuklaPratipadaIso(firstMonthForSankranti(year, 7).startJd));
}

/** Phalguna Purnima (Gaura Purnima) in Gregorian `year`, as an IST date. */
export function gauraPurnima(year: number): string {
  return memo(`gaura|${year}`, () => {
    const phalguna = amantaMonthAt(sankrantiJd(year - 1, 11));
    return istDate(fullMoonAfter(phalguna.startJd + 1));
  });
}

/** Mesha Sankranti civil day (IST) for `year`; after sunset it moves to the next day. */
export function meshaSankrantiIso(year: number): string {
  return memo(`mesha|${year}`, () => {
    const jd = sankrantiJd(year, 0);
    const iso = istDate(jd);
    const [y, m, d] = iso.split("-").map(Number);
    const delhi = getCity(DEFAULT_CITY_ID);
    const set = sunTimesUTC(y, m, d, delhi.latitude, delhi.longitude).setJd;
    return set != null && jd > set ? addDaysIso(iso, 1) : iso;
  });
}

/** The sixty Jovian-cycle year names, Prabhava first. */
export const SAMVATSARA_NAMES = [
  "Prabhava",
  "Vibhava",
  "Shukla",
  "Pramoda",
  "Prajapati",
  "Angirasa",
  "Shrimukha",
  "Bhava",
  "Yuva",
  "Dhatri",
  "Ishvara",
  "Bahudhanya",
  "Pramathi",
  "Vikrama",
  "Vrisha",
  "Chitrabhanu",
  "Svabhanu",
  "Tarana",
  "Parthiva",
  "Vyaya",
  "Sarvajit",
  "Sarvadhari",
  "Virodhi",
  "Vikriti",
  "Khara",
  "Nandana",
  "Vijaya",
  "Jaya",
  "Manmatha",
  "Durmukhi",
  "Hevilambi",
  "Vilambi",
  "Vikari",
  "Sharvari",
  "Plava",
  "Shubhakrit",
  "Shobhakrit",
  "Krodhi",
  "Visvavasu",
  "Parabhava",
  "Plavanga",
  "Kilaka",
  "Saumya",
  "Sadharana",
  "Virodhikrit",
  "Paridhavi",
  "Pramadicha",
  "Ananda",
  "Rakshasa",
  "Nala",
  "Pingala",
  "Kalayukti",
  "Siddharthi",
  "Raudra",
  "Durmathi",
  "Dundubhi",
  "Rudhirodgari",
  "Raktakshi",
  "Krodhana",
  "Akshaya",
] as const;

/** Name of the solar (Tamil) year that begins with Mesha Sankranti of `year`. */
export function samvatsaraName(year: number): string {
  // 2025–26 is Visvavasu (index 38 in the cycle).
  const index = (((38 + (year - 2025)) % 60) + 60) % 60;
  return SAMVATSARA_NAMES[index];
}

/** Kali Yuga year for the solar year beginning in `year`. */
export function kaliYear(year: number): number {
  return year + 3101;
}
