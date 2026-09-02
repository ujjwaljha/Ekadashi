import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  describeNotificationStatus,
  DISMISS_ACTION,
  isAlarmAction,
  parseNotificationData,
  shouldOpenAlarm,
  SNOOZE_ACTION,
} from "./notificationPayload";

describe("parseNotificationData", () => {
  it("accepts fasting and Parana alarm payloads", () => {
    const fasting = parseNotificationData({
      kind: "alarm-fasting",
      ekadashiId: "2026-09-07-aja",
      key: "alarm:2026-09-07-aja:0",
    });
    assert.deepEqual(fasting, {
      kind: "alarm-fasting",
      ekadashiId: "2026-09-07-aja",
      key: "alarm:2026-09-07-aja:0",
    });
    assert.equal(shouldOpenAlarm(fasting), true);

    const parana = parseNotificationData({ kind: "alarm-parana", ekadashiId: "2026-09-07-aja" });
    assert.equal(parana?.kind, "alarm-parana");
    assert.equal(shouldOpenAlarm(parana), true);
  });

  it("accepts reminders and test pings without opening the alarm", () => {
    const reminder = parseNotificationData({ kind: "reminder", ekadashiId: "2026-09-07-aja" });
    assert.equal(shouldOpenAlarm(reminder), false);

    const test = parseNotificationData({ kind: "test" });
    assert.deepEqual(test, { kind: "test", ekadashiId: "", key: undefined });
    assert.equal(shouldOpenAlarm(test), false);
  });

  it("rejects missing ids, unknown kinds, and non-objects", () => {
    assert.equal(parseNotificationData({ kind: "alarm-fasting" }), null);
    assert.equal(parseNotificationData({ kind: "reminder", ekadashiId: "" }), null);
    assert.equal(parseNotificationData({ kind: "nope", ekadashiId: "x" }), null);
    assert.equal(parseNotificationData(null), null);
    assert.equal(parseNotificationData("alarm-fasting"), null);
  });

  it("recognizes lock-screen snooze and dismiss actions", () => {
    assert.equal(isAlarmAction(SNOOZE_ACTION), true);
    assert.equal(isAlarmAction(DISMISS_ACTION), true);
    assert.equal(isAlarmAction("expo.modules.notifications.actions.DEFAULT"), false);
  });
});

describe("describeNotificationStatus", () => {
  it("explains the web preview and a healthy device schedule", () => {
    assert.equal(describeNotificationStatus({
      isWeb: true,
      granted: false,
      canAskAgain: false,
      notificationsEnabled: true,
      scheduled: 0,
    }).title, "Web preview");

    const ok = describeNotificationStatus({
      isWeb: false,
      granted: true,
      canAskAgain: true,
      notificationsEnabled: true,
      scheduled: 12,
    });
    assert.equal(ok.title, "Notifications allowed");
    assert.match(ok.detail, /12 reminders/);
    assert.equal(ok.showOpenSettings, false);
  });

  it("points denied users at system settings", () => {
    const denied = describeNotificationStatus({
      isWeb: false,
      granted: false,
      canAskAgain: false,
      notificationsEnabled: true,
      scheduled: 0,
    });
    assert.equal(denied.title, "Permission denied");
    assert.equal(denied.showOpenSettings, true);

    const off = describeNotificationStatus({
      isWeb: false,
      granted: true,
      canAskAgain: true,
      notificationsEnabled: false,
      scheduled: 0,
    });
    assert.equal(off.title, "Reminders off");
    assert.equal(off.showOpenSettings, false);
  });
});
