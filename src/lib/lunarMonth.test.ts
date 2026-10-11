import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { julianDay, newMoonAfter } from "./astronomy";
import {
  amantaMonthAt,
  chaitraShukla1,
  gauraPurnima,
  kaliYear,
  kartikShukla1,
  lunarContextForIso,
  meshaSankrantiIso,
  samvatsaraName,
} from "./lunarMonth";

function adhikaMonths(fromYear: number, toYear: number): string[] {
  const out: string[] = [];
  let jd = newMoonAfter(julianDay(fromYear, 1, 1));
  while (jd < julianDay(toYear + 1, 1, 1)) {
    const month = amantaMonthAt(jd + 1);
    if (month.adhika) {
      const start = new Date((month.startJd - 2440587.5) * 86_400_000 + 5.5 * 3_600_000);
      out.push(`${start.toISOString().slice(0, 7)} ${month.month}`);
    }
    jd = month.endJd;
  }
  return out;
}

describe("lunar months", () => {
  it("finds the Adhika months of 2026–2034 from sankrantis", () => {
    assert.deepEqual(adhikaMonths(2026, 2034), [
      "2026-05 Jyeshtha",
      "2029-03 Chaitra",
      "2031-08 Bhadrapada",
      "2034-06 Ashadha",
    ]);
  });

  it("labels Padmini and Parama inside the Adhika month and Nirjala after it", () => {
    const padmini = lunarContextForIso("2026-05-27");
    assert.equal(padmini.adhika, true);
    assert.equal(padmini.paksha, "Shukla");
    assert.equal(padmini.monthPurnimanta, "Jyeshtha");
    const parama = lunarContextForIso("2026-06-11");
    assert.equal(parama.adhika, true);
    assert.equal(parama.paksha, "Krishna");
    assert.equal(parama.monthAmanta, "Jyeshtha");
    const nirjala = lunarContextForIso("2026-06-25");
    assert.equal(nirjala.adhika, false);
    assert.equal(nirjala.monthPurnimanta, "Jyeshtha");
  });

  it("maps a Krishna paksha to the next purnimanta month", () => {
    const aja = lunarContextForIso("2026-09-07");
    assert.equal(aja.tithi, 11);
    assert.equal(aja.paksha, "Krishna");
    assert.equal(aja.monthAmanta, "Shravana");
    assert.equal(aja.monthPurnimanta, "Bhadrapada");
  });
});

describe("era boundaries", () => {
  it("computes Chaitra Shukla Pratipada, including the Adhika Chaitra year", () => {
    assert.equal(chaitraShukla1(2026), "2026-03-19");
    assert.equal(chaitraShukla1(2029), "2029-03-16");
    assert.equal(chaitraShukla1(2030), "2030-04-03");
  });

  it("computes Kartik Shukla Pratipada and Gaura Purnima", () => {
    assert.equal(kartikShukla1(2026), "2026-11-10");
    assert.equal(kartikShukla1(2028), "2028-10-18");
    assert.equal(gauraPurnima(2026), "2026-03-03");
    assert.equal(gauraPurnima(2028), "2028-03-11");
  });

  it("names the Tamil solar year", () => {
    assert.equal(meshaSankrantiIso(2026), "2026-04-14");
    assert.equal(samvatsaraName(2026), "Parabhava");
    assert.equal(kaliYear(2026), 5127);
    assert.equal(samvatsaraName(2032), "Paridhavi");
    assert.equal(samvatsaraName(2046), "Akshaya");
    assert.equal(samvatsaraName(2047), "Prabhava");
  });
});
