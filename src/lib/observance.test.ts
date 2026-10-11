import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { EKADASHI_SPECIALS } from "../constants/observance";
import { getEkadashiByDate, getEkadashiById } from "./ekadashi";
import { EKADASHI_CATALOG } from "./ekadashiCatalog";
import { buildObservanceGuide } from "./observance";

describe("observance guide", () => {
  it("has a special section for every named Ekadashi", () => {
    for (const key of Object.keys(EKADASHI_CATALOG)) {
      assert.ok(EKADASHI_SPECIALS[key], `missing special for ${key}`);
      assert.ok(EKADASHI_SPECIALS[key].rituals.length >= 2, `${key} needs rituals`);
    }
  });

  it("lays out Dashami, Ekadashi, Jagaran and Parana on the right dates", () => {
    const aja = getEkadashiByDate("2026-09-07")!;
    const guide = buildObservanceGuide(aja, "smarta");
    assert.deepEqual(
      guide.steps.map((s) => s.id),
      ["dashami", "ekadashi", "jagaran", "parana"]
    );
    assert.equal(guide.steps[0].date, "2026-09-06");
    assert.equal(guide.steps[1].date, "2026-09-07");
    assert.equal(guide.steps[3].date, aja.parana.date);
    assert.match(guide.steps[3].when ?? "", /AM|PM/);
    assert.equal(guide.key, "aja");
    assert.match(guide.intro, /Harishchandra/);
  });

  it("adds the waterless rules for Nirjala", () => {
    const nirjala = getEkadashiById("2026-06-25-nirjala")!;
    const guide = buildObservanceGuide(nirjala, "smarta");
    assert.ok(guide.steps[0].points.some((p) => /water before sunset/i.test(p)));
    assert.ok(guide.steps[1].points.some((p) => /no food and no water/i.test(p)));
    assert.ok(guide.steps[3].points.some((p) => /water first/i.test(p)));
  });

  it("explains the tradition's dating rule and the other tradition's day", () => {
    const yogini = getEkadashiById("2026-07-10-yogini", { tradition: "vaishnava", calendarId: "iskcon" })!;
    const guide = buildObservanceGuide(yogini, "vaishnava");
    assert.ok(guide.traditionNotes.some((n) => /arunodaya/i.test(n)));
    assert.ok(guide.traditionNotes.some((n) => /Smarta devotees keep this fast on 2026-07-10/.test(n)));
    assert.ok(guide.steps[3].points.some((p) => /Hari Vasara/.test(p)));
    const smarta = buildObservanceGuide(getEkadashiById("2026-07-10-yogini")!, "smarta");
    assert.ok(smarta.traditionNotes.some((n) => /sunrise rule/i.test(n)));
    assert.ok(smarta.traditionNotes.some((n) => /Vaishnava devotees keep this fast on 2026-07-11/.test(n)));
  });

  it("falls back to the general guidance for an unknown name", () => {
    const aja = getEkadashiByDate("2026-09-07")!;
    const guide = buildObservanceGuide({ ...aja, name: "Unknown" }, "smarta");
    assert.equal(guide.special.deity, "Vishnu");
    assert.equal(guide.levels.length, 3);
    assert.ok(guide.allowed.length > 3 && guide.avoided.length > 3);
  });
});
