/**
 * Merge curated 2026–2027 dates with published 2028–2030 India dates.
 * Parana windows are calculated from Delhi sunrise. Missing splits stay
 * on the published civil day; the app recalculates locally at runtime.
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import curated from "../src/data/ekadashi-2026-2027.json";
import { getCity } from "../src/constants/cities";
import { buildRecord } from "../src/lib/ekadashiCatalog";
import { calculateParana } from "../src/lib/ekadashiCompute";
import type { EkadashiDataset, EkadashiRecord, HinduMonth } from "../src/types";

interface Seed {
  name: string;
  smarta: string;
  vaishnava?: string;
  adhika?: boolean;
  monthPurnimanta?: HinduMonth;
}

/** Published New Delhi / Nakshatrica / AstroSage dates. */
const SEEDS: Seed[] = [
  { name: "Pausha Putrada", smarta: "2028-01-08" },
  { name: "Shattila", smarta: "2028-01-22" },
  { name: "Jaya", smarta: "2028-02-07" },
  { name: "Vijaya", smarta: "2028-02-20" },
  { name: "Amalaki", smarta: "2028-03-07" },
  { name: "Papmochani", smarta: "2028-03-21" },
  { name: "Kamada", smarta: "2028-04-05", vaishnava: "2028-04-06" },
  { name: "Varuthini", smarta: "2028-04-20" },
  { name: "Mohini", smarta: "2028-05-05" },
  { name: "Apara", smarta: "2028-05-20" },
  { name: "Nirjala", smarta: "2028-06-03" },
  { name: "Yogini", smarta: "2028-06-18" },
  { name: "Devshayani", smarta: "2028-07-02" },
  { name: "Kamika", smarta: "2028-07-18" },
  { name: "Shravana Putrada", smarta: "2028-08-01" },
  { name: "Aja", smarta: "2028-08-16", vaishnava: "2028-08-17" },
  { name: "Parsva", smarta: "2028-08-30" },
  { name: "Indira", smarta: "2028-09-15" },
  { name: "Papankusha", smarta: "2028-09-29" },
  { name: "Rama", smarta: "2028-10-14" },
  { name: "Padmini", smarta: "2028-10-28", adhika: true, monthPurnimanta: "Kartik" },
  { name: "Parama", smarta: "2028-11-13", adhika: true, monthPurnimanta: "Kartik" },
  { name: "Devutthana", smarta: "2028-11-27" },
  { name: "Utpanna", smarta: "2028-12-12" },
  { name: "Mokshada", smarta: "2028-12-27" },

  { name: "Saphala", smarta: "2029-01-10" },
  { name: "Pausha Putrada", smarta: "2029-01-26" },
  { name: "Shattila", smarta: "2029-02-09" },
  { name: "Jaya", smarta: "2029-02-25" },
  { name: "Vijaya", smarta: "2029-03-10" },
  { name: "Amalaki", smarta: "2029-03-26" },
  { name: "Papmochani", smarta: "2029-04-09" },
  { name: "Kamada", smarta: "2029-04-25" },
  { name: "Varuthini", smarta: "2029-05-09" },
  { name: "Mohini", smarta: "2029-05-24" },
  { name: "Apara", smarta: "2029-06-07" },
  { name: "Nirjala", smarta: "2029-06-22" },
  { name: "Yogini", smarta: "2029-07-07" },
  { name: "Devshayani", smarta: "2029-07-21" },
  { name: "Kamika", smarta: "2029-08-06" },
  { name: "Shravana Putrada", smarta: "2029-08-20" },
  { name: "Aja", smarta: "2029-09-04" },
  { name: "Parsva", smarta: "2029-09-18" },
  { name: "Indira", smarta: "2029-10-04" },
  { name: "Papankusha", smarta: "2029-10-18" },
  { name: "Rama", smarta: "2029-11-02" },
  { name: "Devutthana", smarta: "2029-11-16" },
  { name: "Utpanna", smarta: "2029-12-02" },
  { name: "Mokshada", smarta: "2029-12-16" },
  { name: "Saphala", smarta: "2029-12-31" },

  { name: "Pausha Putrada", smarta: "2030-01-15" },
  { name: "Shattila", smarta: "2030-01-29" },
  { name: "Jaya", smarta: "2030-02-14" },
  { name: "Vijaya", smarta: "2030-02-28" },
  { name: "Amalaki", smarta: "2030-03-15" },
  { name: "Papmochani", smarta: "2030-03-29" },
  { name: "Kamada", smarta: "2030-04-14" },
  { name: "Varuthini", smarta: "2030-04-28" },
  { name: "Mohini", smarta: "2030-05-14" },
  { name: "Apara", smarta: "2030-05-27", vaishnava: "2030-05-28" },
  { name: "Nirjala", smarta: "2030-06-12" },
  { name: "Yogini", smarta: "2030-06-26" },
  { name: "Devshayani", smarta: "2030-07-11" },
  { name: "Kamika", smarta: "2030-07-26" },
  { name: "Shravana Putrada", smarta: "2030-08-09" },
  { name: "Aja", smarta: "2030-08-24" },
  { name: "Parsva", smarta: "2030-09-08" },
  { name: "Indira", smarta: "2030-09-23" },
  { name: "Papankusha", smarta: "2030-10-07" },
  { name: "Rama", smarta: "2030-10-23" },
  { name: "Devutthana", smarta: "2030-11-05" },
  { name: "Utpanna", smarta: "2030-11-21" },
  { name: "Mokshada", smarta: "2030-12-05" },
  { name: "Saphala", smarta: "2030-12-21" },
];

const delhi = getCity("delhi");
const extra: EkadashiRecord[] = SEEDS.map((seed) => {
  const vaishnava = seed.vaishnava ?? seed.smarta;
  return buildRecord({
    name: seed.name,
    smartaDate: seed.smarta,
    vaishnavaDate: vaishnava,
    smartaParana: calculateParana(seed.smarta, delhi, "smarta"),
    vaishnavaParana: calculateParana(vaishnava, delhi, "vaishnava"),
    origin: "published",
    adhika: seed.adhika,
    monthPurnimanta: seed.monthPurnimanta,
  });
});

const curatedRows = (curated as EkadashiDataset).ekadashis.map((row) => ({
  ...row,
  origin: "published" as const,
}));

const dataset: EkadashiDataset = {
  meta: {
    region: "India",
    timezone: "Asia/Kolkata",
    note: "Five-year India Standard Time reference (2026–2030), including Adhika months in 2026 and 2028. Published panchang dates are stored in the app; Parana is recalculated from the chosen city's sunrise. Distant cities may shift the fasting day by a day. Confirm with a local panchang before breaking the fast.",
  },
  ekadashis: [...curatedRows, ...extra],
};

const out = join(dirname(fileURLToPath(import.meta.url)), "../src/data/ekadashi-2026-2030.json");
writeFileSync(out, `${JSON.stringify(dataset, null, 2)}\n`);
console.log(`Wrote ${dataset.ekadashis.length} observances to ${out}`);
