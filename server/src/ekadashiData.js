// Reference dataset of the 24 annual Ekadashi observances.
//
// Ekadashi is the 11th lunar day (tithi) of each fortnight (paksha) in the
// Hindu lunar calendar and is traditionally observed with fasting. There are
// two Ekadashis each lunar month — one in the waxing fortnight (Shukla paksha)
// and one in the waning fortnight (Krishna paksha) — for 24 in a normal year.
//
// The Gregorian dates below are a curated reference for the year 2026. Precise
// dates depend on regional panchang (almanac) calculations; this dataset is
// intended as an illustrative, self-contained reference for the app.

export const EKADASHIS_2026 = [
  { date: "2026-01-05", name: "Pausha Putrada", paksha: "Shukla", hinduMonth: "Pausha", description: "Observed for the well-being and blessing of children." },
  { date: "2026-01-20", name: "Shattila", paksha: "Krishna", hinduMonth: "Magha", description: "Marked by charity involving sesame (til) in six ways." },
  { date: "2026-02-03", name: "Jaya", paksha: "Shukla", hinduMonth: "Magha", description: "Said to free devotees from the fate of becoming ghosts." },
  { date: "2026-02-18", name: "Vijaya", paksha: "Krishna", hinduMonth: "Phalguna", description: "Associated with victory; observed by Lord Rama before crossing to Lanka." },
  { date: "2026-03-05", name: "Amalaki", paksha: "Shukla", hinduMonth: "Phalguna", description: "Honours the amalaki (Indian gooseberry) tree, sacred to Vishnu." },
  { date: "2026-03-20", name: "Papmochani", paksha: "Krishna", hinduMonth: "Chaitra", description: "Believed to wash away accumulated sins (papa)." },
  { date: "2026-04-03", name: "Kamada", paksha: "Shukla", hinduMonth: "Chaitra", description: "The 'fulfiller of desires'; first Ekadashi of the lunar new year." },
  { date: "2026-04-18", name: "Varuthini", paksha: "Krishna", hinduMonth: "Vaishakha", description: "Grants protection and material as well as spiritual prosperity." },
  { date: "2026-05-03", name: "Mohini", paksha: "Shukla", hinduMonth: "Vaishakha", description: "Named after Vishnu's Mohini avatar; frees one from illusion (moha)." },
  { date: "2026-05-17", name: "Apara", paksha: "Krishna", hinduMonth: "Jyeshtha", description: "Bestows boundless (apara) merit and reputation." },
  { date: "2026-06-01", name: "Nirjala", paksha: "Shukla", hinduMonth: "Jyeshtha", description: "The strictest fast, kept without water (nir-jala)." },
  { date: "2026-06-16", name: "Yogini", paksha: "Krishna", hinduMonth: "Ashadha", description: "Observed to cure ailments and remove sins." },
  { date: "2026-07-01", name: "Devshayani", paksha: "Shukla", hinduMonth: "Ashadha", description: "Marks the start of Chaturmas, when Vishnu is said to rest." },
  { date: "2026-07-15", name: "Kamika", paksha: "Krishna", hinduMonth: "Shravana", description: "Worship of Vishnu with tulsi leaves brings great merit." },
  { date: "2026-07-30", name: "Shravana Putrada", paksha: "Shukla", hinduMonth: "Shravana", description: "Observed by couples seeking the blessing of children." },
  { date: "2026-08-14", name: "Aja", paksha: "Krishna", hinduMonth: "Bhadrapada", description: "Relieves suffering and restores lost fortune." },
  { date: "2026-08-28", name: "Parsva", paksha: "Shukla", hinduMonth: "Bhadrapada", description: "Also called Parivartini; Vishnu turns to his other side in yogic sleep." },
  { date: "2026-09-12", name: "Indira", paksha: "Krishna", hinduMonth: "Ashwin", description: "Observed to liberate one's ancestors (pitrs)." },
  { date: "2026-09-27", name: "Papankusha", paksha: "Shukla", hinduMonth: "Ashwin", description: "Acts as a 'goad' (ankusha) that keeps sin away." },
  { date: "2026-10-11", name: "Rama", paksha: "Krishna", hinduMonth: "Kartik", description: "Precedes Diwali; grants prosperity and devotion." },
  { date: "2026-10-26", name: "Devutthana", paksha: "Shukla", hinduMonth: "Kartik", description: "Also Prabodhini; Vishnu awakens, ending Chaturmas." },
  { date: "2026-11-10", name: "Utpanna", paksha: "Krishna", hinduMonth: "Margashirsha", description: "Celebrates the origin (utpanna) of the goddess Ekadashi." },
  { date: "2026-11-24", name: "Mokshada", paksha: "Shukla", hinduMonth: "Margashirsha", description: "Bestows liberation (moksha); coincides with Gita Jayanti." },
  { date: "2026-12-09", name: "Saphala", paksha: "Krishna", hinduMonth: "Pausha", description: "Makes one's endeavours fruitful (saphala)." }
];

const DATASETS = {
  2026: EKADASHIS_2026
};

export function getEkadashis(year = 2026) {
  return DATASETS[year] ?? [];
}

export function getAvailableYears() {
  return Object.keys(DATASETS).map(Number).sort((a, b) => a - b);
}

// Returns the next Ekadashi on or after `fromDate` (a Date), searching across
// all available years, or null if none remain in the dataset.
export function getNextEkadashi(fromDate = new Date()) {
  const startOfDay = new Date(Date.UTC(
    fromDate.getUTCFullYear(),
    fromDate.getUTCMonth(),
    fromDate.getUTCDate()
  ));

  const all = getAvailableYears().flatMap((year) => getEkadashis(year));
  const upcoming = all
    .map((e) => ({ ...e, when: new Date(`${e.date}T00:00:00Z`) }))
    .filter((e) => e.when >= startOfDay)
    .sort((a, b) => a.when - b.when);

  if (upcoming.length === 0) return null;

  const next = upcoming[0];
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysUntil = Math.round((next.when - startOfDay) / msPerDay);

  return {
    date: next.date,
    name: next.name,
    paksha: next.paksha,
    hinduMonth: next.hinduMonth,
    description: next.description,
    daysUntil
  };
}
