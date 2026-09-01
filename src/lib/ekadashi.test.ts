import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  daysUntil,
  getAllEkadashis,
  getEkadashiById,
  getEkadashisInMonth,
  getNextEkadashi,
  getObservance,
  getUpcomingEkadashis,
  getYearRange,
} from "./ekadashi";

describe("ekadashi dataset", () => {
  it("covers 2026 and 2027 with unique ids", () => {
    const all = getAllEkadashis();
    assert.ok(all.length >= 48);
    const ids = new Set(all.map((e) => e.id));
    assert.equal(ids.size, all.length);
    const range = getYearRange();
    assert.equal(range.min, 2026);
    assert.equal(range.max, 2027);
  });

  it("includes the named fasts from the brief", () => {
    const names = new Set(getAllEkadashis().map((e) => e.name));
    for (const required of ["Nirjala", "Yogini", "Utpanna"]) {
      assert.ok(names.has(required), `missing ${required}`);
    }
  });

  it("finds the next Ekadashi after 1 Sep 2026 as Indira", () => {
    const now = new Date(2026, 8, 1, 10, 0, 0);
    const next = getNextEkadashi(now, "device");
    assert.ok(next);
    assert.equal(next?.name, "Indira");
    assert.equal(next?.date, "2026-09-12");
    assert.equal(daysUntil(next!.date, now, "device"), 11);
  });

  it("treats the fasting day itself as the next Ekadashi", () => {
    const now = new Date(2026, 5, 1, 8, 0, 0);
    const next = getNextEkadashi(now, "device");
    assert.equal(next?.name, "Nirjala");
    assert.equal(getObservance(now, "device").kind, "fasting");
  });

  it("detects a Parana day on the following morning", () => {
    const now = new Date(2026, 5, 2, 7, 0, 0);
    const obs = getObservance(now, "device");
    assert.equal(obs.kind, "parana");
    assert.equal(obs.ekadashi?.name, "Nirjala");
  });

  it("lists upcoming and monthly observances", () => {
    const now = new Date(2026, 8, 1);
    const upcoming = getUpcomingEkadashis(3, now, "device");
    assert.equal(upcoming.length, 3);
    assert.equal(upcoming[0].name, "Indira");
    const sept = getEkadashisInMonth(2026, 8);
    assert.equal(sept.length, 2);
    assert.ok(getEkadashiById("2026-09-12"));
  });

  it("finds Vaishnava next Ekadashi after 1 Sep 2026 as Annada", () => {
    const now = new Date(2026, 8, 1, 10, 0, 0);
    const next = getNextEkadashi(now, "device", "vaishnava");
    assert.ok(next);
    assert.equal(next?.name, "Annada");
    assert.equal(next?.date, "2026-09-07");
    const sept = getEkadashisInMonth(2026, 8, "vaishnava");
    assert.deepEqual(
      sept.map((e) => e.name),
      ["Annada", "Parsva"]
    );
  });

  it("uses Vaishnava Nirjala on 26 Jun 2026 and keeps Smarta on 1 Jun", () => {
    const vaishnavaDay = new Date(2026, 5, 26, 8, 0, 0);
    const smartaDay = new Date(2026, 5, 1, 8, 0, 0);
    assert.equal(getObservance(vaishnavaDay, "device", "vaishnava").ekadashi?.name, "Nirjala");
    assert.equal(getObservance(smartaDay, "device", "smarta").ekadashi?.name, "Nirjala");
    assert.equal(getObservance(smartaDay, "device", "vaishnava").kind, "none");
  });

  it("resolves an id from the other tradition as a fallback", () => {
    const smartaOnly = getEkadashiById("2026-09-12", "vaishnava");
    assert.equal(smartaOnly?.name, "Indira");
  });
});
