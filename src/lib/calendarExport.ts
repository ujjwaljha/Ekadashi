import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

import { getCalendar, traditionLabel } from "@/constants/calendars";
import { getCity } from "@/constants/cities";
import { buildIcs, icsFileName } from "@/lib/ics";
import type { Ekadashi, Settings } from "@/types";

export interface ExportResult {
  ok: boolean;
  fileName: string;
  message: string;
}

const MIME = "text/calendar";

/** Build the .ics text for `items` using the user's calendar, city and tradition. */
export function buildCalendarFile(items: Ekadashi[], settings: Settings): { fileName: string; content: string } {
  const calendar = getCalendar(settings.calendarId);
  const city = getCity(settings.cityId);
  const content = buildIcs(items, {
    calendarName: `Ekadashi · ${calendar.name} (${traditionLabel(settings.tradition)})`,
    cityName: city.name,
    cityTimezone: city.timezone,
    tradition: settings.tradition,
    reminderTime: settings.notificationsEnabled ? settings.reminderTime : undefined,
  });
  return { fileName: icsFileName(items, settings.tradition), content };
}

function downloadOnWeb(fileName: string, content: string): void {
  const blob = new Blob([content], { type: `${MIME};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

async function shareOnDevice(fileName: string, content: string): Promise<void> {
  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create();
  file.write(content);
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Sharing is not available on this device.");
  }
  await Sharing.shareAsync(file.uri, {
    mimeType: MIME,
    UTI: "com.apple.ical.ics",
    dialogTitle: "Add Ekadashi dates to your calendar",
  });
}

/**
 * Export observances as an .ics file: a download on web, the system share
 * sheet on iOS / Android (Calendar, Google Calendar, Files, Mail…).
 */
export async function exportToCalendar(items: Ekadashi[], settings: Settings): Promise<ExportResult> {
  if (items.length === 0) {
    return { ok: false, fileName: "", message: "Nothing to export yet." };
  }
  const { fileName, content } = buildCalendarFile(items, settings);
  try {
    if (Platform.OS === "web") {
      downloadOnWeb(fileName, content);
      return {
        ok: true,
        fileName,
        message: `Downloaded ${fileName}. Import it into Google Calendar, Apple Calendar or Outlook.`,
      };
    }
    await shareOnDevice(fileName, content);
    return { ok: true, fileName, message: `Shared ${fileName}. Choose your calendar app to add the dates.` };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown error";
    return { ok: false, fileName, message: `Could not export the calendar file. ${reason}` };
  }
}
