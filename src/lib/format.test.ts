import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { countdownLabel, formatLongDate, formatShortDate, formatTime12h, greetingForHour } from "./format";

describe("format", () => {
  it("formats long and short dates independently of the host timezone", () => {
    assert.equal(formatLongDate("2026-09-12"), "Saturday, 12 September 2026");
    assert.equal(formatShortDate("2026-09-12"), "12 Sep");
  });

  it("formats 24h times as 12h labels", () => {
    assert.equal(formatTime12h("08:00"), "8:00 AM");
    assert.equal(formatTime12h("00:05"), "12:05 AM");
    assert.equal(formatTime12h("12:30"), "12:30 PM");
    assert.equal(formatTime12h("18:45"), "6:45 PM");
  });

  it("labels countdowns and greetings", () => {
    assert.equal(countdownLabel(0), "Today");
    assert.equal(countdownLabel(1), "Tomorrow");
    assert.equal(countdownLabel(11), "In 11 days");
    assert.equal(countdownLabel(-1), "Passed");
    assert.equal(greetingForHour(8), "Good morning");
    assert.equal(greetingForHour(15), "Good afternoon");
    assert.equal(greetingForHour(20), "Good evening");
  });
});
