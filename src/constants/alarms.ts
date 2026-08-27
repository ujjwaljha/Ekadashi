export interface AlarmSoundOption {
  id: string;
  label: string;
  /**
   * Bundled asset (a Metro module id from `require`) for in-app looping
   * playback, or null to use the OS default sound.
   */
  asset: number | null;
  /**
   * Filename registered with the expo-notifications config plugin, used as the
   * Android notification-channel sound / iOS notification sound.
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
