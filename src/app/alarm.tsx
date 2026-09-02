import { useKeepAwake } from "expo-keep-awake";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlarmClock, Check, Clock } from "lucide-react-native";
import { useCallback, useEffect, useMemo } from "react";
import { BackHandler, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FadeInView, PulseHalo } from "@/components/motion";
import { GhostButton, PrimaryButton } from "@/components/PrimaryButton";
import { backgroundGradient, fonts, palette, type } from "@/constants/theme";
import { startAlarm, stopAlarm } from "@/lib/alarm";
import { getEkadashiById, queryFromSettings } from "@/lib/ekadashi";
import { formatLongDate, formatTime12h } from "@/lib/format";
import { formatPanchangLong } from "@/lib/panchang";
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
  const ekadashi = useMemo(
    () => (params.id ? getEkadashiById(params.id, queryFromSettings(settings)) : undefined),
    [params.id, settings]
  );

  useKeepAwake();

  useEffect(() => {
    void startAlarm(settings.alarmSound);
    return () => {
      void stopAlarm();
    };
  }, [settings.alarmSound]);

  const leave = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  }, [router]);

  const dismiss = useCallback(async () => {
    await stopAlarm();
    leave();
  }, [leave]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      void dismiss();
      return true;
    });
    return () => sub.remove();
  }, [dismiss]);

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
    leave();
  };

  const title = kind === "alarm-parana" ? "Parana Time" : "Ekadashi Alarm";
  const subtitle = ekadashi
    ? kind === "alarm-parana"
      ? `Break your fast for ${ekadashi.name}`
      : `Today is ${ekadashi.name} Ekadashi`
    : "Time for your observance";

  return (
    <LinearGradient
      colors={[...backgroundGradient]}
      style={{ flex: 1, paddingHorizontal: 24, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }}
    >
      <View className="flex-1 items-center justify-center">
        <FadeInView zoom>
          <View className="mb-6 h-28 w-28 items-center justify-center">
            <PulseHalo size={112} />
            <View className="h-24 w-24 items-center justify-center rounded-full bg-saffron-500/20">
              <AlarmClock color={palette.saffron} size={48} />
            </View>
          </View>
        </FadeInView>
        <FadeInView delay={80}>
          <Text style={type.eyebrow} className="text-center text-[11px] text-saffron-300">
            {title}
          </Text>
          <Text style={type.display} className="mt-3 text-center text-[32px] text-white">
            {subtitle}
          </Text>
        </FadeInView>
        {ekadashi ? (
          <FadeInView delay={140}>
            <Text className="mt-2 text-center text-base text-violet-200">
              {formatLongDate(kind === "alarm-parana" ? ekadashi.parana.date : ekadashi.date)}
            </Text>
            <Text style={{ fontFamily: fonts.sansMedium }} className="mt-1 text-center text-sm text-saffron-200">
              {formatPanchangLong(
                kind === "alarm-parana" ? ekadashi.parana.date : ekadashi.date,
                settings.calendarId
              )}
            </Text>
            <Text className="mt-4 text-center text-sm text-violet-300">
              Parana {formatTime12h(ekadashi.parana.start)} – {formatTime12h(ekadashi.parana.end)}
            </Text>
          </FadeInView>
        ) : null}
        <Text className="mt-6 max-w-xs text-center text-sm leading-5 text-violet-200">
          This alarm stays on until you dismiss it so the observance is not missed.
        </Text>
      </View>

      <FadeInView delay={200}>
        <PrimaryButton
          label={kind === "alarm-parana" ? "I have broken my fast" : "I am observing today"}
          icon={<Check color={palette.inkDeep} size={20} />}
          onPress={() => void dismiss()}
        />
        <View className="h-3" />
        <GhostButton
          label="Snooze 5 minutes"
          icon={<Clock color={palette.saffronLight} size={18} />}
          onPress={() => void snooze()}
        />
      </FadeInView>
    </LinearGradient>
  );
}
