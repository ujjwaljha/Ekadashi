export interface AlarmSoundOption {
  id: string;
  label: string;
  /**
   * Bundled Metro asset for in-app looping playback, or null to use the
   * OS default notification sound (no in-app preview).
   */
  asset: number | null;
  /**
   * Filename registered with the expo-notifications config plugin.
   * Used as the Android channel sound / iOS notification sound.
   */
  notificationSound: string | null;
}

export const ALARM_SOUNDS: AlarmSoundOption[] = [
  {
    id: "temple-bell",
    label: "Temple Bell",
    asset: require("../../assets/sounds/temple-bell.wav"),
    notificationSound: "temple-bell.wav",
  },
  {
    id: "conch",
    label: "Conch (Shankha)",
    asset: require("../../assets/sounds/conch.wav"),
    notificationSound: "conch.wav",
  },
  {
    id: "system",
    label: "System Default",
    asset: null,
    notificationSound: null,
  },
];

export function getAlarmSound(id: string): AlarmSoundOption {
  return ALARM_SOUNDS.find((s) => s.id === id) ?? ALARM_SOUNDS[0];
}
