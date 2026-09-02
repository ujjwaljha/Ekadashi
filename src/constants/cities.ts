import type { CalendarId } from "@/types";

export interface City {
  id: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  timezone: string;
  /** When true, published IST dates are trusted; Parana is still local. */
  usePublishedDates: boolean;
  suggestedCalendar?: CalendarId;
  searchTerms: string[];
}

export const CITIES: City[] = [
  {
    id: "delhi",
    name: "New Delhi",
    region: "India",
    latitude: 28.6139,
    longitude: 77.209,
    timezone: "Asia/Kolkata",
    usePublishedDates: true,
    suggestedCalendar: "north-indian",
    searchTerms: ["delhi", "new delhi", "ncr", "india"],
  },
  {
    id: "darbhanga",
    name: "Darbhanga",
    region: "Mithila, Bihar",
    latitude: 26.1542,
    longitude: 85.8918,
    timezone: "Asia/Kolkata",
    usePublishedDates: true,
    suggestedCalendar: "mithila",
    searchTerms: ["darbhanga", "mithila", "bihar", "tirhut"],
  },
  {
    id: "sitamarhi",
    name: "Sitamarhi",
    region: "Mithila, Bihar",
    latitude: 26.588,
    longitude: 85.501,
    timezone: "Asia/Kolkata",
    usePublishedDates: true,
    suggestedCalendar: "mithila",
    searchTerms: ["sitamarhi", "mithila", "bihar"],
  },
  {
    id: "madhubani",
    name: "Madhubani",
    region: "Mithila, Bihar",
    latitude: 26.348,
    longitude: 86.071,
    timezone: "Asia/Kolkata",
    usePublishedDates: true,
    suggestedCalendar: "mithila",
    searchTerms: ["madhubani", "mithila"],
  },
  {
    id: "patna",
    name: "Patna",
    region: "Bihar",
    latitude: 25.5941,
    longitude: 85.1376,
    timezone: "Asia/Kolkata",
    usePublishedDates: true,
    suggestedCalendar: "north-indian",
    searchTerms: ["patna", "bihar"],
  },
  {
    id: "janakpur",
    name: "Janakpur",
    region: "Mithila, Nepal",
    latitude: 26.7288,
    longitude: 85.9254,
    timezone: "Asia/Kathmandu",
    usePublishedDates: true,
    suggestedCalendar: "mithila",
    searchTerms: ["janakpur", "nepal", "mithila"],
  },
  {
    id: "kathmandu",
    name: "Kathmandu",
    region: "Nepal",
    latitude: 27.7172,
    longitude: 85.324,
    timezone: "Asia/Kathmandu",
    usePublishedDates: true,
    suggestedCalendar: "nepali",
    searchTerms: ["kathmandu", "nepal"],
  },
  {
    id: "kolkata",
    name: "Kolkata",
    region: "West Bengal",
    latitude: 22.5726,
    longitude: 88.3639,
    timezone: "Asia/Kolkata",
    usePublishedDates: true,
    suggestedCalendar: "bengali",
    searchTerms: ["kolkata", "calcutta", "bengal"],
  },
  {
    id: "mumbai",
    name: "Mumbai",
    region: "Maharashtra",
    latitude: 19.076,
    longitude: 72.8777,
    timezone: "Asia/Kolkata",
    usePublishedDates: true,
    suggestedCalendar: "marathi",
    searchTerms: ["mumbai", "bombay", "maharashtra"],
  },
  {
    id: "pune",
    name: "Pune",
    region: "Maharashtra",
    latitude: 18.5204,
    longitude: 73.8567,
    timezone: "Asia/Kolkata",
    usePublishedDates: true,
    suggestedCalendar: "marathi",
    searchTerms: ["pune"],
  },
  {
    id: "ahmedabad",
    name: "Ahmedabad",
    region: "Gujarat",
    latitude: 23.0225,
    longitude: 72.5714,
    timezone: "Asia/Kolkata",
    usePublishedDates: true,
    suggestedCalendar: "gujarati",
    searchTerms: ["ahmedabad", "gujarat"],
  },
  {
    id: "varanasi",
    name: "Varanasi",
    region: "Uttar Pradesh",
    latitude: 25.3176,
    longitude: 83.0104,
    timezone: "Asia/Kolkata",
    usePublishedDates: true,
    suggestedCalendar: "north-indian",
    searchTerms: ["varanasi", "banaras", "kashi"],
  },
  {
    id: "jaipur",
    name: "Jaipur",
    region: "Rajasthan",
    latitude: 26.9124,
    longitude: 75.7873,
    timezone: "Asia/Kolkata",
    usePublishedDates: true,
    suggestedCalendar: "north-indian",
    searchTerms: ["jaipur", "rajasthan"],
  },
  {
    id: "lucknow",
    name: "Lucknow",
    region: "Uttar Pradesh",
    latitude: 26.8467,
    longitude: 80.9462,
    timezone: "Asia/Kolkata",
    usePublishedDates: true,
    suggestedCalendar: "north-indian",
    searchTerms: ["lucknow"],
  },
  {
    id: "bhubaneswar",
    name: "Bhubaneswar",
    region: "Odisha",
    latitude: 20.2961,
    longitude: 85.8245,
    timezone: "Asia/Kolkata",
    usePublishedDates: true,
    suggestedCalendar: "odia",
    searchTerms: ["bhubaneswar", "odisha", "puri"],
  },
  {
    id: "chennai",
    name: "Chennai",
    region: "Tamil Nadu",
    latitude: 13.0827,
    longitude: 80.2707,
    timezone: "Asia/Kolkata",
    usePublishedDates: true,
    suggestedCalendar: "tamil",
    searchTerms: ["chennai", "madras", "tamil"],
  },
  {
    id: "bengaluru",
    name: "Bengaluru",
    region: "Karnataka",
    latitude: 12.9716,
    longitude: 77.5946,
    timezone: "Asia/Kolkata",
    usePublishedDates: true,
    suggestedCalendar: "kannada",
    searchTerms: ["bengaluru", "bangalore", "karnataka"],
  },
  {
    id: "hyderabad",
    name: "Hyderabad",
    region: "Telangana",
    latitude: 17.385,
    longitude: 78.4867,
    timezone: "Asia/Kolkata",
    usePublishedDates: true,
    suggestedCalendar: "telugu",
    searchTerms: ["hyderabad", "telangana", "andhra"],
  },
  {
    id: "thiruvananthapuram",
    name: "Thiruvananthapuram",
    region: "Kerala",
    latitude: 8.5241,
    longitude: 76.9366,
    timezone: "Asia/Kolkata",
    usePublishedDates: true,
    suggestedCalendar: "malayalam",
    searchTerms: ["thiruvananthapuram", "trivandrum", "kerala"],
  },
  {
    id: "amritsar",
    name: "Amritsar",
    region: "Punjab",
    latitude: 31.634,
    longitude: 74.8723,
    timezone: "Asia/Kolkata",
    usePublishedDates: true,
    suggestedCalendar: "punjabi",
    searchTerms: ["amritsar", "punjab"],
  },
  {
    id: "mayapur",
    name: "Mayapur",
    region: "West Bengal (ISKCON)",
    latitude: 23.423,
    longitude: 88.388,
    timezone: "Asia/Kolkata",
    usePublishedDates: true,
    suggestedCalendar: "iskcon",
    searchTerms: ["mayapur", "iskcon", "navadvipa"],
  },
  {
    id: "vrindavan",
    name: "Vrindavan",
    region: "Uttar Pradesh",
    latitude: 27.5806,
    longitude: 77.7006,
    timezone: "Asia/Kolkata",
    usePublishedDates: true,
    suggestedCalendar: "iskcon",
    searchTerms: ["vrindavan", "mathura", "iskcon"],
  },
  {
    id: "new-york",
    name: "New York",
    region: "United States",
    latitude: 40.7128,
    longitude: -74.006,
    timezone: "America/New_York",
    usePublishedDates: false,
    suggestedCalendar: "iskcon",
    searchTerms: ["new york", "nyc", "usa"],
  },
  {
    id: "chicago",
    name: "Chicago",
    region: "United States",
    latitude: 41.8781,
    longitude: -87.6298,
    timezone: "America/Chicago",
    usePublishedDates: false,
    searchTerms: ["chicago", "usa"],
  },
  {
    id: "los-angeles",
    name: "Los Angeles",
    region: "United States",
    latitude: 34.0522,
    longitude: -118.2437,
    timezone: "America/Los_Angeles",
    usePublishedDates: false,
    searchTerms: ["los angeles", "la", "usa"],
  },
  {
    id: "london",
    name: "London",
    region: "United Kingdom",
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: "Europe/London",
    usePublishedDates: false,
    searchTerms: ["london", "uk"],
  },
  {
    id: "toronto",
    name: "Toronto",
    region: "Canada",
    latitude: 43.6532,
    longitude: -79.3832,
    timezone: "America/Toronto",
    usePublishedDates: false,
    searchTerms: ["toronto", "canada"],
  },
  {
    id: "sydney",
    name: "Sydney",
    region: "Australia",
    latitude: -33.8688,
    longitude: 151.2093,
    timezone: "Australia/Sydney",
    usePublishedDates: false,
    searchTerms: ["sydney", "australia"],
  },
  {
    id: "singapore",
    name: "Singapore",
    region: "Singapore",
    latitude: 1.3521,
    longitude: 103.8198,
    timezone: "Asia/Singapore",
    usePublishedDates: false,
    searchTerms: ["singapore"],
  },
  {
    id: "dubai",
    name: "Dubai",
    region: "UAE",
    latitude: 25.2048,
    longitude: 55.2708,
    timezone: "Asia/Dubai",
    usePublishedDates: false,
    searchTerms: ["dubai", "uae"],
  },
];

export const DEFAULT_CITY_ID = "delhi";

const BY_ID = new Map(CITIES.map((c) => [c.id, c]));

export function isCityId(value: unknown): value is string {
  return typeof value === "string" && BY_ID.has(value);
}

export function getCity(id: string): City {
  return BY_ID.get(id) ?? BY_ID.get(DEFAULT_CITY_ID)!;
}

export function searchCities(query: string): City[] {
  const q = query.trim().toLowerCase();
  if (!q) return CITIES;
  return CITIES.filter((c) => {
    const hay = [c.id, c.name, c.region, ...c.searchTerms].join(" ").toLowerCase();
    return hay.includes(q);
  });
}

export function suggestCityFromTimezone(timezone?: string): string {
  if (!timezone || timezone === "device") return DEFAULT_CITY_ID;
  const match = CITIES.find((c) => c.timezone === timezone);
  return match?.id ?? DEFAULT_CITY_ID;
}

const CALENDAR_CITY: Partial<Record<CalendarId, string>> = {
  mithila: "darbhanga",
  nepali: "kathmandu",
  bengali: "kolkata",
  odia: "bhubaneswar",
  gujarati: "ahmedabad",
  marathi: "mumbai",
  telugu: "hyderabad",
  kannada: "bengaluru",
  tamil: "chennai",
  malayalam: "thiruvananthapuram",
  punjabi: "amritsar",
  iskcon: "mayapur",
  vaishnava: "vrindavan",
  "north-indian": "delhi",
  smarta: "delhi",
};

export function suggestCityFromCalendar(calendarId?: CalendarId): string {
  if (!calendarId) return DEFAULT_CITY_ID;
  return CALENDAR_CITY[calendarId] ?? DEFAULT_CITY_ID;
}
