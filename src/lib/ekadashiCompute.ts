/**
 * Fasting-day rules, validated against Drik Panchang (Smarta) and the ISKCON
 * calendar (Vaishnava) for New Delhi, 2026–2030.
 *
 * Smarta (Dharmasindhu, as applied by Drik Panchang)
 * - Fast on the civil day whose sunrise falls in Ekadashi (udaya-vyapini).
 * - Kshaya (no sunrise in Ekadashi): fast on the day Ekadashi arises.
 * - Vriddhi (Ekadashi at two sunrises): fast on the second day.
 * - Trisprsa (Ekadashi at sunrise, then Dwadashi ends before the next
 *   sunrise): there is no Dwadashi morning for Parana, so the fast moves
 *   back to the day Ekadashi arose.
 *
 * Vaishnava (Hari-Bhakti-Vilasa, as applied by ISKCON)
 * - Ekadashi must be shuddha: Dashami may not touch arunodaya (96 minutes
 *   before sunrise). A viddha Ekadashi moves the fast to Dwadashi.
 * - Kshaya → Dwadashi (Gauna); vriddhi → second day.
 * - Mahadvadashi: when Dwadashi spans two sunrises (Vanjuli) or the paksha's
 *   Purnima / Amavasya does (Pakshavardhini), the fast is kept on Dwadashi.
 */
import type { City } from "@/constants/cities";
import {
  addDaysIso,
  formatHmFromParts,
  nextElongation,
  sunTimesUTC,
  tithiAt,
  tithiBoundaryAfter,
} from "@/lib/astronomy";
import { getZonedParts } from "@/lib/timezone";
import type { Parana, TraditionId } from "@/types";

/** Four ghatikas before sunrise, in days. */
const ARUNODAYA_DAYS = 96 / 1440;

export interface LocalSunrise {
  iso: string;
  rise: Date;
  set: Date;
  riseJd: number;
  tithi: number;
  paksha: "Shukla" | "Krishna";
  tithiIndex: number;
  /** 1–30 tithi index at arunodaya (96 min before sunrise). */
  arunodayaTithiIndex: number;
}

function parseIso(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

const sunriseCache = new Map<string, LocalSunrise | null>();

export function localSunriseOn(iso: string, city: City): LocalSunrise | null {
  const key = `${city.id}|${iso}`;
  if (sunriseCache.has(key)) return sunriseCache.get(key) ?? null;
  const { y, m, d } = parseIso(iso);
  const times = sunTimesUTC(y, m, d, city.latitude, city.longitude);
  let result: LocalSunrise | null = null;
  if (times.rise && times.set && times.riseJd != null) {
    const info = tithiAt(times.riseJd);
    result = {
      iso,
      rise: times.rise,
      set: times.set,
      riseJd: times.riseJd,
      tithi: info.tithi,
      paksha: info.paksha,
      tithiIndex: info.tithiIndex,
      arunodayaTithiIndex: tithiAt(times.riseJd - ARUNODAYA_DAYS).tithiIndex,
    };
  }
  if (sunriseCache.size > 20_000) sunriseCache.clear();
  sunriseCache.set(key, result);
  return result;
}

const EPSILON = 0.01;

function isEkadashi(day: LocalSunrise | null): boolean {
  return day?.tithi === 11;
}

function isDashami(day: LocalSunrise | null): boolean {
  return day?.tithi === 10;
}

function isDwadashi(day: LocalSunrise | null): boolean {
  return day?.tithi === 12;
}

/** End instant of the tithi present at this sunrise. */
function currentTithiEnd(day: LocalSunrise): number {
  return tithiBoundaryAfter(day.riseJd, day.tithiIndex);
}

/** End instant of the n-th tithi after the one present at sunrise. */
function laterTithiEnd(day: LocalSunrise, offset: number): number {
  let jd = currentTithiEnd(day);
  for (let i = 1; i <= offset; i += 1) {
    jd = tithiBoundaryAfter(jd + EPSILON, day.tithiIndex + i);
  }
  return jd;
}

/**
 * True when Ekadashi is kshaya from the perspective of a Dashami sunrise:
 * it begins after this sunrise and ends before the next one.
 */
export function ekadashiIsKshaya(today: LocalSunrise, city: City): boolean {
  if (!isDashami(today)) return false;
  const tomorrow = localSunriseOn(addDaysIso(today.iso, 1), city);
  const nextRise = tomorrow?.riseJd ?? today.riseJd + 1;
  const start = currentTithiEnd(today);
  const end = laterTithiEnd(today, 1);
  return start > today.riseJd && start < nextRise && end <= nextRise;
}

/** Ekadashi at sunrise today, but Dwadashi both begins and ends before tomorrow's sunrise. */
function isTrisprsa(today: LocalSunrise, tomorrow: LocalSunrise | null): boolean {
  if (!isEkadashi(today)) return false;
  const nextRise = tomorrow?.riseJd ?? today.riseJd + 1;
  return laterTithiEnd(today, 1) < nextRise;
}

/** The paksha's fifteenth tithi (Purnima / Amavasya) spans two sunrises. */
function pakshaEndIsVriddhi(ekadashiDay: LocalSunrise, city: City): boolean {
  const offsetToStart = 3; // Ekadashi → Dwadashi, Trayodashi, Chaturdashi end
  const start = laterTithiEnd(ekadashiDay, offsetToStart);
  const end = tithiBoundaryAfter(start + EPSILON, ekadashiDay.tithiIndex + 4);
  let sunrises = 0;
  for (let k = 1; k <= 7; k += 1) {
    const day = localSunriseOn(addDaysIso(ekadashiDay.iso, k), city);
    if (day && day.riseJd > start && day.riseJd < end) sunrises += 1;
  }
  return sunrises >= 2;
}

function smartaFast(iso: string, city: City): boolean {
  const today = localSunriseOn(iso, city);
  if (!today) return false;
  const yesterday = localSunriseOn(addDaysIso(iso, -1), city);
  const tomorrow = localSunriseOn(addDaysIso(iso, 1), city);

  if (isEkadashi(today)) {
    if (isEkadashi(tomorrow)) return false;
    if (isEkadashi(yesterday)) return true;
    if (isDashami(yesterday) && isTrisprsa(today, tomorrow)) return false;
    return true;
  }

  if (isDashami(today)) {
    if (ekadashiIsKshaya(today, city)) return true;
    if (isEkadashi(tomorrow)) {
      const dayAfter = localSunriseOn(addDaysIso(iso, 2), city);
      if (!isEkadashi(dayAfter) && isTrisprsa(tomorrow!, dayAfter)) return true;
    }
  }
  return false;
}

function isShuddha(day: LocalSunrise): boolean {
  return isEkadashi(day) && day.arunodayaTithiIndex % 15 !== 10;
}

/** Whether a shuddha Ekadashi day hands its fast to the following Dwadashi. */
function mahadvadashiShift(ekadashiDay: LocalSunrise, city: City): boolean {
  const tomorrow = localSunriseOn(addDaysIso(ekadashiDay.iso, 1), city);
  const dayAfter = localSunriseOn(addDaysIso(ekadashiDay.iso, 2), city);
  if (isDwadashi(tomorrow) && isDwadashi(dayAfter)) return true;
  return pakshaEndIsVriddhi(ekadashiDay, city);
}

function vaishnavaFast(iso: string, city: City): boolean {
  const today = localSunriseOn(iso, city);
  if (!today) return false;
  const yesterday = localSunriseOn(addDaysIso(iso, -1), city);
  const tomorrow = localSunriseOn(addDaysIso(iso, 1), city);

  if (isEkadashi(today)) {
    if (isEkadashi(tomorrow)) return false;
    if (isEkadashi(yesterday)) return true;
    if (!isShuddha(today)) return false;
    return !mahadvadashiShift(today, city);
  }

  if (isDwadashi(today) && yesterday) {
    if (isEkadashi(yesterday)) {
      const dayBefore = localSunriseOn(addDaysIso(iso, -2), city);
      if (isEkadashi(dayBefore)) return false;
      if (!isShuddha(yesterday)) return true;
      return mahadvadashiShift(yesterday, city);
    }
    if (isDashami(yesterday) && ekadashiIsKshaya(yesterday, city)) return true;
  }
  return false;
}

/** Whether `iso` is the fasting day for the tradition in this city. */
export function isFastDay(iso: string, city: City, tradition: TraditionId): boolean {
  return tradition === "smarta" ? smartaFast(iso, city) : vaishnavaFast(iso, city);
}

/**
 * Local fasting day for a published (India) date: the nearest fast within
 * two days of it, or null when the rules find none.
 */
export function findLocalFastDate(publishedIso: string, city: City, tradition: TraditionId): string | null {
  const candidates = [0, 1, -1, 2].map((delta) => addDaysIso(publishedIso, delta));
  for (const iso of candidates) {
    if (isFastDay(iso, city, tradition)) return iso;
  }
  return null;
}

function hmInZone(date: Date, timezone: string): string {
  const p = getZonedParts(date, timezone);
  return formatHmFromParts(p.hour, p.minute);
}

function jdToMs(jd: number): number {
  return (jd - 2440587.5) * 86_400_000;
}

/**
 * Parana window on the day after the fast.
 *
 * Both traditions wait for Hari-Vasara (the first quarter of Dwadashi) and
 * finish before Dwadashi ends; if Dwadashi was already over at sunrise the
 * fast is broken right after sunrise.
 * - Smarta (Drik Panchang): Pratahkal, the first fifth of daylight. When
 *   Hari-Vasara outlasts Pratahkal the window moves to Aparahna, the fourth
 *   fifth, skipping Madhyahna.
 * - Vaishnava (ISKCON): from Hari-Vasara's end until a third of daylight.
 */
export function calculateParana(fastIso: string, city: City, tradition: TraditionId): Parana {
  const paranaIso = addDaysIso(fastIso, 1);
  const day = localSunriseOn(paranaIso, city);
  if (!day) {
    return { date: paranaIso, start: "06:30", end: "08:40" };
  }

  const riseMs = day.rise.getTime();
  const setMs = day.set.getTime();
  const dayMs = setMs - riseMs;

  const fast = localSunriseOn(fastIso, city);
  const shukla = fast ? fast.tithiIndex <= 15 : day.paksha === "Shukla";
  const dwadashiStartTarget = (shukla ? 11 : 26) * 12;
  const dwadashiEndTarget = (shukla ? 12 : 27) * 12;
  const dwadashiStartJd = nextElongation(day.riseJd - 1.5, dwadashiStartTarget);
  const dwadashiEndJd = nextElongation(dwadashiStartJd + EPSILON, dwadashiEndTarget);
  const dwadashiEndMs = jdToMs(dwadashiEndJd);
  const hariVasaraEndMs = jdToMs(dwadashiStartJd + 0.25 * (dwadashiEndJd - dwadashiStartJd));
  const dwadashiOver = dwadashiEndMs <= riseMs;

  let startMs: number;
  let endMs: number;
  if (tradition === "vaishnava") {
    const thirdMs = riseMs + dayMs / 3;
    if (dwadashiOver) {
      startMs = riseMs;
      endMs = thirdMs;
    } else {
      startMs = Math.max(riseMs, hariVasaraEndMs);
      endMs = Math.min(thirdMs, dwadashiEndMs);
      if (endMs <= startMs) endMs = Math.min(setMs, dwadashiEndMs);
    }
  } else {
    const fifthMs = dayMs / 5;
    const pratahEndMs = riseMs + fifthMs;
    if (dwadashiOver) {
      startMs = riseMs;
      endMs = pratahEndMs;
    } else if (hariVasaraEndMs <= pratahEndMs) {
      startMs = Math.max(riseMs, hariVasaraEndMs);
      endMs = Math.min(pratahEndMs, dwadashiEndMs);
    } else {
      startMs = Math.max(riseMs + 3 * fifthMs, hariVasaraEndMs);
      endMs = Math.min(riseMs + 4 * fifthMs, dwadashiEndMs);
      if (endMs <= startMs) {
        startMs = hariVasaraEndMs;
        endMs = Math.min(setMs, dwadashiEndMs);
      }
    }
  }

  if (!Number.isFinite(endMs) || endMs <= startMs + 5 * 60_000) {
    endMs = startMs + 10 * 60_000;
  }

  return {
    date: paranaIso,
    start: hmInZone(new Date(startMs), city.timezone),
    end: hmInZone(new Date(endMs), city.timezone),
  };
}

export interface ComputedFast {
  date: string;
  tradition: TraditionId;
  tithi: number;
  paksha: "Shukla" | "Krishna";
  parana: Parana;
}

/** Scan civil days and return every fasting day for a tradition. */
export function computeFastsInRange(
  startIso: string,
  endIso: string,
  city: City,
  tradition: TraditionId
): ComputedFast[] {
  const out: ComputedFast[] = [];
  let iso = startIso;
  while (iso <= endIso) {
    if (isFastDay(iso, city, tradition)) {
      const today = localSunriseOn(iso, city)!;
      // A Dwadashi-day fast still belongs to the Ekadashi paksha.
      const paksha = today.tithiIndex <= 15 ? "Shukla" : "Krishna";
      out.push({
        date: iso,
        tradition,
        tithi: today.tithi,
        paksha,
        parana: calculateParana(iso, city, tradition),
      });
    }
    iso = addDaysIso(iso, 1);
  }
  return out;
}
