import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  calculateRecordsInRange,
  daysUntil,
  getAllEkadashis,
  getEkadashiByDate,
  getEkadashiById,
  getEkadashisInMonth,
  getNextEkadashi,
  getObservance,
  getUpcomingEkadashis,
  getYearRange,
} from "./ekadashi";

describe("ekadashi dataset", () => {
  it("covers 2026–2030 with unique ids and both traditions", () => {
    const all = getAllEkadashis();
    assert.ok(all.length >= 120);
    const ids = new Set(all.map((e) => e.id));
    assert.equal(ids.size, all.length);
    const range = getYearRange();
    assert.equal(range.min, 2026);
    assert.equal(range.max, 2030);
  });

  it("includes Adhika-masa fasts and the named observances", () => {
    const names = new Set(getAllEkadashis().map((e) => e.name));
    for (const required of ["Nirjala", "Yogini", "Utpanna", "Padmini", "Parama"]) {
      assert.ok(names.has(required), `missing ${required}`);
    }
    const padmini = getAllEkadashis().find((e) => e.name === "Padmini");
    assert.equal(padmini?.adhika, true);
    assert.equal(padmini?.date, "2026-05-27");
  });

  it("finds the next Ekadashi after 1 Sep 2026 as Aja (Smarta)", () => {
    const now = new Date(2026, 8, 1, 10, 0, 0);
    const next = getNextEkadashi(now, "device");
    assert.ok(next);
    assert.equal(next?.name, "Aja");
    assert.equal(next?.date, "2026-09-07");
    assert.equal(daysUntil(next!.date, now, "device"), 6);
  });

  it("uses Vaishnava dates when that tradition is selected", () => {
    const now = new Date(2026, 6, 1, 8, 0, 0);
    const smarta = getNextEkadashi(now, "device", { tradition: "smarta" });
    const vaishnava = getNextEkadashi(now, "device", { tradition: "vaishnava" });
    assert.equal(smarta?.name, "Yogini");
    assert.equal(smarta?.date, "2026-07-10");
    assert.equal(vaishnava?.name, "Yogini");
    assert.equal(vaishnava?.date, "2026-07-11");
    assert.ok(vaishnava?.otherTraditionDate);
  });

  it("labels Mithila and Gujarati months differently for Krishna paksha", () => {
    const ajaNorth = getEkadashiByDate("2026-09-07", { calendarId: "north-indian" });
    const ajaGuj = getEkadashiByDate("2026-09-07", { calendarId: "gujarati" });
    const ajaMithila = getEkadashiByDate("2026-09-07", { calendarId: "mithila" });
    assert.equal(ajaNorth?.month, "Bhadrapada");
    assert.equal(ajaGuj?.month, "Shravan");
    assert.equal(ajaMithila?.month, "Bhado");
  });

  it("uses ISKCON display names", () => {
    const yogini = getEkadashiById("2026-07-10-yogini", { calendarId: "iskcon", tradition: "vaishnava" });
    const nirjala = getEkadashiById("2026-06-25-nirjala", { calendarId: "iskcon", tradition: "vaishnava" });
    assert.equal(nirjala?.name, "Pandava Nirjala");
    assert.equal(nirjala?.date, "2026-06-26");
    assert.equal(yogini?.name, "Yogini");
  });

  it("treats the fasting day itself as the next Ekadashi", () => {
    const now = new Date(2026, 5, 25, 8, 0, 0);
    const next = getNextEkadashi(now, "device");
    assert.equal(next?.name, "Nirjala");
    assert.equal(getObservance(now, "device").kind, "fasting");
  });

  it("detects a Parana day on the following morning", () => {
    const now = new Date(2026, 5, 26, 7, 0, 0);
    const obs = getObservance(now, "device");
    assert.equal(obs.kind, "parana");
    assert.equal(obs.ekadashi?.name, "Nirjala");
  });

  it("lists upcoming and monthly observances", () => {
    const now = new Date(2026, 8, 1);
    const upcoming = getUpcomingEkadashis(3, now, "device");
    assert.equal(upcoming.length, 3);
    assert.equal(upcoming[0].name, "Aja");
    const sept = getEkadashisInMonth(2026, 8);
    assert.equal(sept.length, 2);
    assert.ok(getEkadashiById("2026-09-07-aja"));
  });

  it("keeps published India dates for Delhi and recalculates Parana", () => {
    const aja = getEkadashiByDate("2026-09-07", { cityId: "delhi" });
    assert.equal(aja?.date, "2026-09-07");
    assert.equal(aja?.source, "published");
    assert.equal(aja?.localAdjusted, false);
    assert.equal(aja?.parana.date, "2026-09-08");
    assert.match(aja?.parana.start ?? "", /^\d{2}:\d{2}$/);
  });

  it("embeds published 2028–2030 dates including Adhika and Devutthana", () => {
    const padmini = getAllEkadashis().find((e) => e.name === "Padmini" && e.date.startsWith("2028"));
    const devutthana = getEkadashiByDate("2030-11-05");
    const kamada = getAllEkadashis({ tradition: "vaishnava" }).find(
      (e) => e.name === "Kamada" && e.date.startsWith("2028")
    );
    assert.equal(padmini?.date, "2028-10-28");
    assert.equal(padmini?.adhika, true);
    assert.equal(devutthana?.name, "Devutthana");
    assert.equal(kamada?.date, "2028-04-06");
  });

  it("keeps Delhi on the published date and can calculate a local fallback", () => {
    const delhi = getEkadashiById("2026-07-10-yogini", { tradition: "smarta", cityId: "delhi" });
    const ny = getEkadashiById("2026-07-10-yogini", { tradition: "smarta", cityId: "new-york" });
    assert.equal(delhi?.date, "2026-07-10");
    assert.equal(delhi?.source, "published");
    assert.ok(ny?.date);
    const calculated = calculateRecordsInRange("2026-09-01", "2026-09-15", "delhi");
    assert.ok(calculated.length >= 1);
    assert.equal(calculated[0]?.origin, "calculated");
  });
});
