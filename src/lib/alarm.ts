import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";

import { getAlarmSound } from "@/constants/alarms";

// A single shared player so start/stop always control the same looping sound.
let player: AudioPlayer | null = null;

/**
 * Start looping the selected alarm sound in-app. Used alongside the OS alarm
 * notification so that, when the app is open (or opened from the alert), the
 * sound stays persistent until the devotee dismisses it.
 */
export async function startAlarm(soundId: string): Promise<boolean> {
  try {
    const option = getAlarmSound(soundId);
    if (!option.asset) return false;

    await stopAlarm();
    await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true }).catch(
      () => undefined
    );

    player = createAudioPlayer(option.asset);
    player.loop = true;
    player.volume = 1.0;
    player.play();
    return true;
  } catch (err) {
    console.warn("[alarm] failed to start", err);
    return false;
  }
}

/** Stop and release the looping alarm sound, if any. */
export async function stopAlarm(): Promise<void> {
  if (!player) return;
  try {
    player.pause();
    player.remove();
  } catch (err) {
    console.warn("[alarm] failed to stop", err);
  } finally {
    player = null;
  }
}

export function isAlarmPlaying(): boolean {
  return !!player?.playing;
}
