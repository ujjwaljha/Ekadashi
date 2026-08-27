import "@/global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { registerForNotifications, scheduleReminders } from "@/lib/notifications";
import { getAlarmSound } from "@/constants/alarms";
import { SettingsProvider, useSettings } from "@/store/settings";

/**
 * On first launch (once settings are hydrated) request notification permission
 * and lay down the full reminder schedule. Re-runs whenever settings change.
 */
function NotificationBootstrap() {
  const { settings, hydrated } = useSettings();

  useEffect(() => {
    if (!hydrated) return;
    (async () => {
      if (!settings.notificationsEnabled) {
        await scheduleReminders(settings);
        return;
      }
      const sound = getAlarmSound(settings.alarmSound).notificationSound;
      await registerForNotifications(sound);
      await scheduleReminders(settings);
    })();
  }, [hydrated, settings]);

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <NotificationBootstrap />
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
