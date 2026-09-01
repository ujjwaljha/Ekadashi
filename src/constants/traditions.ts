import type { CalendarTradition } from "@/types";

export const TRADITIONS: {
  id: CalendarTradition;
  label: string;
  shortLabel: string;
  hint: string;
}[] = [
  {
    id: "smarta",
    label: "Smarta",
    shortLabel: "Smarta calendar",
    hint: "Common India IST panchang used by many households.",
  },
  {
    id: "vaishnava",
    label: "Vaishnava",
    shortLabel: "Vaishnava calendar",
    hint: "ISKCON / Gaurabda sunrise rule (Delhi NCR reference).",
  },
];

export function getTraditionLabel(id: CalendarTradition): string {
  return TRADITIONS.find((t) => t.id === id)?.shortLabel ?? "Smarta calendar";
}

export function isCalendarTradition(value: unknown): value is CalendarTradition {
  return value === "smarta" || value === "vaishnava";
}
