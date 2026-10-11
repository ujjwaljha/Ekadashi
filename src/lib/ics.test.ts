import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getAllEkadashis, getEkadashiByDate } from "./ekadashi";
import { buildIcs, escapeText, foldLine, icsFileName, icsUtc } from "./ics";
import { wallTimeInZone } from "./timezone";

const NOW = new Date(Date.UTC(2026, 9, 11, 3, 42, 0));
const options = {
  calendarName: "Ekadashi · Mithila (Smarta)",
  cityName: "Darbhanga",
  cityTimezone: "Asia/Kolkata",
  tradition: "smarta" as const,
  now: NOW,
};

describe("ics export", () => {
  it("writes an all-day fasting event and a timed Parana event per Ekadashi", () => {
    const aja = getEkadashiByDate("2026-09-07", { calendarId: "mithila", cityId: "darbhanga" })!;
    const ics = buildIcs([aja], options);
    assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n"));
    assert.ok(ics.endsWith("END:VCALENDAR\r\n"));
    assert.equal((ics.match(/BEGIN:VEVENT/g) ?? []).length, 2);
    assert.match(ics, /DTSTART;VALUE=DATE:20260907\r\n/);
    assert.match(ics, /DTEND;VALUE=DATE:20260908\r\n/);
    assert.match(ics, /SUMMARY:Aja Ekadashi \(fast\)/);
    assert.match(ics, /DTSTAMP:20261011T034200Z/);
    assert.match(ics, /UID:2026-09-07-aja-smarta-fast@ekadashi-reminder\.app/);
    assert.match(ics, /X-WR-CALNAME:Ekadashi · Mithila \(Smarta\)/);
    // Parana wall-clock IST → UTC instant.
    const expectedStart = icsUtc(wallTimeInZone(aja.parana.date, aja.parana.start, "Asia/Kolkata"));
    assert.match(ics, new RegExp(`DTSTART:${expectedStart}`));
    assert.equal(icsUtc(wallTimeInZone("2026-09-08", "06:02", "Asia/Kolkata")), "20260908T003200Z");
    assert.match(ics, /SUMMARY:Parana — break Aja Ekadashi fast/);
    assert.match(ics, /Bhado 22\\, L\.S\. 908/);
  });

  it("uses CRLF line endings and folds long lines at 75 octets", () => {
    const items = getAllEkadashis({ calendarId: "mithila", cityId: "darbhanga" }, NOW).slice(0, 12);
    const ics = buildIcs(items, { ...options, reminderTime: "06:00" });
    assert.ok(!/[^\r]\n/.test(ics), "every LF must be preceded by CR");
    for (const line of ics.split("\r\n")) {
      assert.ok(new TextEncoder().encode(line).length <= 75, `line too long: ${line}`);
    }
    assert.equal((ics.match(/BEGIN:VALARM/g) ?? []).length, 12);
    assert.match(ics, /TRIGGER;VALUE=DATE-TIME:\d{8}T003000Z/);
  });

  it("can omit Parana events", () => {
    const items = getAllEkadashis({}, NOW).slice(0, 3);
    const ics = buildIcs(items, { ...options, includeParana: false });
    assert.equal((ics.match(/BEGIN:VEVENT/g) ?? []).length, 3);
    assert.ok(!ics.includes("Parana — break"));
  });

  it("escapes text and folds multi-byte characters safely", () => {
    assert.equal(escapeText("a,b;c\\d\nE"), "a\\,b\\;c\\\\d\\nE");
    const folded = foldLine(`DESCRIPTION:${"ॐ".repeat(60)}`);
    const lines = folded.split("\r\n ");
    assert.ok(lines.length > 1);
    assert.equal(lines.join(""), `DESCRIPTION:${"ॐ".repeat(60)}`);
    for (const line of lines) assert.ok(new TextEncoder().encode(line).length <= 75);
    assert.equal(icsUtc(new Date(Date.UTC(2026, 0, 5, 7, 8, 9))), "20260105T070809Z");
  });

  it("names the file after the range or the single observance", () => {
    const all = getAllEkadashis({ calendarId: "mithila" }, NOW);
    assert.equal(icsFileName(all, "smarta"), "ekadashi-2026-2030-mithila-smarta.ics");
    assert.equal(icsFileName([all[0]], "smarta"), "shattila-ekadashi-2026-01-14.ics");
  });
});
