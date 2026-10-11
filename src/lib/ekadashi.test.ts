import assert from "node:assert/strict";
import { describe, it } from "node:test";

import reference from "../../scripts/reference/drik-ekadashi-2026-2030.json";
import {
  calculateRecordsInRange,
  daysUntil,
  getAllEkadashis,
  getEkadashiByDate,
  getEkadashiById,
  getEkadashiRecords,
  getEkadashisInMonth,
  getNextEkadashi,
  getObservance,
  getUpcomingEkadashis,
  getYearRange,
  horizonYear,
} from "./ekadashi";

const IN_RANGE = new Date(2026, 9, 11, 9, 0, 0);

describe("ekadashi dataset", () => {
  it("covers 2026–2030 with unique ids and both traditions", () => {
    const all = getAllEkadashis({}, IN_RANGE);
    assert.ok(all.length >= 120);
    const ids = new Set(all.map((e) => e.id));
    assert.equal(ids.size, all.length);
    const range = getYearRange(IN_RANGE);
    assert.equal(range.min, 2026);
    assert.equal(range.max, 2030);
  });

  it("matches the Drik Panchang Smarta list and the ISKCON list exactly", () => {
    const records = getEkadashiRecords();
    const smarta = records.map((r) => r.smarta.date).sort();
    const vaishnava = records.map((r) => r.vaishnava.date).sort();
    assert.deepEqual(smarta, reference.smarta.map((e) => e.date).sort());
    assert.deepEqual(vaishnava, reference.iskcon.map((e) => e.date).sort());
  });

  it("places the 2028–2029 Adhika month in Chaitra 2029, not Kartik 2028", () => {
    const byDate = new Map(getEkadashiRecords().map((r) => [r.smarta.date, r]));
    assert.equal(byDate.get("2028-10-28")?.name, "Devutthana");
    assert.equal(byDate.get("2028-10-28")?.adhika, undefined);
    assert.equal(byDate.get("2028-11-27")?.name, "Mokshada");
    assert.equal(byDate.get("2029-01-10")?.name, "Shattila");
    assert.equal(byDate.get("2029-03-26")?.name, "Padmini");
    assert.equal(byDate.get("2029-03-26")?.adhika, true);
    assert.equal(byDate.get("2029-03-26")?.monthPurnimanta, "Chaitra");
    assert.equal(byDate.get("2029-04-09")?.name, "Parama");
    assert.equal(byDate.get("2029-04-09")?.adhika, true);
    assert.equal(byDate.get("2029-04-24")?.name, "Kamada");
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

  it("uses ISKCON display names and dates", () => {
    const yogini = getEkadashiById("2026-07-10-yogini", { calendarId: "iskcon", tradition: "vaishnava" });
    const nirjala = getEkadashiById("2026-06-25-nirjala", { calendarId: "iskcon", tradition: "vaishnava" });
    const putrada = getEkadashiById("2026-08-23-shravana-putrada", { calendarId: "iskcon", tradition: "vaishnava" });
    assert.equal(nirjala?.name, "Pandava Nirjala");
    assert.equal(nirjala?.date, "2026-06-25");
    assert.equal(yogini?.name, "Yogini");
    assert.equal(yogini?.date, "2026-07-11");
    assert.equal(putrada?.name, "Pavitraropana");
    assert.equal(putrada?.date, "2026-08-24");
  });

  it("names Vaikuntha and Guruvayur Ekadashi from the solar month", () => {
    assert.equal(getEkadashiByDate("2026-12-20", { calendarId: "tamil" })?.name, "Vaikuntha");
    assert.equal(getEkadashiByDate("2028-01-08", { calendarId: "tamil" })?.name, "Vaikuntha");
    assert.equal(getEkadashiByDate("2027-12-09", { calendarId: "tamil" })?.name, "Mokshada");
    assert.equal(getEkadashiByDate("2027-12-09", { calendarId: "malayalam" })?.name, "Guruvayur");
    assert.equal(getEkadashiByDate("2026-12-20", { calendarId: "north-indian" })?.name, "Mokshada");
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
    const padmini = getAllEkadashis({}, IN_RANGE).find((e) => e.name === "Padmini" && e.date.startsWith("2029"));
    const devutthana = getEkadashiByDate("2030-11-05");
    const kamada = getAllEkadashis({ tradition: "vaishnava" }, IN_RANGE).find(
      (e) => e.name === "Kamada" && e.date.startsWith("2028")
    );
    assert.equal(padmini?.date, "2029-03-26");
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

  it("reproduces the published Smarta days when recalculated from astronomy", () => {
    const calculated = calculateRecordsInRange("2028-01-01", "2028-12-31", "delhi");
    const published = getEkadashiRecords().filter((r) => r.smarta.date.startsWith("2028"));
    assert.deepEqual(
      calculated.map((r) => `${r.smarta.date} ${r.name}`),
      published.map((r) => `${r.smarta.date} ${r.name}`)
    );
  });
});

describe("years beyond the bundled file", () => {
  const jan2031 = new Date(2031, 0, 15, 9, 0, 0);

  it("extends the horizon to next year as time passes", () => {
    assert.equal(horizonYear(IN_RANGE, "device"), 2030);
    assert.equal(horizonYear(new Date(2030, 6, 1), "device"), 2031);
    assert.equal(getYearRange(jan2031, "device").max, 2032);
  });

  it("calculates 2031 fasts with names, Parana and ids", () => {
    const upcoming = getUpcomingEkadashis(3, jan2031, "device", {
      tradition: "smarta",
      calendarId: "mithila",
      cityId: "darbhanga",
    });
    assert.equal(upcoming.length, 3);
    assert.equal(upcoming[0].date, "2031-01-19");
    assert.equal(upcoming[0].name, "Shattila");
    assert.equal(upcoming[0].source, "calculated");
    assert.match(upcoming[0].parana.start, /^\d{2}:\d{2}$/);
    const byId = getEkadashiById(upcoming[0].id, { tradition: "smarta", calendarId: "mithila", cityId: "darbhanga" });
    assert.equal(byId?.name, "Shattila");
    const year = getAllEkadashis({}, jan2031).filter((e) => e.date.startsWith("2031"));
    assert.equal(year.length, 25);
  });

  it("detects Adhika Bhadrapada 2031 and names Padmini / Parama", () => {
    const august = getEkadashisInMonth(2031, 7, { tradition: "smarta" });
    const september = getEkadashisInMonth(2031, 8, { tradition: "smarta" });
    assert.ok(august.some((e) => e.name === "Padmini" && e.adhika));
    assert.ok(september.some((e) => e.name === "Parama" && e.adhika && e.month === "Adhika Bhadrapada"));
    assert.ok(september.some((e) => e.name === "Parsva" && !e.adhika));
    assert.equal(getObservance(new Date(2031, 7, 28, 8), "device", { tradition: "smarta" }).kind, "fasting");
  });

  it("still works for a distant city", () => {
    const ny = getUpcomingEkadashis(2, jan2031, "America/New_York", { cityId: "new-york" });
    assert.equal(ny.length, 2);
    assert.equal(ny[0].source, "calculated");
  });
});
