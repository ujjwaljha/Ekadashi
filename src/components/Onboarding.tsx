import * as Localization from "expo-localization";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { CalendarPicker } from "@/components/CalendarPicker";
import { Chip } from "@/components/Chip";
import { Screen } from "@/components/Screen";
import { getCalendar, suggestCalendarFromLocale, TRADITIONS } from "@/constants/calendars";
import { palette } from "@/constants/theme";
import { useSettings } from "@/store/settings";
import type { CalendarId, TraditionId } from "@/types";

export function Onboarding() {
  const { settings, update } = useSettings();
  const suggested = useMemo(() => {
    try {
      const locales = Localization.getLocales();
      return suggestCalendarFromLocale(locales[0]?.languageTag);
    } catch {
      return suggestCalendarFromLocale();
    }
  }, []);
  const [step, setStep] = useState<1 | 2>(1);
  const [calendarId, setCalendarId] = useState<CalendarId>(settings.calendarId || suggested);
  const [tradition, setTradition] = useState<TraditionId>(
    getCalendar(settings.calendarId || suggested).defaultTradition
  );

  const selectCalendar = (id: CalendarId) => {
    setCalendarId(id);
    setTradition(getCalendar(id).defaultTradition);
  };

  const finish = () => {
    update({
      calendarId,
      tradition,
      onboardingCompleted: true,
    });
  };

  const calendar = getCalendar(calendarId);

  return (
    <Screen>
      <Text className="mb-1 mt-1 text-xs uppercase tracking-[3px] text-saffron-300">
        Welcome
      </Text>
      <Text className="text-3xl font-bold text-white">Observe Ekadashi in your calendar</Text>
      <Text className="mt-2 text-sm leading-5 text-violet-200">
        Mithila, Bengali, Tamil, ISKCON, and other regional panchangs name months and years
        differently — and Smarta vs Vaishnava rules can shift the fasting day.
      </Text>

      <View className="my-4 flex-row gap-2">
        <View className={`h-1.5 flex-1 rounded-full ${step === 1 ? "bg-saffron-500" : "bg-white/15"}`} />
        <View className={`h-1.5 flex-1 rounded-full ${step === 2 ? "bg-saffron-500" : "bg-white/15"}`} />
      </View>

      {step === 1 ? (
        <>
          <Text className="mb-3 text-lg font-bold text-white">1. Choose your calendar</Text>
          <CalendarPicker value={calendarId} onChange={selectCalendar} suggestedId={suggested} />
          <Pressable
            onPress={() => setStep(2)}
            className="mt-4 rounded-2xl bg-saffron-500 py-3.5"
            accessibilityRole="button"
            accessibilityLabel="Continue to tradition"
          >
            <Text className="text-center text-base font-bold text-indigoink-900">
              Continue with {calendar.name}
            </Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text className="mb-1 text-lg font-bold text-white">2. Fasting tradition</Text>
          <Text className="mb-4 text-sm text-violet-300">
            {calendar.name} defaults to {calendar.defaultTradition === "vaishnava" ? "Vaishnava" : "Smarta"}.
            You can change this anytime in Settings.
          </Text>
          <View className="gap-2">
            {TRADITIONS.map((item) => (
              <Pressable key={item.id} onPress={() => setTradition(item.id)}>
                <View
                  className={`rounded-3xl border p-5 ${
                    tradition === item.id
                      ? "border-saffron-400/60 bg-saffron-500/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <Text className="text-base font-bold text-white">{item.name}</Text>
                  <Text className="mt-1 text-sm leading-5 text-violet-200">{item.summary}</Text>
                </View>
              </Pressable>
            ))}
          </View>
          <View className="mt-4 flex-row flex-wrap gap-2">
            <Chip label={calendar.name} active />
            <Chip label={tradition === "vaishnava" ? "Vaishnava dates" : "Smarta dates"} active />
          </View>
          <Pressable
            onPress={finish}
            className="mt-4 rounded-2xl bg-saffron-500 py-3.5"
            accessibilityRole="button"
          >
            <Text className="text-center text-base font-bold text-indigoink-900">
              Start using the app
            </Text>
          </Pressable>
          <Pressable onPress={() => setStep(1)} className="mt-3 py-2">
            <Text className="text-center text-sm text-violet-300">Back to calendars</Text>
          </Pressable>
        </>
      )}

      <Text className="mt-6 text-center text-[11px] leading-4 text-violet-500">
        Dates are an India (IST) reference. Confirm Parana with a local panchang.
      </Text>
      <Text className="mt-2 text-center text-[11px] text-violet-600" style={{ color: palette.textMuted }}>
        You can change calendar and tradition later in Settings.
      </Text>
    </Screen>
  );
}
