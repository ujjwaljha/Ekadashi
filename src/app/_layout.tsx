import "@/global.css";

import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Onboarding } from "@/components/Onboarding";
import { getAlarmSound } from "@/constants/alarms";
import { palette } from "@/constants/theme";
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

function AppGate() {
  const { settings, hydrated } = useSettings();

  return (
    <View style={{ flex: 1, backgroundColor: palette.inkDeep }}>
      {hydrated && settings.onboardingCompleted ? <NotificationBootstrap /> : null}
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
      {!hydrated ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: palette.inkDeep,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text className="text-xs uppercase tracking-[3px] text-saffron-300">Ekadashi Reminder</Text>
          <Text className="mt-2 text-lg font-semibold text-white">Loading your calendar…</Text>
        </View>
      ) : null}
      {hydrated && !settings.onboardingCompleted ? (
        <View style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}>
          <Onboarding />
        </View>
      ) : null}
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <StatusBar style="light" />
          <AppGate />
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
