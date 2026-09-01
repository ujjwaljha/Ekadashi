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
export const backgroundGradient = [palette.inkDeep, palette.inkMuted] as const;

/** Warm accent gradient used on the hero / next-Ekadashi card. */
export const accentGradient = [palette.saffron, "#fb7185"] as const;

/** Cool gradient used when today is a Parana (fast-breaking) day. */
export const paranaGradient = ["#4f46e5", "#7c3aed"] as const;
