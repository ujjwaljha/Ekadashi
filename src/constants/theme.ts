/**
 * Central palette for the app's serene saffron-on-indigo aesthetic.
 * Kept as plain constants so both NativeWind classes and imperative APIs
 * (gradients, status bar, native pickers) can share the same values.
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
} as const;

/** Vertical background gradient used behind every screen. */
export const backgroundGradient = [palette.inkDeep, palette.inkMuted] as const;

/** Warm accent gradient used on the hero / next-Ekadashi card. */
export const accentGradient = [palette.saffron, "#fb7185"] as const;
