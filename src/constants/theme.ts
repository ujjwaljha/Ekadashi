import { Platform, type TextStyle, type ViewStyle } from "react-native";

/**
 * Central palette for the app's serene saffron-on-indigo aesthetic.
 * Shared by NativeWind classes and imperative APIs (gradients, switches).
 */
export const palette = {
  saffron: "#f97316",
  saffronLight: "#fdba74",
  saffronSoft: "#fed7aa",
  inkDeep: "#0b0921",
  ink: "#141136",
  inkMuted: "#1e1b4b",
  indigo: "#4f46e5",
  indigoLight: "#818cf8",
  textPrimary: "#f5f3ff",
  textSecondary: "#c4b5fd",
  textMuted: "#8b83b8",
  surface: "rgba(255,255,255,0.06)",
  surfaceBorder: "rgba(255,255,255,0.12)",
  success: "#34d399",
} as const;

/** Vertical background gradient used behind every screen. */
export const backgroundGradient = ["#07061a", palette.inkDeep, "#1a1450"] as const;

/** Warm accent gradient used on the hero / next-Ekadashi card. */
export const accentGradient = ["#fb923c", "#f97316", "#fb7185"] as const;

/** Cool gradient used when today is a Parana (fast-breaking) day. */
export const paranaGradient = ["#6366f1", "#4f46e5", "#7c3aed"] as const;

export const fonts = {
  display: "Fraunces_700Bold",
  displaySemi: "Fraunces_600SemiBold",
  sans: "DMSans_400Regular",
  sansMedium: "DMSans_500Medium",
  sansSemi: "DMSans_600SemiBold",
  sansBold: "DMSans_700Bold",
} as const;

export const type: Record<"display" | "title" | "eyebrow" | "body" | "caption", TextStyle> = {
  display: {
    fontFamily: fonts.display,
    letterSpacing: -0.4,
  },
  title: {
    fontFamily: fonts.sansBold,
    letterSpacing: -0.2,
  },
  eyebrow: {
    fontFamily: fonts.sansSemi,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  body: {
    fontFamily: fonts.sans,
  },
  caption: {
    fontFamily: fonts.sansMedium,
    letterSpacing: 0.2,
  },
};

export const shadows = {
  card: {
    shadowColor: "#02010c",
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  } satisfies ViewStyle,
  hero: {
    shadowColor: "#ea580c",
    shadowOpacity: 0.35,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  } satisfies ViewStyle,
  tabBar: {
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -6 },
    elevation: 16,
  } satisfies ViewStyle,
};

export const motion = {
  press: { damping: 16, stiffness: 420, mass: 0.35 },
  enterMs: 420,
  staggerMs: 55,
  spring: { damping: 18, stiffness: 220, mass: 0.7 },
};

export const tabBarStyle: ViewStyle = {
  backgroundColor: "#0e0b24",
  borderTopColor: "rgba(253, 186, 116, 0.12)",
  borderTopWidth: 1,
  paddingTop: 8,
  ...(Platform.OS === "web" ? { height: 64 } : null),
  ...shadows.tabBar,
};
