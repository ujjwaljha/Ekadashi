export interface TimezoneOption {
  id: string;
  label: string;
  hint: string;
}

export const TIMEZONES: TimezoneOption[] = [
  { id: "device", label: "Device", hint: "Follow this phone's clock" },
  { id: "Asia/Kolkata", label: "India (IST)", hint: "Asia/Kolkata" },
  { id: "Asia/Kathmandu", label: "Nepal", hint: "Asia/Kathmandu" },
  { id: "America/New_York", label: "New York", hint: "US Eastern" },
  { id: "America/Chicago", label: "Chicago", hint: "US Central" },
  { id: "America/Los_Angeles", label: "Los Angeles", hint: "US Pacific" },
  { id: "Europe/London", label: "London", hint: "UK" },
  { id: "Europe/Berlin", label: "Berlin", hint: "Central Europe" },
  { id: "Australia/Sydney", label: "Sydney", hint: "Australia Eastern" },
  { id: "Asia/Singapore", label: "Singapore", hint: "SGT" },
  { id: "America/Toronto", label: "Toronto", hint: "Canada Eastern" },
  { id: "Asia/Dubai", label: "Dubai", hint: "Gulf" },
];

export function getTimezoneLabel(id: string): string {
  return TIMEZONES.find((tz) => tz.id === id)?.label ?? id;
}
