/**
 * Practical observance guidance for Ekadashi vrat: the common household
 * sequence (Dashami → Ekadashi → Jagaran → Parana) plus what makes each
 * named Ekadashi distinctive. Wording follows widely shared panchang and
 * temple practice; families and sampradayas vary, and the UI says so.
 */

export interface FastingLevel {
  id: "nirjala" | "phalahar" | "anukalpa";
  name: string;
  summary: string;
  detail: string;
}

export const FASTING_LEVELS: FastingLevel[] = [
  {
    id: "nirjala",
    name: "Nirjala",
    summary: "No food and no water",
    detail:
      "The strictest form, from Dashami sunset until Parana. Traditional on Nirjala Ekadashi; otherwise only for those in good health.",
  },
  {
    id: "phalahar",
    name: "Phalahar",
    summary: "Fruit, milk and non-grain foods",
    detail:
      "The usual household fast: fruits, milk, curd, nuts, root vegetables, sabudana and flours such as kuttu, singhara and rajgira with rock salt.",
  },
  {
    id: "anukalpa",
    name: "Anukalpa",
    summary: "One grain-free meal",
    detail:
      "For children, elders, the unwell, travellers and expectant mothers: one simple satvik meal without grains, pulses or beans, taken after worship.",
  },
];

export const ALLOWED_FOODS = [
  "Fruits and dry fruits",
  "Milk, curd, buttermilk, paneer",
  "Potato, sweet potato, arbi, pumpkin",
  "Sabudana, makhana, samak (barnyard millet)",
  "Kuttu, singhara and rajgira flours",
  "Rock salt (sendha namak), ghee, black pepper",
];

export const AVOIDED_FOODS = [
  "Rice, wheat, barley, millets and anything made from them",
  "Dal, chana, rajma, beans and lentils",
  "Onion, garlic, mushrooms and leafy greens in many homes",
  "Table salt, mustard and sesame oil, spices like hing",
  "Meat, fish, eggs and alcohol",
  "Food cooked or offered by others on the fasting day",
];

export interface EkadashiSpecial {
  /** One line on why this Ekadashi is kept. */
  focus: string;
  /** Practices particular to this Ekadashi. */
  rituals: string[];
  /** Deity or form traditionally worshipped. */
  deity: string;
  /** Any food or fasting note that differs from the usual phalahar. */
  food?: string;
}

export const DEFAULT_SPECIAL: EkadashiSpecial = {
  focus: "Dedicated to Vishnu; the fortnightly day for restraint, remembrance and charity.",
  rituals: ["Vishnu puja with tulsi leaves", "Recite Vishnu Sahasranama or the Ekadashi katha", "Give grain or clothing to someone in need"],
  deity: "Vishnu",
};

export const EKADASHI_SPECIALS: Record<string, EkadashiSpecial> = {
  shattila: {
    focus: "Sesame in six ways: bathing, paste, offering, water, food and charity.",
    rituals: [
      "Bathe with til (sesame) water and apply til paste",
      "Offer til in the havan and to Vishnu",
      "Give sesame, blankets or warm clothing to the needy",
    ],
    deity: "Vishnu",
    food: "Phalahar may include til-based preparations such as til laddoo.",
  },
  jaya: {
    focus: "Frees one from lower births and restless spirits; Bhaimi in the Gaudiya calendar.",
    rituals: ["Worship Vishnu as Krishna with incense, lamp and flowers", "Keep night-long kirtan if possible", "Charity to Brahmins and the poor on Dwadashi"],
    deity: "Krishna",
  },
  vijaya: {
    focus: "Victory in righteous effort, recalling Rama's crossing to Lanka.",
    rituals: ["Place a kalash of water with seven grains before the deity", "Read the Vijaya Ekadashi katha", "Donate the kalash and cloth on Dwadashi"],
    deity: "Vishnu / Rama",
  },
  amalaki: {
    focus: "Honours the amla (Indian gooseberry) tree where Vishnu is said to reside.",
    rituals: ["Worship or circumambulate an amla tree", "Offer amla fruit and water to Vishnu", "Many sit under the tree for katha or kirtan"],
    deity: "Vishnu (Parashurama in some homes)",
    food: "Amla is eaten or offered; the fast is otherwise usual phalahar.",
  },
  papmochani: {
    focus: "Papa-mochani: release from accumulated faults before the lunar new year.",
    rituals: ["Confess and resolve past wrongs in prayer", "Read the Papmochani katha of the sage Medhavi", "Keep speech restrained through the day"],
    deity: "Vishnu as Chaturbhuja",
  },
  kamada: {
    focus: "The first Ekadashi of the lunar year; fulfils sincere wishes.",
    rituals: ["Worship Vishnu with fruits, flowers and sesame", "Listen to or read the Kamada katha", "Feed or gift a Brahmin on Dwadashi"],
    deity: "Vishnu",
  },
  varuthini: {
    focus: "Protection and the merit of long austerity; sought by those in difficulty.",
    rituals: ["Worship Vishnu as Varaha", "Avoid betel, grinding, oil massage and sleeping by day", "Give what you can to someone who asks"],
    deity: "Varaha",
    food: "Tradition avoids food in bell-metal vessels and anything with honey on this day.",
  },
  mohini: {
    focus: "Named for Vishnu's Mohini form; dispels delusion and attachment.",
    rituals: ["Worship Rama or Vishnu with yellow flowers and sandal", "Read the Mohini katha", "Keep the mind on the deity rather than the fast"],
    deity: "Vishnu / Rama",
  },
  apara: {
    focus: "Boundless merit; honours ancestors and steadies the household.",
    rituals: ["Worship Vishnu as Trivikrama", "Offer tulsi, lamps and fruit", "Charity in the name of departed elders"],
    deity: "Trivikrama",
  },
  padmini: {
    focus: "The Ekadashi of the extra (Purushottama) month, kept once in about three years.",
    rituals: ["Worship Radha and Krishna or Vishnu as Purushottama", "Lamp offering and kirtan through the night", "Extra charity through the Adhika month"],
    deity: "Purushottama (Krishna)",
  },
  parama: {
    focus: "The Krishna-paksha Ekadashi of the extra month; associated with ending poverty.",
    rituals: ["Worship Vishnu as Purushottama", "A five-day Panchratri vrat is kept by some from this day", "Donate grain, ghee and clothing"],
    deity: "Purushottama (Krishna)",
  },
  nirjala: {
    focus: "Bhima's Ekadashi: one waterless fast said to equal all twenty-four.",
    rituals: [
      "No food or water from Dashami sunset until Parana",
      "Donate water pots, fans, umbrellas, cold drinks or sharbat",
      "Sprinkle a few drops of water in achaman only",
    ],
    deity: "Vishnu",
    food: "Take water first at Parana, then grain. Elders and the unwell should keep phalahar with water instead.",
  },
  yogini: {
    focus: "Relief from illness and the weight of past wrongs.",
    rituals: ["Worship Vishnu as Narayana", "Offer water to a peepal tree", "Feed the hungry on Dwadashi"],
    deity: "Narayana",
  },
  devshayani: {
    focus: "Vishnu enters yoga-nidra; Chaturmas begins and weddings pause.",
    rituals: [
      "Lay the deity to rest with a new cloth and lullaby",
      "Take a Chaturmas vow: give up one food or habit for four months",
      "Worship Vishnu as Vamana; Pandharpur wari culminates today",
    ],
    deity: "Vishnu / Vitthal",
  },
  kamika: {
    focus: "Tulsi worship in the month of Shravana; the merit of many pilgrimages.",
    rituals: ["Offer tulsi leaves and manjari to Vishnu", "Light a ghee lamp before the tulsi plant", "Read the Kamika katha"],
    deity: "Vishnu",
  },
  "shravana-putrada": {
    focus: "Kept by couples who wish for children and for their well-being; Pavitraropana for Gaudiyas.",
    rituals: ["Worship Vishnu as Narayana with the Santan Gopal mantra", "Offer a sacred thread (pavitra) to the deity", "Feed children on Dwadashi"],
    deity: "Narayana / Bala Gopal",
  },
  aja: {
    focus: "Restores what is lost, as it did for King Harishchandra.",
    rituals: ["Worship Vishnu as Upendra", "Read the Harishchandra katha", "Keep truth in speech through the day"],
    deity: "Upendra",
  },
  parsva: {
    focus: "Parivartini: Vishnu turns on his side in yoga-nidra; honours Vamana.",
    rituals: ["Worship Vishnu as Vamana", "Donate rice, curd and silver if you can", "Sleep on the floor and rise before sunrise"],
    deity: "Vamana",
  },
  indira: {
    focus: "Falls in Pitru Paksha; offered for the peace of ancestors.",
    rituals: ["Tarpana and shraddha for ancestors at noon", "Worship Shaligram or Vishnu", "Feed Brahmins and crows, then take Parana"],
    deity: "Vishnu / Shaligram",
  },
  papankusha: {
    focus: "A goad against wrongdoing; worship of Padmanabha.",
    rituals: ["Worship Vishnu as Padmanabha", "Charity of gold, sesame, land, grain or shoes according to means", "Keep night vigil with kirtan"],
    deity: "Padmanabha",
  },
  rama: {
    focus: "Precedes Diwali; worship of Lakshmi with Vishnu.",
    rituals: ["Worship Keshava with Lakshmi", "Offer tulsi, lamps and sweets", "Begin Diwali cleaning and preparations"],
    deity: "Keshava and Lakshmi",
  },
  devutthana: {
    focus: "Vishnu awakens; Chaturmas ends and Tulsi Vivah begins the wedding season.",
    rituals: [
      "Wake the deity at dawn with conch, bells and song",
      "Tulsi Vivah with a sugarcane mandap and rangoli of Vishnu's feet",
      "Conclude Chaturmas vows",
    ],
    deity: "Vishnu / Tulsi and Shaligram",
  },
  utpanna: {
    focus: "The appearance of Ekadashi Devi, who slew the demon Mura.",
    rituals: ["Worship Vishnu together with Ekadashi Devi", "Begin a year-long Ekadashi vow from today if you wish", "Read the Utpanna katha"],
    deity: "Vishnu and Ekadashi Devi",
  },
  mokshada: {
    focus: "Gita Jayanti: the day Krishna spoke the Bhagavad Gita; Vaikuntha Ekadashi in the South.",
    rituals: [
      "Read or hear the Bhagavad Gita, at least one chapter",
      "Pass through the Vaikuntha Dwara at a Vishnu temple before dawn",
      "Offer a lamp and tulsi to Krishna",
    ],
    deity: "Krishna / Damodara",
  },
  saphala: {
    focus: "Makes effort fruitful; offerings of seasonal fruit.",
    rituals: ["Offer coconut, lemon, pomegranate and amla to Narayana", "Light lamps through the night", "Share the fruit as prasad on Dwadashi"],
    deity: "Narayana",
  },
  "pausha-putrada": {
    focus: "The winter Putrada: blessings for children and family; Vaikuntha Ekadashi in Dhanu years.",
    rituals: ["Worship Vishnu as Narayana with the Santan Gopal mantra", "Donate warm clothing and food", "Feed children on Dwadashi"],
    deity: "Narayana",
  },
};
