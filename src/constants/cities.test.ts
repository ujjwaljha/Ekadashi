import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getCity,
  isCityId,
  searchCities,
  suggestCityFromCalendar,
  suggestCityFromTimezone,
} from "./cities";

describe("cities", () => {
  it("resolves Darbhanga for Mithila and Delhi by default", () => {
    assert.equal(suggestCityFromCalendar("mithila"), "darbhanga");
    assert.equal(getCity("delhi").usePublishedDates, true);
    assert.equal(getCity("new-york").usePublishedDates, false);
    assert.equal(isCityId("darbhanga"), true);
    assert.equal(isCityId("atlantis"), false);
  });

  it("searches Mithila and US cities", () => {
    assert.equal(searchCities("darbhanga")[0]?.id, "darbhanga");
    assert.ok(searchCities("york").some((c) => c.id === "new-york"));
    assert.ok(["janakpur", "kathmandu"].includes(suggestCityFromTimezone("Asia/Kathmandu")));
  });
});
