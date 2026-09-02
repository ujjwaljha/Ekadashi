import { addDaysIso, julianDay, nextElongation, rashiIndex, tithiAt } from "@/lib/astronomy";
import type { CalendarId, EkadashiRecord, HinduMonth, Paksha, Parana } from "@/types";
import { HINDU_MONTHS } from "@/types";

export interface CatalogEntry {
  name: string;
  paksha: Paksha;
  monthPurnimanta: HinduMonth;
  adhika?: boolean;
  significance: string;
  names?: Partial<Record<CalendarId, string>>;
}

const PREV: Record<HinduMonth, HinduMonth> = {
  Chaitra: "Phalguna",
  Vaishakha: "Chaitra",
  Jyeshtha: "Vaishakha",
  Ashadha: "Jyeshtha",
  Shravana: "Ashadha",
  Bhadrapada: "Shravana",
  Ashwin: "Bhadrapada",
  Kartik: "Ashwin",
  Margashirsha: "Kartik",
  Pausha: "Margashirsha",
  Magha: "Pausha",
  Phalguna: "Magha",
};

export function amantaMonth(purnimanta: HinduMonth, paksha: Paksha): HinduMonth {
  return paksha === "Shukla" ? purnimanta : PREV[purnimanta];
}

export const EKADASHI_CATALOG: Record<string, CatalogEntry> = {
  shattila: {
    name: "Shattila",
    paksha: "Krishna",
    monthPurnimanta: "Magha",
    significance: "Marked by charity involving sesame (til) in six ways.",
  },
  jaya: {
    name: "Jaya",
    paksha: "Shukla",
    monthPurnimanta: "Magha",
    significance: "Said to free devotees from the fate of becoming ghosts.",
    names: { iskcon: "Bhaimi" },
  },
  vijaya: {
    name: "Vijaya",
    paksha: "Krishna",
    monthPurnimanta: "Phalguna",
    significance: "Associated with victory; observed by Lord Rama before crossing to Lanka.",
  },
  amalaki: {
    name: "Amalaki",
    paksha: "Shukla",
    monthPurnimanta: "Phalguna",
    significance: "Honours the amalaki (Indian gooseberry) tree, sacred to Vishnu.",
  },
  papmochani: {
    name: "Papmochani",
    paksha: "Krishna",
    monthPurnimanta: "Chaitra",
    significance: "Believed to wash away accumulated sins (papa).",
  },
  kamada: {
    name: "Kamada",
    paksha: "Shukla",
    monthPurnimanta: "Chaitra",
    significance: "The fulfiller of desires; first Ekadashi of the lunar new year in many panchangs.",
  },
  varuthini: {
    name: "Varuthini",
    paksha: "Krishna",
    monthPurnimanta: "Vaishakha",
    significance: "Grants protection and material as well as spiritual prosperity.",
  },
  mohini: {
    name: "Mohini",
    paksha: "Shukla",
    monthPurnimanta: "Vaishakha",
    significance: "Named after Vishnu's Mohini avatar; frees one from illusion (moha).",
  },
  apara: {
    name: "Apara",
    paksha: "Krishna",
    monthPurnimanta: "Jyeshtha",
    significance: "Bestows boundless (apara) merit and reputation.",
  },
  padmini: {
    name: "Padmini",
    paksha: "Shukla",
    monthPurnimanta: "Jyeshtha",
    adhika: true,
    significance: "Rare Adhika-masa Ekadashi of Purushottama month, observed only in leap-lunar years.",
  },
  parama: {
    name: "Parama",
    paksha: "Krishna",
    monthPurnimanta: "Jyeshtha",
    adhika: true,
    significance: "The Krishna-paksha Ekadashi of Adhika masa (Purushottama masa).",
  },
  nirjala: {
    name: "Nirjala",
    paksha: "Shukla",
    monthPurnimanta: "Jyeshtha",
    significance: "The strictest fast, kept without water (nir-jala).",
    names: { iskcon: "Pandava Nirjala" },
  },
  yogini: {
    name: "Yogini",
    paksha: "Krishna",
    monthPurnimanta: "Ashadha",
    significance: "Observed to cure ailments and remove sins.",
  },
  devshayani: {
    name: "Devshayani",
    paksha: "Shukla",
    monthPurnimanta: "Ashadha",
    significance: "Marks the start of Chaturmas, when Vishnu is said to rest.",
    names: { iskcon: "Sayana", tamil: "Shayani" },
  },
  kamika: {
    name: "Kamika",
    paksha: "Krishna",
    monthPurnimanta: "Shravana",
    significance: "Worship of Vishnu with tulsi leaves brings great merit.",
  },
  "shravana-putrada": {
    name: "Shravana Putrada",
    paksha: "Shukla",
    monthPurnimanta: "Shravana",
    significance: "Observed by couples seeking the blessing of children.",
    names: { iskcon: "Pavitraropana" },
  },
  aja: {
    name: "Aja",
    paksha: "Krishna",
    monthPurnimanta: "Bhadrapada",
    significance: "Relieves suffering and restores lost fortune.",
    names: { iskcon: "Annada" },
  },
  parsva: {
    name: "Parsva",
    paksha: "Shukla",
    monthPurnimanta: "Bhadrapada",
    significance: "Also called Parivartini; Vishnu turns to his other side in yogic sleep.",
  },
  indira: {
    name: "Indira",
    paksha: "Krishna",
    monthPurnimanta: "Ashwin",
    significance: "Observed to liberate one's ancestors (pitrs).",
  },
  papankusha: {
    name: "Papankusha",
    paksha: "Shukla",
    monthPurnimanta: "Ashwin",
    significance: "Acts as a goad (ankusha) that keeps sin away.",
  },
  rama: {
    name: "Rama",
    paksha: "Krishna",
    monthPurnimanta: "Kartik",
    significance: "Precedes Diwali; grants prosperity and devotion.",
  },
  devutthana: {
    name: "Devutthana",
    paksha: "Shukla",
    monthPurnimanta: "Kartik",
    significance: "Also Prabodhini; Vishnu awakens, ending Chaturmas.",
    names: { iskcon: "Utthana" },
  },
  utpanna: {
    name: "Utpanna",
    paksha: "Krishna",
    monthPurnimanta: "Margashirsha",
    significance: "Celebrates the origin (utpanna) of the goddess Ekadashi.",
  },
  mokshada: {
    name: "Mokshada",
    paksha: "Shukla",
    monthPurnimanta: "Margashirsha",
    significance: "Bestows liberation (moksha); coincides with Gita Jayanti and South-Indian Vaikuntha Ekadashi.",
    names: { tamil: "Vaikuntha", malayalam: "Vaikuntha", iskcon: "Moksada" },
  },
  saphala: {
    name: "Saphala",
    paksha: "Krishna",
    monthPurnimanta: "Pausha",
    significance: "Makes one's endeavours fruitful (saphala).",
  },
  "pausha-putrada": {
    name: "Pausha Putrada",
    paksha: "Shukla",
    monthPurnimanta: "Pausha",
    significance: "Observed for the well-being and blessing of children.",
  },
};

const ALIASES: Record<string, string> = {
  shattila: "shattila",
  "sat-tila": "shattila",
  jaya: "jaya",
  bhaimi: "jaya",
  bhami: "jaya",
  vijaya: "vijaya",
  amalaki: "amalaki",
  papmochani: "papmochani",
  papamochani: "papmochani",
  kamada: "kamada",
  varuthini: "varuthini",
  mohini: "mohini",
  apara: "apara",
  padmini: "padmini",
  parama: "parama",
  nirjala: "nirjala",
  "pandava-nirjala": "nirjala",
  yogini: "yogini",
  devshayani: "devshayani",
  "deva-shayani": "devshayani",
  sayana: "devshayani",
  shayani: "devshayani",
  kamika: "kamika",
  "shravana-putrada": "shravana-putrada",
  putrada: "pausha-putrada",
  "pausha-putrada": "pausha-putrada",
  aja: "aja",
  annada: "aja",
  parsva: "parsva",
  parivartini: "parsva",
  indira: "indira",
  papankusha: "papankusha",
  rama: "rama",
  devutthana: "devutthana",
  prabodhini: "devutthana",
  utthana: "devutthana",
  utpanna: "utpanna",
  mokshada: "mokshada",
  moksada: "mokshada",
  vaikuntha: "mokshada",
  saphala: "saphala",
};

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function catalogKey(name: string): string {
  const slug = slugify(name);
  return ALIASES[slug] ?? slug;
}

export function getCatalogEntry(name: string): CatalogEntry {
  const key = catalogKey(name);
  const entry = EKADASHI_CATALOG[key];
  if (entry) return entry;
  return {
    name,
    paksha: "Shukla",
    monthPurnimanta: "Chaitra",
    significance: "The eleventh lunar day of the fortnight, dedicated to Vishnu.",
  };
}

export function traditionDates(date: string, parana: Parana): { date: string; parana: Parana } {
  return { date, parana };
}

export function buildRecord(input: {
  name: string;
  smartaDate: string;
  vaishnavaDate: string;
  smartaParana: Parana;
  vaishnavaParana: Parana;
  origin?: "published" | "calculated";
  monthPurnimanta?: HinduMonth;
  paksha?: Paksha;
  adhika?: boolean;
}): EkadashiRecord {
  const entry = getCatalogEntry(input.name);
  const paksha = input.paksha ?? entry.paksha;
  const monthPurnimanta = input.monthPurnimanta ?? entry.monthPurnimanta;
  const adhika = input.adhika ?? Boolean(entry.adhika);
  const record: EkadashiRecord = {
    id: `${input.smartaDate}-${slugify(entry.name)}`,
    name: entry.name,
    paksha,
    monthPurnimanta,
    monthAmanta: amantaMonth(monthPurnimanta, paksha),
    smarta: traditionDates(input.smartaDate, input.smartaParana),
    vaishnava: traditionDates(input.vaishnavaDate, input.vaishnavaParana),
    significance: entry.significance,
    origin: input.origin ?? "published",
  };
  if (adhika) record.adhika = true;
  if (entry.names) record.names = entry.names;
  return record;
}

/** Rashi of the nearby Purnima → purnimanta month of that full moon. */
function monthFromPurnimaJd(jd: number): HinduMonth {
  const rashi = rashiIndex(jd);
  return HINDU_MONTHS[(rashi + 1) % 12];
}

/**
 * Approximate lunar month from astronomy (used when a calculated fast
 * has no published name). Purnima rashi names the Shukla fortnight.
 */
export function inferLunarContext(iso: string): {
  paksha: Paksha;
  monthPurnimanta: HinduMonth;
  monthAmanta: HinduMonth;
} {
  const [y, m, d] = iso.split("-").map(Number);
  const jd = julianDay(y, m, d, 6.5);
  const info = tithiAt(jd);
  if (info.paksha === "Shukla") {
    const purnimaJd = nextElongation(jd, 180);
    const month = monthFromPurnimaJd(purnimaJd);
    return { paksha: "Shukla", monthPurnimanta: month, monthAmanta: month };
  }
  const prevPurnima = nextElongation(jd - 16, 180);
  const nextPurnima = nextElongation(jd, 180);
  const monthAmanta = monthFromPurnimaJd(prevPurnima);
  const monthPurnimanta = monthFromPurnimaJd(nextPurnima);
  return { paksha: "Krishna", monthPurnimanta, monthAmanta };
}

export function nameFromContext(paksha: Paksha, month: HinduMonth, adhika: boolean): string {
  if (adhika) return paksha === "Shukla" ? "Padmini" : "Parama";
  const found = Object.values(EKADASHI_CATALOG).find(
    (e) => e.paksha === paksha && e.monthPurnimanta === month && !e.adhika
  );
  return found?.name ?? (paksha === "Shukla" ? "Shukla" : "Krishna");
}

export function addCalendarDays(iso: string, days: number): string {
  return addDaysIso(iso, days);
}
