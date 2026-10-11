import {
  ALLOWED_FOODS,
  AVOIDED_FOODS,
  DEFAULT_SPECIAL,
  EKADASHI_SPECIALS,
  FASTING_LEVELS,
  type EkadashiSpecial,
  type FastingLevel,
} from "@/constants/observance";
import { addDaysIso } from "@/lib/astronomy";
import { catalogKey } from "@/lib/ekadashiCatalog";
import { formatTime12h } from "@/lib/format";
import type { Ekadashi, TraditionId } from "@/types";

export interface GuideStep {
  id: "dashami" | "ekadashi" | "jagaran" | "parana";
  title: string;
  /** ISO date the step falls on. */
  date: string;
  /** Short time-of-day hint, e.g. the Parana window. */
  when?: string;
  points: string[];
}

export interface ObservanceGuide {
  key: string;
  intro: string;
  special: EkadashiSpecial;
  steps: GuideStep[];
  levels: FastingLevel[];
  allowed: string[];
  avoided: string[];
  /** Who may keep a lighter fast. */
  relaxation: string;
  /** Tradition-specific reminders shown beneath the steps. */
  traditionNotes: string[];
}

function traditionName(tradition: TraditionId): string {
  return tradition === "vaishnava" ? "Vaishnava" : "Smarta";
}

/** Build the step-by-step guide for one resolved Ekadashi. */
export function buildObservanceGuide(item: Ekadashi, tradition: TraditionId = item.tradition): ObservanceGuide {
  const key = catalogKey(item.name);
  const special = EKADASHI_SPECIALS[key] ?? DEFAULT_SPECIAL;
  const nirjala = key === "nirjala";
  const vaishnava = tradition === "vaishnava";
  const paranaWindow = `${formatTime12h(item.parana.start)} – ${formatTime12h(item.parana.end)}`;

  const dashami: GuideStep = {
    id: "dashami",
    title: "Dashami — the evening before",
    date: addDaysIso(item.date, -1),
    when: "Before sunset",
    points: [
      "Take one simple satvik meal before sunset and nothing after it.",
      "Skip onion, garlic, masoor dal, meat, eggs and alcohol from today.",
      nirjala
        ? "Finish drinking water before sunset; the Nirjala fast begins now."
        : "Keep the evening quiet, finish chores early and sleep early.",
      "Set the morning alarm for a bath and sankalpa before sunrise.",
    ],
  };

  const ekadashi: GuideStep = {
    id: "ekadashi",
    title: `Ekadashi — ${item.name} fast`,
    date: item.date,
    when: "Sunrise to sunrise",
    points: [
      "Bathe before sunrise and take the sankalpa (vow) with water in hand.",
      nirjala
        ? "Take no food and no water through the day and night."
        : "No grains, pulses or beans all day; fruit, milk and roots are fine.",
      vaishnava
        ? "Avoid honey and anything cooked with grain, including grain prasadam."
        : "Avoid a daytime nap, shaving, cutting hair or nails, and oil massage.",
      `Worship ${special.deity} with tulsi, a ghee lamp and the ${item.name} katha.`,
      "Chant or read: Vishnu Sahasranama, the Gita, or Hare Krishna japa.",
      "Give something away today: grain, clothing or a meal for someone in need.",
    ],
  };

  const jagaran: GuideStep = {
    id: "jagaran",
    title: "Jagaran — the night",
    date: item.date,
    when: "After sunset",
    points: [
      "Stay awake as long as you can with kirtan, bhajan or scripture.",
      "If you must sleep, keep it short and on a simple bed or mat.",
      "Keep the lamp before the deity burning through the night if safe.",
    ],
  };

  const parana: GuideStep = {
    id: "parana",
    title: "Dwadashi — Parana (breaking the fast)",
    date: item.parana.date,
    when: paranaWindow,
    points: [
      "Bathe, offer food to the deity, then break the fast within the window.",
      nirjala
        ? "Take water first, then a little grain (anna) to complete the vow."
        : "Eat a little grain (anna) first; the fast is not complete without it.",
      vaishnava
        ? "Never break the fast during Hari Vasara, the first quarter of Dwadashi; the window already starts after it."
        : "Do not break the fast before Dwadashi begins or after it ends; the window accounts for both.",
      "If the window is missed, still break the fast with water and grain as soon as possible.",
    ],
  };

  const traditionNotes = vaishnava
    ? [
        `${traditionName(tradition)} dates follow the ISKCON calendar: the Ekadashi must be free of Dashami at arunodaya (96 minutes before sunrise), or the fast moves to Dwadashi.`,
        "On a Mahadvadashi the fast itself is kept on Dwadashi and Parana follows on Trayodashi morning.",
      ]
    : [
        `${traditionName(tradition)} dates follow the sunrise rule used by Drik Panchang and most household panchangs.`,
        "Many families skip only rice and wheat; follow your own household custom for pulses and salt.",
      ];
  if (item.otherTraditionDate) {
    traditionNotes.push(
      `${traditionName(item.otherTraditionDate.tradition)} devotees keep this fast on ${item.otherTraditionDate.date}.`
    );
  }

  return {
    key,
    intro: special.focus,
    special,
    steps: [dashami, ekadashi, jagaran, parana],
    levels: FASTING_LEVELS,
    allowed: ALLOWED_FOODS,
    avoided: AVOIDED_FOODS,
    relaxation:
      "Children, elders, the unwell, expectant or nursing mothers and travellers may keep Phalahar or a single grain-free meal. Health comes first; the vow is in the remembrance.",
    traditionNotes,
  };
}
