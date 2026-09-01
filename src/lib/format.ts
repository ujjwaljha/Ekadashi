const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function parseISO(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

/** Weekday of a YYYY-MM-DD using the civil calendar (UTC noon avoids DST edges). */
function weekdayOfISO(iso: string): number {
  const { y, m, d } = parseISO(iso);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).getUTCDay();
}

/** e.g. "Saturday, 12 September 2026" */
export function formatLongDate(iso: string): string {
  const { y, m, d } = parseISO(iso);
  return `${WEEKDAYS[weekdayOfISO(iso)]}, ${d} ${MONTHS[m - 1]} ${y}`;
}

/** e.g. "12 Sep" */
export function formatShortDate(iso: string): string {
  const { m, d } = parseISO(iso);
  return `${d} ${MONTHS[m - 1].slice(0, 3)}`;
}

/** Convert a 24h "HH:mm" string to a friendly 12h label, e.g. "8:00 AM". */
export function formatTime12h(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

/** Human countdown label from a day delta. */
export function countdownLabel(days: number): string {
  if (days < 0) return "Passed";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

export function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
