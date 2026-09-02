import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

function run(task: () => Promise<void>): void {
  if (Platform.OS === "web") return;
  void task().catch(() => undefined);
}

export function tapLight(): void {
  run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export function tapSelection(): void {
  run(() => Haptics.selectionAsync());
}

export function tapSuccess(): void {
  run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}
