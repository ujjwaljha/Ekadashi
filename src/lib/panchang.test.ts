import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { searchCalendars, suggestCalendarFromLocale } from "../constants/calendars";

import { eraYear, formatPanchangLong, getLunarDate, getPanchangDay, getSolarDate } from "./panchang";

describe("panchang", () => {
  it("labels 7 Sep 2026 as Bhado in the Mithila solar calendar, L.S. 908", () => {
    const day = getPanchangDay("2026-09-07", "mithila");
    assert.equal(day.eraYear, 908);
    assert.match(day.eraLabel, /908/);
    assert.match(day.civilLabel, /Bhado/i);
    assert.equal(day.tithi, 11);
    assert.equal(day.lunarPaksha, "Krishna");
    assert.equal(day.lunarMonth, "Bhado");
  });

  it("uses Amanta month names for Gujarati Krishna Ekadashi", () => {
    const day = getPanchangDay("2026-09-07", "gujarati");
    assert.equal(day.lunarMonth, "Shravan");
    assert.match(formatPanchangLong("2026-09-07", "gujarati"), /Shravan/);
  });

  it("starts the Nepali and Mithila solar year on 14 Apr 2026", () => {
    assert.equal(eraYear("2026-04-13", "lakshman").year, 907);
    assert.equal(eraYear("2026-04-14", "lakshman").year, 908);
    assert.equal(eraYear("2026-04-13", "nepali").year, 2082);
    assert.equal(eraYear("2026-04-14", "nepali").year, 2083);
    assert.equal(eraYear("2026-04-14", "bengali").year, 1432);
    assert.equal(eraYear("2026-04-15", "bengali").year, 1433);
  });

  it("maps Mesh Sankranti to solar month 0 (Baisakh / Chithirai)", () => {
    assert.equal(getSolarDate("2026-04-14").monthIndex, 0);
    assert.equal(getSolarDate("2026-04-14").day, 1);
    assert.equal(getSolarDate("2026-09-07").monthIndex, 4);
  });

  it("forces tithi 11 on curated Ekadashi days", () => {
    const lunar = getLunarDate("2026-09-07");
    assert.equal(lunar.tithi, 11);
    assert.equal(lunar.paksha, "Krishna");
  });

  it("finds Mithila via search and locale suggestion", () => {
    const hits = searchCalendars("mithila");
    assert.equal(hits[0]?.id, "mithila");
    assert.equal(suggestCalendarFromLocale("mai-IN"), "mithila");
    assert.equal(suggestCalendarFromLocale("ta-IN"), "tamil");
    assert.equal(suggestCalendarFromLocale("ne-NP"), "nepali");
  });
});
