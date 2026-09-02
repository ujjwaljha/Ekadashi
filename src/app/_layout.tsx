import "@/global.css";

import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef } from "react";
import { AppState, Platform, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { PulseHalo } from "@/components/motion";
import { Onboarding } from "@/components/Onboarding";
import { getAlarmSound } from "@/constants/alarms";
import { fonts, palette, type } from "@/constants/theme";
import { useAppFonts } from "@/lib/fonts";
import { startAlarm, stopAlarm } from "@/lib/alarm";
import { getEkadashiById, queryFromSettings } from "@/lib/ekadashi";
import {
  consumeLastNotificationResponse,
  getScheduledCount,
  peekLastNotificationResponse,
  registerForNotifications,
  scheduleReminders,
  scheduleSnooze,
} from "@/lib/notifications";
import {
  DISMISS_ACTION,
  parseNotificationData,
  shouldOpenAlarm,
  SNOOZE_ACTION,
  type NotificationPayload,
} from "@/lib/notificationPayload";
import { SettingsProvider, useSettings } from "@/store/settings";
import type { Settings } from "@/types";

function alarmKind(payload: NotificationPayload): "alarm-fasting" | "alarm-parana" {
  return payload.kind === "alarm-parana" ? "alarm-parana" : "alarm-fasting";
}

async function snoozeFromPayload(settings: Settings, payload: NotificationPayload): Promise<void> {
  const ekadashi = getEkadashiById(payload.ekadashiId, queryFromSettings(settings));
  const kind = alarmKind(payload);
  await scheduleSnooze(
    settings,
    5,
    kind === "alarm-parana" ? "Parana reminder" : `${ekadashi?.name ?? "Ekadashi"} Ekadashi`,
    kind === "alarm-parana"
      ? `Snoozed — Parana window ${ekadashi?.parana.start ?? ""}–${ekadashi?.parana.end ?? ""}.`
      : `Snoozed — today is ${ekadashi?.name ?? "Ekadashi"} Ekadashi.`,
    kind,
    payload.ekadashiId
  );
}

/**
 * On first launch (once settings are hydrated) request notification permission
 * and lay down the full reminder schedule. Re-runs whenever settings change.
 * Also routes incoming alarm notifications to the persistent alarm screen,
 * including the tap that launched a cold start.
 */
function NotificationBootstrap() {
  const { settings, hydrated } = useSettings();
  const router = useRouter();
  const handledRef = useRef<string | null>(null);

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

  const openAlarm = useCallback(
    (payload: NotificationPayload) => {
      if (!shouldOpenAlarm(payload)) return;
      void startAlarm(settings.alarmSound);
      router.push({
        pathname: "/alarm",
        params: { kind: payload.kind, id: payload.ekadashiId },
      });
    },
    [router, settings.alarmSound]
  );

  const handleResponse = useCallback(
    async (response: Notifications.NotificationResponse | null) => {
      if (!response) return;
      const requestId = response.notification.request.identifier;
      if (handledRef.current === requestId) return;
      handledRef.current = requestId;

      const payload = parseNotificationData(response.notification.request.content.data);
      const action = response.actionIdentifier;

      if (action === SNOOZE_ACTION && payload && shouldOpenAlarm(payload)) {
        await stopAlarm();
        await snoozeFromPayload(settings, payload);
        consumeLastNotificationResponse();
        return;
      }
      if (action === DISMISS_ACTION) {
        await stopAlarm();
        consumeLastNotificationResponse();
        return;
      }

      if (payload) openAlarm(payload);
      consumeLastNotificationResponse();
    },
    [openAlarm, settings]
  );

  useEffect(() => {
    if (Platform.OS === "web") return;

    void handleResponse(peekLastNotificationResponse());

    const received = Notifications.addNotificationReceivedListener((notification) => {
      const requestId = notification.request.identifier;
      if (handledRef.current === requestId) return;
      const payload = parseNotificationData(notification.request.content.data);
      if (!shouldOpenAlarm(payload)) return;
      handledRef.current = requestId;
      openAlarm(payload);
    });

    const response = Notifications.addNotificationResponseReceivedListener((event) => {
      void handleResponse(event);
    });

    return () => {
      received.remove();
      response.remove();
    };
  }, [handleResponse, openAlarm]);

  useEffect(() => {
    if (!hydrated || Platform.OS === "web") return;
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active" || !settings.notificationsEnabled) return;
      void (async () => {
        const count = await getScheduledCount();
        if (count === 0) await scheduleReminders(settings);
      })();
    });
    return () => sub.remove();
  }, [hydrated, settings]);

  return null;
}

function Splash() {
  return (
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
      <View className="h-28 w-28 items-center justify-center">
        <PulseHalo size={120} />
        <View className="h-16 w-16 rounded-full bg-saffron-500/20" />
      </View>
      <Text style={type.eyebrow} className="mt-6 text-[11px] text-saffron-300">
        Ekadashi Reminder
      </Text>
      <Text style={{ fontFamily: fonts.display }} className="mt-2 text-2xl text-white">
        Loading your calendar…
      </Text>
    </View>
  );
}

function AppGate() {
  const { settings, hydrated } = useSettings();
  const fontsReady = useAppFonts();
  const ready = hydrated && fontsReady;

  return (
    <View style={{ flex: 1, backgroundColor: palette.inkDeep }}>
      {ready && settings.onboardingCompleted ? <NotificationBootstrap /> : null}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#07061a" },
          animation: "fade_from_bottom",
          animationDuration: 280,
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
        <Stack.Screen name="about" />
        <Stack.Screen name="privacy" />
      </Stack>
      {!ready ? <Splash /> : null}
      {ready && !settings.onboardingCompleted ? (
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
