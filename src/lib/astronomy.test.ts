import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getCity } from "../constants/cities";
import { sunLongitude, sunTimesUTC, tithiAt } from "./astronomy";
import { findLocalFastDate, localSunriseOn } from "./ekadashiCompute";

describe("sunrise", () => {
  it("keeps a January Delhi sunrise on the same civil day (no 24 h wrap)", () => {
    const delhi = getCity("delhi");
    const times = sunTimesUTC(2026, 1, 13, delhi.latitude, delhi.longitude);
    assert.equal(times.rise?.toISOString().slice(0, 13), "2026-01-13T01");
    assert.equal(times.set?.toISOString().slice(0, 13), "2026-01-13T12");
  });

  it("lets far-eastern sunrises fall on the previous UTC date", () => {
    const auckland = sunTimesUTC(2026, 1, 13, -36.8485, 174.7633);
    assert.equal(auckland.rise?.toISOString().slice(0, 10), "2026-01-12");
    assert.ok(auckland.set!.getTime() > auckland.rise!.getTime());
    const honolulu = sunTimesUTC(2026, 1, 13, 21.3069, -157.8583);
    assert.equal(honolulu.rise?.toISOString().slice(0, 13), "2026-01-13T17");
  });

  it("finds the January Shattila fast on its published day", () => {
    const delhi = getCity("delhi");
    assert.equal(findLocalFastDate("2026-01-14", delhi, "smarta"), "2026-01-14");
    assert.equal(localSunriseOn("2026-01-14", delhi)?.tithi, 11);
  });
});

describe("astronomy tithi", () => {
  it("places Delhi sunrise on 7 Sep 2026 on or near Krishna Ekadashi", () => {
    const delhi = getCity("delhi");
    const day = localSunriseOn("2026-09-07", delhi);
    assert.ok(day);
    assert.equal(day?.tithi, 11);
    assert.equal(day?.paksha, "Krishna");
  });

  it("places Delhi sunrise on 25 Jun 2026 on Nirjala (Shukla Ekadashi)", () => {
    const delhi = getCity("delhi");
    const day = localSunriseOn("2026-06-25", delhi);
    assert.ok(day);
    assert.equal(day?.tithi, 11);
    assert.equal(day?.paksha, "Shukla");
  });

  it("finds the Smarta fast on the published Aja date", () => {
    const delhi = getCity("delhi");
    const found = findLocalFastDate("2026-09-07", delhi, "smarta");
    assert.equal(found, "2026-09-07");
  });

  it("shifts Vaishnava Yogini when Dashami touches sunrise", () => {
    const delhi = getCity("delhi");
    const smarta = findLocalFastDate("2026-07-10", delhi, "smarta");
    const vaishnava = findLocalFastDate("2026-07-10", delhi, "vaishnava");
    assert.equal(smarta, "2026-07-10");
    assert.equal(vaishnava, "2026-07-11");
  });

  it("keeps sun longitude in 0–360", () => {
    const lon = sunLongitude(2461250.5);
    assert.ok(lon >= 0 && lon < 360);
    const t = tithiAt(2461250.5);
    assert.ok(t.tithi >= 1 && t.tithi <= 15);
  });
});
