import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DEFAULT_SETTINGS } from "../store/defaults";
import { getUpcomingEkadashis } from "./ekadashi";
import { buildNotificationPlan, MAX_SCHEDULED_NOTIFICATIONS } from "./schedule";
import { wallTimeInZone } from "./timezone";

const now = new Date("2026-09-01T04:00:00.000Z");

describe("buildNotificationPlan", () => {
  it("returns nothing when notifications are disabled", () => {
    const plan = buildNotificationPlan({
      now,
      settings: { ...DEFAULT_SETTINGS, notificationsEnabled: false },
      upcoming: getUpcomingEkadashis(6, new Date(2026, 8, 1), "device"),
    });
    assert.equal(plan.length, 0);
  });

  it("schedules on-the-day and 1-day-before reminders at the chosen time in IST", () => {
    const upcoming = getUpcomingEkadashis(1, new Date(2026, 8, 1), "device");
    const plan = buildNotificationPlan({
      now,
      settings: {
        ...DEFAULT_SETTINGS,
        timezone: "Asia/Kolkata",
        reminderTime: "08:00",
        leadDays: [0, 1],
        alarmEnabled: false,
      },
      upcoming,
    });
    assert.equal(plan.length, 2);
    assert.deepEqual(
      plan.map((p) => p.key),
      ["reminder:2026-09-07-aja:1", "reminder:2026-09-07-aja:0"]
    );
    assert.equal(plan[0].fireAt.toISOString(), wallTimeInZone("2026-09-06", "08:00", "Asia/Kolkata").toISOString());
    assert.equal(plan[1].fireAt.toISOString(), wallTimeInZone("2026-09-07", "08:00", "Asia/Kolkata").toISOString());
  });

  it("adds repeating fasting and Parana alarms and stays inside the iOS budget", () => {
    const upcoming = getUpcomingEkadashis(12, new Date(2026, 8, 1), "device");
    const plan = buildNotificationPlan({
      now,
      settings: {
        ...DEFAULT_SETTINGS,
        timezone: "Asia/Kolkata",
        leadDays: [0, 1, 2, 3, 4],
        alarmEnabled: true,
        alarmTime: "06:00",
        alarmRepeatCount: 2,
        alarmRepeatMinutes: 5,
      },
      upcoming,
    });
    assert.ok(plan.length > 0);
    assert.ok(plan.length <= MAX_SCHEDULED_NOTIFICATIONS);
    const fasting = plan.filter((p) => p.kind === "alarm-fasting" && p.ekadashiId === "2026-09-07-aja");
    assert.equal(fasting.length, 3);
    const parana = plan.filter((p) => p.kind === "alarm-parana" && p.ekadashiId === "2026-09-07-aja");
    assert.ok(parana.length >= 1);
    assert.ok(parana.every((p) => p.fireAt <= wallTimeInZone("2026-09-08", "08:12", "Asia/Kolkata")));
  });

  it("skips fire times that have already passed", () => {
    const after = new Date("2026-09-07T10:00:00.000Z");
    const upcoming = getUpcomingEkadashis(1, new Date(2026, 8, 7), "device");
    const plan = buildNotificationPlan({
      now: after,
      settings: {
        ...DEFAULT_SETTINGS,
        timezone: "Asia/Kolkata",
        reminderTime: "08:00",
        leadDays: [0],
        alarmEnabled: false,
      },
      upcoming,
    });
    assert.equal(plan.length, 0);
  });
});
