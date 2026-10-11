/**
 * iCalendar (RFC 5545) export of Ekadashi fasting days and Parana windows.
 * Pure string building so it can be unit-tested; writing / sharing the file
 * lives in calendarExport.ts.
 */
import { getCalendar, traditionLabel } from "@/constants/calendars";
import { addDaysIso } from "@/lib/astronomy";
import { formatLongDate, formatTime12h } from "@/lib/format";
import { formatPanchangLong } from "@/lib/panchang";
import { wallTimeInZone } from "@/lib/timezone";
import type { Ekadashi, TraditionId } from "@/types";

export interface IcsOptions {
  /** Shown as the calendar name when the file is subscribed / imported. */
  calendarName: string;
  cityName: string;
  /** IANA zone the Parana times are expressed in (the city's zone). */
  cityTimezone: string;
  tradition: TraditionId;
  /** Add a timed event for each Parana window (default true). */
  includeParana?: boolean;
  /** HH:mm wall-clock reminder on the fasting day, added as a VALARM. */
  reminderTime?: string;
  /** Instant used for DTSTAMP; defaults to now. */
  now?: Date;
}

const PRODID = "-//Ekadashi Reminder//Ekadashi Calendar 1.1//EN";
const UID_DOMAIN = "ekadashi-reminder.app";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** 20260907 for an ISO date. */
export function icsDate(iso: string): string {
  return iso.replace(/-/g, "");
}

/** 20260908T003200Z for a Date. */
export function icsUtc(date: Date): string {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

/** Escape text per RFC 5545 §3.3.11. */
export function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Fold a content line at 75 octets (UTF-8), continuation lines start with a space. */
export function foldLine(line: string): string {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const bytes = encoder.encode(line);
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let start = 0;
  let limit = 75;
  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length);
    // Do not split a multi-byte UTF-8 sequence: back up to a boundary.
    while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end -= 1;
    parts.push(decoder.decode(bytes.subarray(start, end)));
    start = end;
    limit = 74;
  }
  return parts.join("\r\n ");
}

function property(name: string, value: string): string {
  return foldLine(`${name}:${value}`);
}

function describeFast(item: Ekadashi, options: IcsOptions): string {
  const calendar = getCalendar(item.calendarId);
  const lines = [
    `${item.paksha} Paksha · ${item.month}${item.adhika ? " (Adhika)" : ""}`,
    `${calendar.name}: ${formatPanchangLong(item.date, item.calendarId)}`,
    `${traditionLabel(options.tradition)} tradition · ${options.cityName}`,
    `Parana: ${formatLongDate(item.parana.date)}, ${formatTime12h(item.parana.start)} – ${formatTime12h(item.parana.end)}`,
    item.significance,
  ];
  if (item.otherTraditionDate) {
    lines.push(`${traditionLabel(item.otherTraditionDate.tradition)} devotees fast on ${formatLongDate(item.otherTraditionDate.date)}.`);
  }
  if (item.source === "calculated") lines.push("Date calculated from local sunrise and tithi; confirm with a local panchang.");
  return lines.join("\n");
}

function fastEvent(item: Ekadashi, options: IcsOptions, stamp: string): string[] {
  const lines = [
    "BEGIN:VEVENT",
    property("UID", `${item.id}-${options.tradition}-fast@${UID_DOMAIN}`),
    property("DTSTAMP", stamp),
    property("DTSTART;VALUE=DATE", icsDate(item.date)),
    property("DTEND;VALUE=DATE", icsDate(addDaysIso(item.date, 1))),
    property("SUMMARY", escapeText(`${item.name} Ekadashi (fast)`)),
    property("DESCRIPTION", escapeText(describeFast(item, options))),
    property("CATEGORIES", "Ekadashi,Fasting"),
    "TRANSP:TRANSPARENT",
    "STATUS:CONFIRMED",
  ];
  if (options.reminderTime) {
    const fireAt = wallTimeInZone(item.date, options.reminderTime, options.cityTimezone);
    lines.push(
      "BEGIN:VALARM",
      property("TRIGGER;VALUE=DATE-TIME", icsUtc(fireAt)),
      "ACTION:DISPLAY",
      property("DESCRIPTION", escapeText(`Today is ${item.name} Ekadashi`)),
      "END:VALARM"
    );
  }
  lines.push("END:VEVENT");
  return lines;
}

function paranaEvent(item: Ekadashi, options: IcsOptions, stamp: string): string[] {
  const start = wallTimeInZone(item.parana.date, item.parana.start, options.cityTimezone);
  const end = wallTimeInZone(item.parana.date, item.parana.end, options.cityTimezone);
  const description = [
    `Break the ${item.name} Ekadashi fast between ${formatTime12h(item.parana.start)} and ${formatTime12h(item.parana.end)} (${options.cityName} time).`,
    options.tradition === "vaishnava"
      ? "The window starts after Hari Vasara and ends before Dwadashi does."
      : "Pratahkal window after sunrise, ending before Dwadashi does.",
  ].join("\n");
  return [
    "BEGIN:VEVENT",
    property("UID", `${item.id}-${options.tradition}-parana@${UID_DOMAIN}`),
    property("DTSTAMP", stamp),
    property("DTSTART", icsUtc(start)),
    property("DTEND", icsUtc(end)),
    property("SUMMARY", escapeText(`Parana — break ${item.name} Ekadashi fast`)),
    property("DESCRIPTION", escapeText(description)),
    property("CATEGORIES", "Ekadashi,Parana"),
    "TRANSP:OPAQUE",
    "STATUS:CONFIRMED",
    "END:VEVENT",
  ];
}

/** Build a complete VCALENDAR for the given observances. */
export function buildIcs(items: Ekadashi[], options: IcsOptions): string {
  const stamp = icsUtc(options.now ?? new Date());
  const includeParana = options.includeParana ?? true;
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    property("PRODID", PRODID),
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    property("X-WR-CALNAME", escapeText(options.calendarName)),
    property("X-WR-TIMEZONE", options.cityTimezone),
    property("X-WR-CALDESC", escapeText(`Ekadashi fasting days and Parana windows for ${options.cityName} (${traditionLabel(options.tradition)}).`)),
  ];
  for (const item of items) {
    lines.push(...fastEvent(item, options, stamp));
    if (includeParana) lines.push(...paranaEvent(item, options, stamp));
  }
  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}

/** File name such as ekadashi-2026-2030-mithila-smarta.ics or aja-ekadashi-2026-09-07.ics. */
export function icsFileName(items: Ekadashi[], tradition: TraditionId): string {
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (items.length === 1) {
    const [item] = items;
    return `${slug(item.name)}-ekadashi-${item.date}.ics`;
  }
  const years = items.map((i) => i.date.slice(0, 4));
  const min = years.length ? years.reduce((a, b) => (a < b ? a : b)) : "";
  const max = years.length ? years.reduce((a, b) => (a > b ? a : b)) : "";
  const calendarId = items[0]?.calendarId ?? "ekadashi";
  return `ekadashi-${min === max ? min : `${min}-${max}`}-${slug(calendarId)}-${tradition}.ics`;
}
