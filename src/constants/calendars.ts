import type { CalendarId, EraId, HinduMonth, MonthSystem, TraditionId } from "@/types";
import { HINDU_MONTHS } from "@/types";

export interface MonthLabel {
  name: string;
  native: string;
}

export interface CalendarDefinition {
  id: CalendarId;
  name: string;
  nativeName: string;
  region: string;
  description: string;
  monthSystem: MonthSystem;
  /** `solar` calendars lead with the sankranti month; `lunar` leads with tithi-month. */
  civilKind: "lunar" | "solar";
  era: EraId;
  defaultTradition: TraditionId;
  searchTerms: string[];
  lunarMonths: Record<HinduMonth, MonthLabel>;
  /** Index 0 = Mesha / Vaishakha (mid-April new year for most solar calendars). */
  solarMonths: MonthLabel[];
  featured?: boolean;
}

function lunar(pairs: [string, string][]): Record<HinduMonth, MonthLabel> {
  const out = {} as Record<HinduMonth, MonthLabel>;
  HINDU_MONTHS.forEach((key, i) => {
    const pair = pairs[i] ?? [key, key];
    out[key] = { name: pair[0], native: pair[1] };
  });
  return out;
}

/** Chaitra-first pairs → Mesha-first solar order (Vaishakha … Chaitra). */
function solarFromLunar(pairs: [string, string][]): MonthLabel[] {
  return [...pairs.slice(1), pairs[0]].map(([name, native]) => ({ name, native }));
}

const SANSKRIT: [string, string][] = [
  ["Chaitra", "Chaitra"],
  ["Vaishakha", "Vaishakha"],
  ["Jyeshtha", "Jyeshtha"],
  ["Ashadha", "Ashadha"],
  ["Shravana", "Shravana"],
  ["Bhadrapada", "Bhadrapada"],
  ["Ashwin", "Ashwin"],
  ["Kartik", "Kartik"],
  ["Margashirsha", "Margashirsha"],
  ["Pausha", "Pausha"],
  ["Magha", "Magha"],
  ["Phalguna", "Phalguna"],
];

const MITHILA: [string, string][] = [
  ["Chait", "Chait"],
  ["Baisakh", "Baisakh"],
  ["Jeth", "Jeth"],
  ["Akhar", "Akhar"],
  ["Saon", "Saon"],
  ["Bhado", "Bhado"],
  ["Aasin", "Aasin"],
  ["Katik", "Katik"],
  ["Agahan", "Agahan"],
  ["Pus", "Pus"],
  ["Magh", "Magh"],
  ["Fagun", "Fagun"],
];

const NEPALI: [string, string][] = [
  ["Chaitra", "Chaitra"],
  ["Baisakh", "Baisakh"],
  ["Jestha", "Jestha"],
  ["Asar", "Asar"],
  ["Shrawan", "Shrawan"],
  ["Bhadra", "Bhadra"],
  ["Ashwin", "Asoj"],
  ["Kartik", "Kartik"],
  ["Mangsir", "Mangsir"],
  ["Poush", "Poush"],
  ["Magh", "Magh"],
  ["Falgun", "Falgun"],
];

const BENGALI: [string, string][] = [
  ["Choitro", "Choitro"],
  ["Boishakh", "Boishakh"],
  ["Joishtho", "Joishtho"],
  ["Asharh", "Asharh"],
  ["Srabon", "Srabon"],
  ["Bhadro", "Bhadro"],
  ["Ashwin", "Ashwin"],
  ["Kartik", "Kartik"],
  ["Ogrohayon", "Ogrohayon"],
  ["Poush", "Poush"],
  ["Magh", "Magh"],
  ["Falgun", "Falgun"],
];

const ODIA: [string, string][] = [
  ["Chaitra", "Chaitra"],
  ["Baisakha", "Baisakha"],
  ["Jyestha", "Jyestha"],
  ["Asadha", "Asadha"],
  ["Srabana", "Srabana"],
  ["Bhadraba", "Bhadraba"],
  ["Aswina", "Aswina"],
  ["Kartika", "Kartika"],
  ["Margasira", "Margasira"],
  ["Pausa", "Pausa"],
  ["Magha", "Magha"],
  ["Phalguna", "Phalguna"],
];

const GUJARATI: [string, string][] = [
  ["Chaitra", "Chaitra"],
  ["Vaishakh", "Vaishakh"],
  ["Jeth", "Jeth"],
  ["Ashadh", "Ashadh"],
  ["Shravan", "Shravan"],
  ["Bhadarvo", "Bhadarvo"],
  ["Aaso", "Aaso"],
  ["Kartak", "Kartak"],
  ["Magshar", "Magshar"],
  ["Posh", "Posh"],
  ["Maha", "Maha"],
  ["Fagan", "Fagan"],
];

const MARATHI: [string, string][] = [
  ["Chaitra", "Chaitra"],
  ["Vaishakh", "Vaishakh"],
  ["Jyeshtha", "Jyeshtha"],
  ["Ashadh", "Ashadh"],
  ["Shravan", "Shravan"],
  ["Bhadrapad", "Bhadrapad"],
  ["Ashwin", "Ashwin"],
  ["Kartik", "Kartik"],
  ["Margashirsh", "Margashirsh"],
  ["Paush", "Paush"],
  ["Magh", "Magh"],
  ["Falgun", "Falgun"],
];

const TELUGU: [string, string][] = [
  ["Chaitram", "Chaitram"],
  ["Vaisakham", "Vaisakham"],
  ["Jyeshtam", "Jyeshtam"],
  ["Ashadham", "Ashadham"],
  ["Sravanam", "Sravanam"],
  ["Bhadrapadam", "Bhadrapadam"],
  ["Aasveeyujam", "Aasveeyujam"],
  ["Kaartikam", "Kaartikam"],
  ["Margasiram", "Margasiram"],
  ["Pushyam", "Pushyam"],
  ["Magham", "Magham"],
  ["Phalgunam", "Phalgunam"],
];

const KANNADA: [string, string][] = [
  ["Chaitra", "Chaitra"],
  ["Vaisakha", "Vaisakha"],
  ["Jyeshtha", "Jyeshtha"],
  ["Ashadha", "Ashadha"],
  ["Shravana", "Shravana"],
  ["Bhadrapada", "Bhadrapada"],
  ["Ashwayuja", "Ashwayuja"],
  ["Kartika", "Kartika"],
  ["Margashira", "Margashira"],
  ["Pushya", "Pushya"],
  ["Magha", "Magha"],
  ["Phalguna", "Phalguna"],
];

const PUNJABI: [string, string][] = [
  ["Chet", "Chet"],
  ["Vaisakh", "Vaisakh"],
  ["Jeth", "Jeth"],
  ["Harh", "Harh"],
  ["Sawan", "Sawan"],
  ["Bhadon", "Bhadon"],
  ["Assu", "Assu"],
  ["Kattak", "Kattak"],
  ["Maghar", "Maghar"],
  ["Poh", "Poh"],
  ["Magh", "Magh"],
  ["Phaggan", "Phaggan"],
];

const TAMIL_SOLAR: MonthLabel[] = [
  { name: "Chithirai", native: "Chithirai" },
  { name: "Vaikasi", native: "Vaikasi" },
  { name: "Aani", native: "Aani" },
  { name: "Aadi", native: "Aadi" },
  { name: "Aavani", native: "Aavani" },
  { name: "Purattasi", native: "Purattasi" },
  { name: "Aippasi", native: "Aippasi" },
  { name: "Karthigai", native: "Karthigai" },
  { name: "Margazhi", native: "Margazhi" },
  { name: "Thai", native: "Thai" },
  { name: "Maasi", native: "Maasi" },
  { name: "Panguni", native: "Panguni" },
];

const MALAYALAM_SOLAR: MonthLabel[] = [
  { name: "Medam", native: "Medam" },
  { name: "Edavam", native: "Edavam" },
  { name: "Midhunam", native: "Midhunam" },
  { name: "Karkidakam", native: "Karkidakam" },
  { name: "Chingam", native: "Chingam" },
  { name: "Kanni", native: "Kanni" },
  { name: "Thulam", native: "Thulam" },
  { name: "Vrischikam", native: "Vrischikam" },
  { name: "Dhanu", native: "Dhanu" },
  { name: "Makaram", native: "Makaram" },
  { name: "Kumbham", native: "Kumbham" },
  { name: "Meenam", native: "Meenam" },
];

function def(
  partial: Omit<CalendarDefinition, "lunarMonths" | "solarMonths"> & {
    monthPairs: [string, string][];
    solarMonths?: MonthLabel[];
  }
): CalendarDefinition {
  const { monthPairs, solarMonths, ...rest } = partial;
  return {
    ...rest,
    lunarMonths: lunar(monthPairs),
    solarMonths: solarMonths ?? solarFromLunar(monthPairs),
  };
}

export const CALENDARS: CalendarDefinition[] = [
  def({
    id: "mithila",
    name: "Mithila / Tirhuta",
    nativeName: "Mithila Panchang",
    region: "Mithila — Bihar & Nepal Terai",
    description:
      "Tirhuta solar year from Jur Sital (Mesh Sankranti) in Lakshman Samvat, with Purnimanta lunar months for Ekadashi.",
    monthSystem: "purnimanta",
    civilKind: "solar",
    era: "lakshman",
    defaultTradition: "smarta",
    featured: true,
    searchTerms: [
      "mithila",
      "maithili",
      "tirhuta",
      "tirhut",
      "darbhanga",
      "janakpur",
      "sitamarhi",
      "bihar",
      "lakshman",
    ],
    monthPairs: MITHILA,
  }),
  def({
    id: "north-indian",
    name: "North Indian (Hindi)",
    nativeName: "Vikram Samvat",
    region: "Hindi belt — UP, MP, Rajasthan, Haryana",
    description: "Purnimanta Vikram Samvat used by most North Indian panchangs and Hindi calendars.",
    monthSystem: "purnimanta",
    civilKind: "lunar",
    era: "vikram-chaitra",
    defaultTradition: "smarta",
    searchTerms: ["hindi", "north", "vikram", "purnimanta", "delhi", "up", "rajasthan"],
    monthPairs: SANSKRIT,
  }),
  def({
    id: "nepali",
    name: "Nepali Bikram Sambat",
    nativeName: "Bikram Sambat",
    region: "Nepal",
    description: "Nepal's official Bikram Sambat solar year (Baisakh 1) with Purnimanta lunar tithis.",
    monthSystem: "purnimanta",
    civilKind: "solar",
    era: "nepali",
    defaultTradition: "smarta",
    searchTerms: ["nepal", "nepali", "bikram", "sambat", "kathmandu"],
    monthPairs: NEPALI,
  }),
  def({
    id: "bengali",
    name: "Bengali",
    nativeName: "Bangla Panjika",
    region: "West Bengal, Bangladesh, Tripura",
    description: "Bengali San solar year from Pohela Boishakh, with lunar tithi for Ekadashi.",
    monthSystem: "purnimanta",
    civilKind: "solar",
    era: "bengali",
    defaultTradition: "smarta",
    searchTerms: ["bengali", "bangla", "kolkata", "bangladesh", "boishakh"],
    monthPairs: BENGALI,
  }),
  def({
    id: "odia",
    name: "Odia",
    nativeName: "Odia Panjika",
    region: "Odisha",
    description: "Odia panchanga with Purnimanta lunar months used across Jagannatha temples.",
    monthSystem: "purnimanta",
    civilKind: "lunar",
    era: "vikram-chaitra",
    defaultTradition: "smarta",
    searchTerms: ["odia", "odisha", "oriya", "puri"],
    monthPairs: ODIA,
  }),
  def({
    id: "gujarati",
    name: "Gujarati",
    nativeName: "Gujarati Vikram",
    region: "Gujarat",
    description: "Amanta Vikram Samvat; the civil year turns on Kartik Shukla 1 (Bestu Varas).",
    monthSystem: "amanta",
    civilKind: "lunar",
    era: "vikram-kartik",
    defaultTradition: "smarta",
    searchTerms: ["gujarati", "gujarat", "amanta", "bestu", "varas"],
    monthPairs: GUJARATI,
  }),
  def({
    id: "marathi",
    name: "Marathi",
    nativeName: "Marathi Panchang",
    region: "Maharashtra, Goa",
    description: "Amanta months with Shaka Samvat (Gudi Padwa / Chaitra Shukla 1).",
    monthSystem: "amanta",
    civilKind: "lunar",
    era: "saka",
    defaultTradition: "smarta",
    searchTerms: ["marathi", "maharashtra", "shaka", "gudi", "padwa"],
    monthPairs: MARATHI,
  }),
  def({
    id: "telugu",
    name: "Telugu",
    nativeName: "Telugu Panchangam",
    region: "Andhra Pradesh & Telangana",
    description: "Amanta Telugu panchangam with Shaka Samvat (Ugadi).",
    monthSystem: "amanta",
    civilKind: "lunar",
    era: "saka",
    defaultTradition: "smarta",
    searchTerms: ["telugu", "andhra", "telangana", "ugadi"],
    monthPairs: TELUGU,
  }),
  def({
    id: "kannada",
    name: "Kannada",
    nativeName: "Kannada Panchanga",
    region: "Karnataka",
    description: "Amanta Kannada panchanga with Shaka Samvat (Yugadi).",
    monthSystem: "amanta",
    civilKind: "lunar",
    era: "saka",
    defaultTradition: "smarta",
    searchTerms: ["kannada", "karnataka", "yugadi"],
    monthPairs: KANNADA,
  }),
  def({
    id: "tamil",
    name: "Tamil",
    nativeName: "Tamil Calendar",
    region: "Tamil Nadu & northern Sri Lanka",
    description: "Tamil solar months from Chithirai. Mokshada is observed as Vaikuntha / Mukkoti Ekadashi.",
    monthSystem: "purnimanta",
    civilKind: "solar",
    era: "tamil",
    defaultTradition: "smarta",
    searchTerms: ["tamil", "tamilnadu", "vaikuntha", "mukkoti", "chithirai"],
    monthPairs: SANSKRIT,
    solarMonths: TAMIL_SOLAR,
  }),
  def({
    id: "malayalam",
    name: "Malayalam (Kollam)",
    nativeName: "Malayalam Calendar",
    region: "Kerala",
    description: "Kollam Era solar year from Chingam, with lunar tithi for Ekadashi.",
    monthSystem: "amanta",
    civilKind: "solar",
    era: "kollam",
    defaultTradition: "smarta",
    searchTerms: ["malayalam", "kerala", "kollam", "chingam"],
    monthPairs: SANSKRIT,
    solarMonths: MALAYALAM_SOLAR,
  }),
  def({
    id: "punjabi",
    name: "Punjabi (Hindu)",
    nativeName: "Punjabi Bikrami",
    region: "Punjab & Delhi",
    description: "Purnimanta Bikrami calendar used by Punjabi Hindu families.",
    monthSystem: "purnimanta",
    civilKind: "lunar",
    era: "vikram-chaitra",
    defaultTradition: "smarta",
    searchTerms: ["punjabi", "punjab", "bikrami"],
    monthPairs: PUNJABI,
  }),
  def({
    id: "iskcon",
    name: "ISKCON / Gaudiya",
    nativeName: "Vaishnava Panjika",
    region: "Worldwide ISKCON & Gaudiya maths",
    description:
      "Hari-Bhakti-Vilasa shuddha-tithi rule (Vaishnava) with Gaudiya names such as Bhaimi, Sayana, and Utthana.",
    monthSystem: "purnimanta",
    civilKind: "lunar",
    era: "gaurabda",
    defaultTradition: "vaishnava",
    searchTerms: ["iskcon", "gaudiya", "mayapur", "vrindavan", "hare krishna", "gaurabda"],
    monthPairs: SANSKRIT,
  }),
  def({
    id: "vaishnava",
    name: "Vaishnava (Bhagavata)",
    nativeName: "Vaishnava",
    region: "Pan-India Vaishnava sampradayas",
    description: "Shuddha Ekadashi rule: if Dashami touches sunrise, the fast moves to the next day.",
    monthSystem: "purnimanta",
    civilKind: "lunar",
    era: "vikram-chaitra",
    defaultTradition: "vaishnava",
    searchTerms: ["vaishnava", "bhagavata", "shuddha", "viddha"],
    monthPairs: SANSKRIT,
  }),
  def({
    id: "smarta",
    name: "Smarta (Pan-India)",
    nativeName: "Smarta",
    region: "Most Hindu households",
    description: "Udaya-tithi rule from Dharmasindhu / Nirnayasindhu — fast on the sunrise Ekadashi day.",
    monthSystem: "purnimanta",
    civilKind: "lunar",
    era: "vikram-chaitra",
    defaultTradition: "smarta",
    searchTerms: ["smarta", "smartha", "smart", "householder"],
    monthPairs: SANSKRIT,
  }),
];

const BY_ID = new Map(CALENDARS.map((c) => [c.id, c]));

export const DEFAULT_CALENDAR_ID: CalendarId = "north-indian";

export function isCalendarId(value: unknown): value is CalendarId {
  return typeof value === "string" && BY_ID.has(value as CalendarId);
}

export function getCalendar(id: CalendarId): CalendarDefinition {
  return BY_ID.get(id) ?? BY_ID.get(DEFAULT_CALENDAR_ID)!;
}

export function searchCalendars(query: string): CalendarDefinition[] {
  const q = query.trim().toLowerCase();
  if (!q) return CALENDARS;
  return CALENDARS.filter((c) => {
    const hay = [c.id, c.name, c.nativeName, c.region, c.description, ...c.searchTerms]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

const LOCALE_PREFIX: Record<string, CalendarId> = {
  mai: "mithila",
  bh: "mithila",
  ne: "nepali",
  bn: "bengali",
  or: "odia",
  gu: "gujarati",
  mr: "marathi",
  te: "telugu",
  kn: "kannada",
  ta: "tamil",
  ml: "malayalam",
  pa: "punjabi",
  hi: "north-indian",
};

/** Best-effort calendar suggestion from a BCP-47 language tag. */
export function suggestCalendarFromLocale(tag?: string): CalendarId {
  if (!tag) return DEFAULT_CALENDAR_ID;
  const lang = tag.toLowerCase().split("-")[0];
  return LOCALE_PREFIX[lang] ?? DEFAULT_CALENDAR_ID;
}

export const TRADITIONS: {
  id: TraditionId;
  name: string;
  nativeName: string;
  summary: string;
}[] = [
  {
    id: "smarta",
    name: "Smarta",
    nativeName: "Smarta",
    summary: "Fast on the civil day when Ekadashi tithi is present at sunrise. Followed by most households.",
  },
  {
    id: "vaishnava",
    name: "Vaishnava",
    nativeName: "Vaishnava",
    summary:
      "Requires a pure (shuddha) Ekadashi. If Dashami touches sunrise, the fast is observed the next day.",
  },
];

export function traditionLabel(id: TraditionId): string {
  return TRADITIONS.find((t) => t.id === id)?.name ?? id;
}

export function formatLunarMonth(month: HinduMonth, adhika: boolean, calendarId: CalendarId): string {
  const cal = getCalendar(calendarId);
  const label = cal.lunarMonths[month];
  const name = label.name;
  return adhika ? `Adhika ${name}` : name;
}
