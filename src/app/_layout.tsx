import "@/global.css";

import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AppState, Platform } from "react-native";
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
 * First-launch permission + reminder schedule. Debounced so toggling chips
 * does not cancel and rebuild the OS schedule on every tap. Also opens the
 * persistent alarm from a cold-start notification tap and when the app is
 * already in the foreground.
 */
function NotificationBootstrap() {
  const { settings, hydrated } = useSettings();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    const handle = setTimeout(() => {
      void (async () => {
        if (settings.notificationsEnabled || settings.alarmEnabled) {
          const sound = getAlarmSound(settings.alarmSound).notificationSound;
          await registerForNotifications(sound);
        }
        await scheduleReminders(settings);
      })();
    }, 600);
    return () => clearTimeout(handle);
  }, [hydrated, settings]);

  useEffect(() => {
    if (Platform.OS === "web" || !hydrated) return;

    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") return;
      void scheduleReminders(settings);
    });
    return () => subscription.remove();
  }, [hydrated, settings]);

  useEffect(() => {
    if (Platform.OS === "web") return;

    const openAlarm = (kind: NotificationKind, ekadashiId: string) => {
      if (!isAlarmKind(kind)) return;
      void startAlarm(settings.alarmSound);
      router.replace({ pathname: "/alarm", params: { kind, id: ekadashiId } });
    };

    const received = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data ?? {};
      openAlarm(data.kind as NotificationKind, String(data.ekadashiId ?? ""));
    });

    const response = Notifications.addNotificationResponseReceivedListener((event) => {
      const data = event.notification.request.content.data ?? {};
      openAlarm(data.kind as NotificationKind, String(data.ekadashiId ?? ""));
    });

    // Cold start: the tap that launched the process is not delivered to the
    // listener above. Read and clear it so we do not reopen on every remount.
    void Notifications.getLastNotificationResponseAsync()
      .then((last) => {
        if (!last) return;
        const data = last.notification.request.content.data ?? {};
        openAlarm(data.kind as NotificationKind, String(data.ekadashiId ?? ""));
        Notifications.clearLastNotificationResponse();
      })
      .catch(() => undefined);

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
