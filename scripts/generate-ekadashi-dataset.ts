/**
 * Build src/data/ekadashi-2026-2030.json from the Drik Panchang reference
 * (New Delhi): Smarta fasting days from the Smarta list, Vaishnava days from
 * the ISKCON list. Lunar month / Adhika flags come from the sankranti rule,
 * Parana windows from Delhi sunrise. The astronomy engine is cross-checked
 * against the same reference and any disagreement is printed.
 *
 *   npm run generate:dataset
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import reference from "./reference/drik-ekadashi-2026-2030.json";
import { getCity } from "../src/constants/cities";
import { addDaysIso } from "../src/lib/astronomy";
import { buildRecord, catalogKey, getCatalogEntry, inferLunarContext } from "../src/lib/ekadashiCatalog";
import { calculateParana, computeFastsInRange } from "../src/lib/ekadashiCompute";
import type { EkadashiDataset, EkadashiRecord } from "../src/types";

interface ReferenceEntry {
  date: string;
  name: string;
  tithiBegins?: string | null;
  tithiEnds?: string | null;
  parana?: [string, string] | null;
}

const smartaRef = reference.smarta as ReferenceEntry[];
const iskconRef = reference.iskcon as ReferenceEntry[];
const delhi = getCity("delhi");
const warnings: string[] = [];

const iskconByDate = new Map(iskconRef.map((entry) => [entry.date, entry]));
const usedIskcon = new Set<string>();

function vaishnavaDateFor(smartaDate: string, key: string): string {
  for (const delta of [0, 1, 2]) {
    const iso = addDaysIso(smartaDate, delta);
    const entry = iskconByDate.get(iso);
    if (!entry || usedIskcon.has(iso)) continue;
    const entryKey = entry.name ? catalogKey(entry.name) : key;
    if (entryKey !== key) {
      warnings.push(`ISKCON name "${entry.name}" on ${iso} does not match Smarta "${key}" on ${smartaDate}`);
    }
    usedIskcon.add(iso);
    return iso;
  }
  warnings.push(`No ISKCON date within two days of Smarta ${smartaDate} (${key}); using the Smarta day`);
  return smartaDate;
}

const records: EkadashiRecord[] = [...smartaRef]
  .sort((a, b) => (a.date < b.date ? -1 : 1))
  .map((entry) => {
    const canonical = getCatalogEntry(entry.name);
    const key = catalogKey(entry.name);
    const ctx = inferLunarContext(entry.date);
    // Padmini / Parama move with the Adhika month, so only fixed months are checked.
    if (ctx.paksha !== canonical.paksha || (!canonical.adhika && ctx.monthPurnimanta !== canonical.monthPurnimanta)) {
      warnings.push(
        `${entry.date} ${canonical.name}: catalog says ${canonical.paksha} ${canonical.monthPurnimanta}, astronomy says ${ctx.paksha} ${ctx.monthPurnimanta}${ctx.adhika ? " (adhika)" : ""}`
      );
    }
    const vaishnava = vaishnavaDateFor(entry.date, key);
    return buildRecord({
      name: canonical.name,
      smartaDate: entry.date,
      vaishnavaDate: vaishnava,
      smartaParana: calculateParana(entry.date, delhi, "smarta"),
      vaishnavaParana: calculateParana(vaishnava, delhi, "vaishnava"),
      origin: "published",
      paksha: ctx.paksha,
      monthPurnimanta: ctx.monthPurnimanta,
      adhika: ctx.adhika,
    });
  });

for (const entry of iskconRef) {
  if (!usedIskcon.has(entry.date)) warnings.push(`ISKCON ${entry.date} ${entry.name} was not paired with a Smarta day`);
}

const years = records.map((r) => Number(r.smarta.date.slice(0, 4)));
const minYear = Math.min(...years);
const maxYear = Math.max(...years);

// Cross-check the astronomy engine against the same published lists.
for (const tradition of ["smarta", "vaishnava"] as const) {
  const want = new Set((tradition === "smarta" ? smartaRef : iskconRef).map((e) => e.date));
  const got = new Set(computeFastsInRange(`${minYear}-01-01`, `${maxYear}-12-31`, delhi, tradition).map((f) => f.date));
  const missing = [...want].filter((d) => !got.has(d)).sort();
  const extra = [...got].filter((d) => !want.has(d)).sort();
  console.log(
    `engine ${tradition}: ${want.size - missing.length}/${want.size} reference days reproduced` +
      (missing.length ? `; missing ${missing.join(", ")}` : "") +
      (extra.length ? `; extra ${extra.join(", ")}` : "")
  );
}

const adhikaNote = records
  .filter((r) => r.adhika && r.paksha === "Shukla")
  .map((r) => `Adhika ${r.monthPurnimanta} ${r.smarta.date.slice(0, 4)}`)
  .join(" and ");

const dataset: EkadashiDataset = {
  meta: {
    region: "India",
    timezone: "Asia/Kolkata",
    note: `Published New Delhi panchang dates for ${minYear}–${maxYear} (Smarta from Drik Panchang, Vaishnava from the ISKCON calendar), including ${adhikaNote}. Parana is recalculated from the chosen city's sunrise, distant cities may shift the fasting day, and years after ${maxYear} are calculated from the same rules. Confirm with a local panchang before breaking the fast.`,
  },
  ekadashis: records,
};

const out = join(dirname(fileURLToPath(import.meta.url)), "../src/data/ekadashi-2026-2030.json");
writeFileSync(out, `${JSON.stringify(dataset, null, 2)}\n`);
console.log(`Wrote ${records.length} observances to ${out}`);
if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const w of warnings) console.log(`  - ${w}`);
}
