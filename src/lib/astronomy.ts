/**
 * Compact Meeus / NOAA astronomy used for tithi and sunrise.
 * Elongation (moon − sun) is tropical; ayanamsa cancels for tithi.
 */

export function julianDay(year: number, month: number, day: number, hourUTC = 0): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + hourUTC / 24 + B - 1524.5;
}

export function dateToJulian(date: Date): number {
  return date.getTime() / 86_400_000 + 2440587.5;
}

export function julianToDate(jd: number): Date {
  return new Date((jd - 2440587.5) * 86_400_000);
}

function norm360(deg: number): number {
  const x = deg % 360;
  return x < 0 ? x + 360 : x;
}

function rad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function deg(radian: number): number {
  return (radian * 180) / Math.PI;
}

/** Tropical geometric sun longitude (degrees), Meeus ch. 25 simplified. */
export function sunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const Mr = rad(M);
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) +
    0.000289 * Math.sin(3 * Mr);
  const trueLong = L0 + C;
  const omega = 125.04 - 1934.136 * T;
  const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(rad(omega));
  return norm360(lambda);
}

/**
 * Tropical apparent moon longitude (degrees).
 * Meeus ch. 47 — the largest periodic terms (enough for tithi, ~0.2°).
 */
export function moonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T ** 3 / 538841 - T ** 4 / 65194000;
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T ** 3 / 545868;
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T ** 3 / 24490000;
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T ** 3 / 69699;
  const F = 93.272095 + 483202.0175233 * T - 0.0036539 * T * T - T ** 3 / 3526000;
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;

  const terms: [number, number, number, number, number][] = [
    [0, 0, 1, 0, 6288774],
    [2, 0, -1, 0, 1274027],
    [2, 0, 0, 0, 658314],
    [0, 0, 2, 0, 213618],
    [0, 1, 0, 0, -185116],
    [0, 0, 0, 2, -114332],
    [2, 0, -2, 0, 58793],
    [2, -1, -1, 0, 57066],
    [2, 0, 1, 0, 53322],
    [2, -1, 0, 0, 45758],
    [0, 1, -1, 0, -40923],
    [1, 0, 0, 0, -34720],
    [0, 1, 1, 0, -30383],
    [2, 0, 0, -2, 15327],
    [0, 0, 1, 2, -12528],
    [0, 0, 1, -2, 10980],
    [4, 0, -1, 0, 10675],
    [0, 0, 3, 0, 10034],
    [4, 0, -2, 0, 8548],
    [2, 1, -1, 0, -7888],
    [2, 1, 0, 0, -6766],
    [1, 0, -1, 0, -5163],
    [1, 1, 0, 0, 4987],
    [2, -1, 1, 0, 4036],
    [2, 0, 2, 0, 3994],
    [4, 0, 0, 0, 3861],
    [2, 0, -3, 0, 3665],
    [0, 1, -2, 0, -2689],
    [2, 0, -1, 2, -2602],
    [2, -1, -2, 0, 2390],
    [1, 0, 1, 0, -2348],
    [2, -2, 0, 0, 2236],
    [0, 1, 2, 0, -2120],
    [0, 2, 0, 0, -2069],
    [2, -2, -1, 0, 2048],
    [2, 0, 1, -2, -1773],
    [2, 0, 0, 2, -1595],
    [4, -1, -1, 0, 1215],
    [0, 0, 2, 2, -1110],
    [3, 0, -1, 0, -892],
    [2, 1, 1, 0, -810],
    [4, -1, -2, 0, 759],
    [0, 2, -1, 0, -713],
    [2, 2, -1, 0, -700],
    [2, 1, -2, 0, 691],
  ];

  let sigmaL = 0;
  for (const [d, m, mp, f, coeff] of terms) {
    let e = 1;
    if (Math.abs(m) === 1) e = E;
    if (Math.abs(m) === 2) e = E * E;
    sigmaL += coeff * e * Math.sin(rad(d * D + m * M + mp * Mp + f * F));
  }

  const A1 = 119.75 + 131.849 * T;
  sigmaL += 3958 * Math.sin(rad(A1)) + 1962 * Math.sin(rad(Lp - F)) + 318 * Math.sin(rad(142.67 - 0.317 * T));

  return norm360(Lp + sigmaL / 1_000_000);
}

export function moonSunElongation(jd: number): number {
  return norm360(moonLongitude(jd) - sunLongitude(jd));
}

export interface TithiInfo {
  /** 1–15 within the current paksha. */
  tithi: number;
  paksha: "Shukla" | "Krishna";
  /** 1–30 from Shukla Pratipada. */
  tithiIndex: number;
  elongation: number;
  /** 0–1 progress through the current tithi. */
  fraction: number;
}

export function tithiAt(jd: number): TithiInfo {
  const elong = moonSunElongation(jd);
  const tithiIndex = Math.floor(elong / 12) + 1;
  const fraction = (elong % 12) / 12;
  if (tithiIndex <= 15) {
    return { tithi: tithiIndex, paksha: "Shukla", tithiIndex, elongation: elong, fraction };
  }
  return { tithi: tithiIndex - 15, paksha: "Krishna", tithiIndex, elongation: elong, fraction };
}

/** Julian day when elongation next reaches `targetDeg` after `jd0`. */
export function nextElongation(jd0: number, targetDeg: number): number {
  const target = norm360(targetDeg);
  let jd = jd0;
  for (let i = 0; i < 16; i += 1) {
    const elong = moonSunElongation(jd);
    // Signed shortest error (−180…180), then force the first step forward.
    let delta = ((target - elong + 540) % 360) - 180;
    if (i === 0 && delta <= 0.002) delta += 360;
    jd += delta / 12.190747;
    if (Math.abs(delta) < 0.002) break;
  }
  return jd;
}

export function tithiBoundaryAfter(jd: number, tithiIndex1to30: number): number {
  return nextElongation(jd, (tithiIndex1to30 % 30) * 12);
}

export interface SunTimes {
  rise: Date | null;
  set: Date | null;
  /** Official zenith sunrise as Julian day (UTC), or null in polar night. */
  riseJd: number | null;
  setJd: number | null;
}

function dayOfYear(year: number, month: number, day: number): number {
  const t = Date.UTC(year, month - 1, day);
  const start = Date.UTC(year, 0, 0);
  return Math.round((t - start) / 86_400_000);
}

/** Lahiri ayanamsa (degrees). Sufficient for rashi / sankranti labels. */
export function lahiriAyanamsa(jd: number): number {
  const years = (jd - 2451545.0) / 365.25;
  return 23.8544 + 0.013972 * years;
}

export function siderealSunLongitude(jd: number): number {
  return norm360(sunLongitude(jd) - lahiriAyanamsa(jd));
}

/** 0 = Mesha … 11 = Mina. */
export function rashiIndex(jd: number): number {
  return Math.floor(siderealSunLongitude(jd) / 30);
}

/**
 * Local-date sunrise/sunset as UTC hours (may be < 0 or ≥ 24 so the civil
 * date can shift). NOAA/Williams algorithm; longitude is east-positive.
 */
function solarEventUTCHours(
  year: number,
  month: number,
  day: number,
  latitude: number,
  longitude: number,
  rising: boolean
): number | null {
  const N = dayOfYear(year, month, day);
  const lngHour = longitude / 15;
  const t = N + ((rising ? 6 : 18) - lngHour) / 24;
  const M = 0.9856 * t - 3.289;
  let L = M + 1.916 * Math.sin(rad(M)) + 0.02 * Math.sin(rad(2 * M)) + 282.634;
  L = norm360(L);
  let RA = deg(Math.atan(0.91764 * Math.tan(rad(L))));
  RA = norm360(RA);
  const Lq = Math.floor(L / 90) * 90;
  const RAq = Math.floor(RA / 90) * 90;
  RA = (RA + (Lq - RAq)) / 15;
  const sinDec = 0.39782 * Math.sin(rad(L));
  const cosDec = Math.cos(Math.asin(sinDec));
  const cosH =
    (Math.cos(rad(90.833)) - sinDec * Math.sin(rad(latitude))) / (cosDec * Math.cos(rad(latitude)));
  if (cosH > 1 || cosH < -1) return null;
  const H = (rising ? 360 - deg(Math.acos(cosH)) : deg(Math.acos(cosH))) / 15;
  const T = H + RA - 0.06571 * t - 6.622;
  return T - lngHour;
}

function utcHoursToDate(year: number, month: number, day: number, hours: number): Date {
  const base = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
  return new Date(base + hours * 3_600_000);
}

/**
 * Official-zenith sunrise/sunset for a local civil date.
 * Longitude is east-positive. Returned instants are UTC.
 */
export function sunTimesUTC(
  year: number,
  month: number,
  day: number,
  latitude: number,
  longitude: number
): SunTimes {
  const riseH = solarEventUTCHours(year, month, day, latitude, longitude, true);
  const setH = solarEventUTCHours(year, month, day, latitude, longitude, false);
  if (riseH == null || setH == null) {
    return { rise: null, set: null, riseJd: null, setJd: null };
  }
  const rise = utcHoursToDate(year, month, day, riseH);
  const set = utcHoursToDate(year, month, day, setH);
  if (set.getTime() <= rise.getTime()) {
    set.setTime(set.getTime() + 86_400_000);
  }
  return {
    rise,
    set,
    riseJd: dateToJulian(rise),
    setJd: dateToJulian(set),
  };
}

export function addDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + days));
  const yy = utc.getUTCFullYear();
  const mm = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(utc.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function formatHmFromParts(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
