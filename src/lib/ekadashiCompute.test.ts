import assert from "node:assert/strict";
import { describe, it } from "node:test";

import reference from "../../scripts/reference/drik-ekadashi-2026-2030.json";
import { getCity } from "../constants/cities";
import { tithiBoundaryAfter } from "./astronomy";
import { calculateParana, computeFastsInRange, isFastDay, localSunriseOn } from "./ekadashiCompute";
import { wallTimeInZone } from "./timezone";

const delhi = getCity("delhi");
const IST = "Asia/Kolkata";

function minutesOf(hm: string): number {
  return Number(hm.slice(0, 2)) * 60 + Number(hm.slice(3, 5));
}

function refInstantMinutes(stamp: string): number {
  const [date, hm] = stamp.split(" ");
  return wallTimeInZone(date, hm, IST).getTime() / 60_000;
}

function jdMinutes(jd: number): number {
  return ((jd - 2440587.5) * 86_400_000) / 60_000;
}

describe("fasting-day rules vs Drik Panchang (New Delhi)", () => {
  const smartaWant = reference.smarta.map((e) => e.date).sort();
  const iskconWant = reference.iskcon.map((e) => e.date).sort();

  it("reproduces every Smarta fasting day for 2026–2030", () => {
    const got = computeFastsInRange("2026-01-01", "2030-12-31", delhi, "smarta").map((f) => f.date);
    assert.deepEqual(got, smartaWant);
  });

  it("reproduces the ISKCON fasting days (one borderline Purnima vriddhi aside)", () => {
    const got = computeFastsInRange("2026-01-01", "2030-12-31", delhi, "vaishnava").map((f) => f.date);
    const missing = iskconWant.filter((d) => !got.includes(d));
    const extra = got.filter((d) => !iskconWant.includes(d));
    // June 2026: the Purnima ends ~2 min after the second sunrise in this
    // ephemeris, so Pakshavardhini fires; Drik's ephemeris says it does not.
    assert.deepEqual(missing, ["2026-06-25"]);
    assert.deepEqual(extra, ["2026-06-26"]);
  });

  it("applies kshaya, vriddhi, trisprsa and arunodaya rules", () => {
    // Yogini 2026: Ekadashi arises after sunrise on the 10th and ends before sunrise on the 11th.
    assert.equal(isFastDay("2026-07-10", delhi, "smarta"), true);
    assert.equal(isFastDay("2026-07-11", delhi, "smarta"), false);
    assert.equal(isFastDay("2026-07-10", delhi, "vaishnava"), false);
    assert.equal(isFastDay("2026-07-11", delhi, "vaishnava"), true);
    // Padmini 2026: Ekadashi at two sunrises → second day for both.
    assert.equal(isFastDay("2026-05-26", delhi, "smarta"), false);
    assert.equal(isFastDay("2026-05-27", delhi, "smarta"), true);
    assert.equal(isFastDay("2026-05-27", delhi, "vaishnava"), true);
    // Pausha Putrada 2027: Dwadashi ends before the next sunrise → Smarta moves back a day.
    assert.equal(isFastDay("2027-01-18", delhi, "smarta"), true);
    assert.equal(isFastDay("2027-01-19", delhi, "smarta"), false);
    assert.equal(isFastDay("2027-01-19", delhi, "vaishnava"), true);
    // Rama 2027: Dashami touches arunodaya → Vaishnava shifts, Smarta does not.
    assert.equal(isFastDay("2027-10-25", delhi, "smarta"), true);
    assert.equal(isFastDay("2027-10-25", delhi, "vaishnava"), false);
    assert.equal(isFastDay("2027-10-26", delhi, "vaishnava"), true);
  });

  it("keeps Vanjuli and Pakshavardhini Mahadvadashi fasts on Dwadashi", () => {
    assert.equal(isFastDay("2026-08-23", delhi, "vaishnava"), false);
    assert.equal(isFastDay("2026-08-24", delhi, "vaishnava"), true);
    assert.equal(isFastDay("2027-06-14", delhi, "vaishnava"), false);
    assert.equal(isFastDay("2027-06-15", delhi, "vaishnava"), true);
    assert.equal(isFastDay("2028-10-29", delhi, "vaishnava"), true);
  });

  it("places tithi boundaries within five minutes of the published panchang", () => {
    let worst = 0;
    for (const entry of reference.smarta) {
      if (!entry.tithiBegins || !entry.tithiEnds) continue;
      const day = localSunriseOn(entry.date, delhi)!;
      const index = day.tithiIndex <= 15 ? 11 : 26;
      const start = tithiBoundaryAfter(day.riseJd - 1.6, index - 1);
      const end = tithiBoundaryAfter(start + 0.01, index);
      const beginError = Math.abs(jdMinutes(start) - refInstantMinutes(entry.tithiBegins));
      const endError = Math.abs(jdMinutes(end) - refInstantMinutes(entry.tithiEnds));
      worst = Math.max(worst, beginError, endError);
    }
    assert.ok(worst <= 5, `worst tithi boundary error ${worst.toFixed(1)} min`);
  });
});

describe("Parana windows", () => {
  it("matches the ISKCON Parana windows within five minutes", () => {
    let worst = 0;
    for (const entry of reference.iskcon) {
      if (!entry.parana) continue;
      const parana = calculateParana(entry.date, delhi, "vaishnava");
      const [start, end] = entry.parana;
      worst = Math.max(
        worst,
        Math.abs(minutesOf(parana.start) - minutesOf(start)),
        Math.abs(minutesOf(parana.end) - minutesOf(end))
      );
    }
    assert.ok(worst <= 5, `worst Parana error ${worst} min`);
  });

  it("matches Drik's Smarta Parana (Pratahkal, Dwadashi cap, Aparahna)", () => {
    const samples: [string, string, string][] = [
      ["2026-06-25", "05:25", "08:13"],
      ["2026-01-14", "07:15", "09:21"],
      ["2026-03-29", "06:14", "07:09"],
      ["2026-09-07", "06:02", "08:33"],
      ["2026-07-10", "13:50", "16:36"],
      ["2026-11-20", "13:11", "15:18"],
      ["2027-01-18", "13:35", "15:42"],
      ["2027-04-02", "13:40", "16:10"],
      ["2027-10-25", "13:12", "15:27"],
    ];
    for (const [fast, start, end] of samples) {
      const parana = calculateParana(fast, delhi, "smarta");
      assert.ok(Math.abs(minutesOf(parana.start) - minutesOf(start)) <= 3, `${fast} start ${parana.start} vs ${start}`);
      assert.ok(Math.abs(minutesOf(parana.end) - minutesOf(end)) <= 3, `${fast} end ${parana.end} vs ${end}`);
    }
  });

  it("breaks the fast after sunrise when Dwadashi ended overnight", () => {
    const gauna = calculateParana("2026-07-11", delhi, "vaishnava");
    assert.equal(gauna.date, "2026-07-12");
    assert.equal(gauna.start, "05:31");
    assert.ok(minutesOf(gauna.end) > minutesOf("10:00"));
  });
});
