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
    assert.equal(next.calendarId, DEFAULT_SETTINGS.calendarId);
    assert.equal(next.tradition, "smarta");
    assert.equal(next.onboardingCompleted, false);
  });

  it("accepts a regional calendar and tradition", () => {
    const next = normalizeSettings({
      calendarId: "mithila",
      tradition: "vaishnava",
      onboardingCompleted: true,
    });
    assert.equal(next.calendarId, "mithila");
    assert.equal(next.tradition, "vaishnava");
    assert.equal(next.onboardingCompleted, true);
  });

  it("rejects unknown calendar ids", () => {
    const next = normalizeSettings({ calendarId: "not-a-calendar" as never });
    assert.equal(next.calendarId, DEFAULT_SETTINGS.calendarId);
  });

  it("clamps alarm repeat settings", () => {
    const next = normalizeSettings({ alarmRepeatCount: 99, alarmRepeatMinutes: 0 });
    assert.equal(next.alarmRepeatCount, 4);
    assert.equal(next.alarmRepeatMinutes, 1);
  });
});
