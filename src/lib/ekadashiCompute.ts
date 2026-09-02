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

export interface LocalSunrise {
  iso: string;
  rise: Date;
  set: Date;
  riseJd: number;
  tithi: number;
  paksha: "Shukla" | "Krishna";
  tithiIndex: number;
}

function parseIso(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

export function localSunriseOn(iso: string, city: City): LocalSunrise | null {
  const { y, m, d } = parseIso(iso);
  const times = sunTimesUTC(y, m, d, city.latitude, city.longitude);
  if (!times.rise || !times.set || times.riseJd == null) return null;
  const info = tithiAt(times.riseJd);
  return {
    iso,
    rise: times.rise,
    set: times.set,
    riseJd: times.riseJd,
    tithi: info.tithi,
    paksha: info.paksha,
    tithiIndex: info.tithiIndex,
  };
}

function dashamiAtSunrise(day: LocalSunrise): boolean {
  return day.tithi === 10;
}

function ekadashiAtSunrise(day: LocalSunrise): boolean {
  return day.tithi === 11;
}

/**
 * True when Ekadashi is kshaya: Dashami is still at sunrise, Ekadashi starts
 * later that day, and it ends before the next sunrise (no sunrise shows tithi 11).
 */
export function ekadashiIsKshaya(today: LocalSunrise, city: City): boolean {
  if (!dashamiAtSunrise(today)) return false;
  const startJd = tithiBoundaryAfter(today.riseJd, today.tithiIndex);
  const endJd = tithiBoundaryAfter(startJd + 0.02, today.tithiIndex + 1);
  const tomorrow = localSunriseOn(addDaysIso(today.iso, 1), city);
  const nextRise = tomorrow?.riseJd ?? today.riseJd + 1;
  return startJd > today.riseJd && startJd < nextRise && endJd <= nextRise;
}

/**
 * Smarta: fast when sunrise tithi is Ekadashi, or when Ekadashi is kshaya
 * (starts after sunrise on Dashami and ends before the next sunrise).
 * Vaishnava: if Dashami is still present at sunrise, shift to the next day.
 */
export function isFastDay(
  today: LocalSunrise,
  yesterday: LocalSunrise | null,
  tradition: TraditionId,
  city?: City
): boolean {
  if (tradition === "smarta") {
    if (ekadashiAtSunrise(today)) return true;
    return city ? ekadashiIsKshaya(today, city) : false;
  }
  if (dashamiAtSunrise(today)) return false;
  if (yesterday && dashamiAtSunrise(yesterday) && (today.tithi === 11 || today.tithi === 12)) {
    return true;
  }
  return ekadashiAtSunrise(today);
}

export function findLocalFastDate(
  publishedIso: string,
  city: City,
  tradition: TraditionId
): string | null {
  const candidates = [-1, 0, 1, 2].map((delta) => addDaysIso(publishedIso, delta));
  const days = candidates
    .map((iso) => localSunriseOn(iso, city))
    .filter((d): d is LocalSunrise => d !== null);

  for (let i = 0; i < days.length; i += 1) {
    const today = days[i];
    const yesterday =
      localSunriseOn(addDaysIso(today.iso, -1), city) ?? (i > 0 ? days[i - 1] : null);
    if (isFastDay(today, yesterday, tradition, city)) {
      const offset = Math.abs(
        (Date.parse(`${today.iso}T00:00:00Z`) - Date.parse(`${publishedIso}T00:00:00Z`)) / 86_400_000
      );
      if (offset <= 2) return today.iso;
    }
  }
  return null;
}

function hmInZone(date: Date, timezone: string): string {
  const p = getZonedParts(date, timezone);
  return formatHmFromParts(p.hour, p.minute);
}

/**
 * Parana on the morning after the fast: after sunrise (and after Hari-Vasara
 * for Vaishnava), ending at the earlier of 1/3 daylight or Dwadashi's end.
 */
export function calculateParana(fastIso: string, city: City, tradition: TraditionId): Parana {
  const paranaIso = addDaysIso(fastIso, 1);
  const day = localSunriseOn(paranaIso, city);
  if (!day) {
    return { date: paranaIso, start: "06:30", end: "08:40" };
  }

  const riseMs = day.rise.getTime();
  const setMs = day.set.getTime();
  const thirdMs = riseMs + (setMs - riseMs) / 3;

  const fast = localSunriseOn(fastIso, city);
  const paksha = fast?.paksha ?? day.paksha;
  const dwadashiEndTarget = paksha === "Shukla" ? 12 * 12 : 27 * 12;
  const dwadashiStartTarget = paksha === "Shukla" ? 11 * 12 : 26 * 12;
  const dwadashiEndJd = nextElongation(day.riseJd - 0.4, dwadashiEndTarget);
  const dwadashiStartJd = nextElongation(day.riseJd - 1.2, dwadashiStartTarget);
  const hariVasaraJd = dwadashiStartJd + 0.25 * Math.max(0.2, dwadashiEndJd - dwadashiStartJd);

  let startMs = riseMs;
  if (tradition === "vaishnava") {
    const hariMs = (hariVasaraJd - 2440587.5) * 86_400_000;
    if (hariMs > startMs) startMs = hariMs;
  }

  let endMs = Math.min(thirdMs, (dwadashiEndJd - 2440587.5) * 86_400_000);
  if (!Number.isFinite(endMs) || endMs <= startMs + 20 * 60_000) {
    endMs = startMs + 130 * 60_000;
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
  let yesterday = localSunriseOn(addDaysIso(iso, -1), city);
  while (iso <= endIso) {
    const today = localSunriseOn(iso, city);
    if (today && isFastDay(today, yesterday, tradition, city)) {
      out.push({
        date: iso,
        tradition,
        tithi: today.tithi,
        paksha: today.paksha,
        parana: calculateParana(iso, city, tradition),
      });
    }
    yesterday = today;
    iso = addDaysIso(iso, 1);
  }
  return out;
}
