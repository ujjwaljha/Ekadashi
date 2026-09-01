import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  compareISO,
  isoDayDelta,
  todayISO,
  wallTimeInZone,
  zonedISODate,
} from "./timezone";

describe("timezone", () => {
  it("converts IST wall time to the correct UTC instant", () => {
    const date = wallTimeInZone("2026-09-12", "08:00", "Asia/Kolkata");
    assert.equal(date.toISOString(), "2026-09-12T02:30:00.000Z");
  });

  it("converts New York wall time (EDT in September) to UTC", () => {
    const date = wallTimeInZone("2026-09-12", "08:00", "America/New_York");
    assert.equal(date.toISOString(), "2026-09-12T12:00:00.000Z");
  });

  it("uses the device-local Date constructor for the device timezone", () => {
    const date = wallTimeInZone("2026-01-05", "06:00", "device");
    assert.equal(date.getFullYear(), 2026);
    assert.equal(date.getMonth(), 0);
    assert.equal(date.getDate(), 5);
    assert.equal(date.getHours(), 6);
    assert.equal(date.getMinutes(), 0);
  });

  it("reads a zoned ISO date from a UTC instant", () => {
    const utc = new Date("2026-09-12T02:30:00.000Z");
    assert.equal(zonedISODate(utc, "Asia/Kolkata"), "2026-09-12");
    // 02:30 UTC is still Sep 11 evening in New York (EDT, UTC-4).
    assert.equal(zonedISODate(utc, "America/New_York"), "2026-09-11");
  });

  it("computes todayISO in a named zone", () => {
    const now = new Date("2026-09-01T22:00:00.000Z");
    assert.equal(todayISO(now, "Asia/Kolkata"), "2026-09-02");
    assert.equal(todayISO(now, "America/Los_Angeles"), "2026-09-01");
  });

  it("compares and diffs ISO dates without local timezone drift", () => {
    assert.equal(compareISO("2026-09-12", "2026-09-13"), -1);
    assert.equal(isoDayDelta("2026-09-01", "2026-09-12"), 11);
    assert.equal(isoDayDelta("2026-12-31", "2027-01-01"), 1);
  });
});
