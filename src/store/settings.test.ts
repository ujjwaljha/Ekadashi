import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DEFAULT_SETTINGS, normalizeSettings } from "./defaults";

describe("normalizeSettings", () => {
  it("returns defaults for empty input", () => {
    assert.deepEqual(normalizeSettings(null), DEFAULT_SETTINGS);
    assert.deepEqual(normalizeSettings({}), DEFAULT_SETTINGS);
  });

  it("keeps valid overrides and fills new fields", () => {
    const next = normalizeSettings({
      reminderTime: "07:15",
      timezone: "Asia/Kolkata",
      leadDays: [0, 4, 4, 9],
    });
    assert.equal(next.reminderTime, "07:15");
    assert.equal(next.timezone, "Asia/Kolkata");
    assert.deepEqual(next.leadDays, [0, 4]);
    assert.equal(next.alarmTime, DEFAULT_SETTINGS.alarmTime);
  });

  it("clamps alarm repeat settings", () => {
    const next = normalizeSettings({ alarmRepeatCount: 99, alarmRepeatMinutes: 0 });
    assert.equal(next.alarmRepeatCount, 4);
    assert.equal(next.alarmRepeatMinutes, 1);
  });

  it("accepts vaishnava tradition and falls back to smarta", () => {
    assert.equal(normalizeSettings({ tradition: "vaishnava" }).tradition, "vaishnava");
    assert.equal(DEFAULT_SETTINGS.tradition, "smarta");
    assert.equal(normalizeSettings({ tradition: "lunar" }).tradition, "smarta");
  });
});
