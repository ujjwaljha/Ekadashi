import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getCity } from "../constants/cities";
import { sunLongitude, tithiAt } from "./astronomy";
import { findLocalFastDate, localSunriseOn } from "./ekadashiCompute";

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
