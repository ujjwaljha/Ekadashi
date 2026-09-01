import "@/global.css";

import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { getAlarmSound } from "@/constants/alarms";
import { startAlarm } from "@/lib/alarm";
import { registerForNotifications, scheduleReminders } from "@/lib/notifications";
import { SettingsProvider, useSettings } from "@/store/settings";
import type { NotificationKind } from "@/types";

function isAlarmKind(kind: unknown): kind is "alarm-fasting" | "alarm-parana" {
  return kind === "alarm-fasting" || kind === "alarm-parana";
}

/**
 * On first launch (once settings are hydrated) request notification permission
 * and lay down the full reminder schedule. Re-runs whenever settings change.
 * Also routes incoming alarm notifications to the persistent alarm screen.
 */
function NotificationBootstrap() {
  const { settings, hydrated } = useSettings();
  const router = useRouter();

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

  useEffect(() => {
    if (Platform.OS === "web") return;

    const openAlarm = (kind: NotificationKind, ekadashiId: string) => {
      if (!isAlarmKind(kind)) return;
      void startAlarm(settings.alarmSound);
      router.push({
        pathname: "/alarm",
        params: { kind, id: ekadashiId },
      });
    };

    const received = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data ?? {};
      openAlarm(data.kind as NotificationKind, String(data.ekadashiId ?? ""));
    });

    const response = Notifications.addNotificationResponseReceivedListener((event) => {
      const data = event.notification.request.content.data ?? {};
      openAlarm(data.kind as NotificationKind, String(data.ekadashiId ?? ""));
    });

    return () => {
      received.remove();
      response.remove();
    };
  }, [router, settings.alarmSound]);

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <NotificationBootstrap />
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#0b0921" },
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="alarm"
              options={{
                presentation: "fullScreenModal",
                animation: "fade",
                gestureEnabled: false,
              }}
            />
          </Stack>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
