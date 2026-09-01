import { useLocalSearchParams, useRouter } from "expo-router";
import { AlarmClock, Check, Clock } from "lucide-react-native";
import { useEffect, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { palette } from "@/constants/theme";
import { startAlarm, stopAlarm } from "@/lib/alarm";
import { getEkadashiById } from "@/lib/ekadashi";
import { formatLongDate, formatTime12h } from "@/lib/format";
import { scheduleSnooze } from "@/lib/notifications";
import { useSettings } from "@/store/settings";

/**
 * Full-screen persistent alarm. Opened when an alarm notification is received
 * or tapped. The looping sound continues until the devotee dismisses or snoozes.
 */
export default function AlarmScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const params = useLocalSearchParams<{ kind?: string; id?: string }>();
  const kind = params.kind === "alarm-parana" ? "alarm-parana" : "alarm-fasting";
  const ekadashi = useMemo(() => (params.id ? getEkadashiById(params.id) : undefined), [params.id]);

  useEffect(() => {
    void startAlarm(settings.alarmSound);
    return () => {
      void stopAlarm();
    };
  }, [settings.alarmSound]);

  const dismiss = async () => {
    await stopAlarm();
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  };

  const snooze = async () => {
    await stopAlarm();
    if (ekadashi) {
      await scheduleSnooze(
        settings,
        5,
        kind === "alarm-parana" ? "Parana reminder" : `${ekadashi.name} Ekadashi`,
        kind === "alarm-parana"
          ? `Snoozed — Parana window ${ekadashi.parana.start}–${ekadashi.parana.end}.`
          : `Snoozed — today is ${ekadashi.name} Ekadashi.`,
        kind,
        ekadashi.id
      );
    }
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  };

  const title = kind === "alarm-parana" ? "Parana Time" : "Ekadashi Alarm";
  const subtitle = ekadashi
    ? kind === "alarm-parana"
      ? `Break your fast for ${ekadashi.name}`
      : `Today is ${ekadashi.name} Ekadashi`
    : "Time for your observance";

  return (
    <View
      className="flex-1 bg-indigoink-950 px-6"
      style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }}
    >
      <View className="flex-1 items-center justify-center">
        <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-saffron-500/20">
          <AlarmClock color={palette.saffron} size={48} />
        </View>
        <Text className="text-xs uppercase tracking-[3px] text-saffron-300">{title}</Text>
        <Text className="mt-3 text-center text-3xl font-extrabold text-white">{subtitle}</Text>
        {ekadashi ? (
          <Text className="mt-2 text-center text-base text-violet-200">
            {formatLongDate(kind === "alarm-parana" ? ekadashi.parana.date : ekadashi.date)}
          </Text>
        ) : null}
        {ekadashi ? (
          <Text className="mt-4 text-center text-sm text-violet-300">
            Parana {formatTime12h(ekadashi.parana.start)} – {formatTime12h(ekadashi.parana.end)}
          </Text>
        ) : null}
        <Text className="mt-6 max-w-xs text-center text-sm leading-5 text-violet-200">
          This alarm stays on until you dismiss it so the observance is not missed.
        </Text>
      </View>

      <Pressable
        onPress={dismiss}
        className="mb-3 flex-row items-center justify-center gap-2 rounded-2xl bg-saffron-500 py-4"
      >
        <Check color={palette.inkDeep} size={20} />
        <Text className="text-base font-bold text-indigoink-900">
          {kind === "alarm-parana" ? "I have broken my fast" : "I am observing today"}
        </Text>
      </Pressable>

      <Pressable
        onPress={snooze}
        className="flex-row items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-4"
      >
        <Clock color={palette.saffronLight} size={18} />
        <Text className="text-base font-semibold text-saffron-200">Snooze 5 minutes</Text>
      </Pressable>
    </View>
  );
}
