import * as Localization from "expo-localization";
import { useMemo, useState } from "react";
import { Text, View } from "react-native";

import { CalendarPicker } from "@/components/CalendarPicker";
import { CityPicker } from "@/components/CityPicker";
import { Chip } from "@/components/Chip";
import { FadeInView, PressableScale } from "@/components/motion";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { getCalendar, suggestCalendarFromLocale, TRADITIONS } from "@/constants/calendars";
import { getCity, suggestCityFromCalendar, suggestCityFromTimezone } from "@/constants/cities";
import { fonts, palette, type } from "@/constants/theme";
import { useSettings } from "@/store/settings";
import type { CalendarId, TraditionId } from "@/types";

export function Onboarding() {
  const { settings, update } = useSettings();
  const suggestedCalendar = useMemo(() => {
    try {
      const locales = Localization.getLocales();
      return suggestCalendarFromLocale(locales[0]?.languageTag);
    } catch {
      return suggestCalendarFromLocale();
    }
  }, []);
  const deviceTz = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return undefined;
    }
  }, []);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [calendarId, setCalendarId] = useState<CalendarId>(settings.calendarId || suggestedCalendar);
  const [cityId, setCityId] = useState(
    settings.cityId || suggestCityFromCalendar(settings.calendarId || suggestedCalendar)
  );
  const [tradition, setTradition] = useState<TraditionId>(
    getCalendar(settings.calendarId || suggestedCalendar).defaultTradition
  );

  const suggestedCity = useMemo(() => {
    const fromCalendar = suggestCityFromCalendar(calendarId);
    const fromTz = suggestCityFromTimezone(deviceTz);
    return fromCalendar !== "delhi" ? fromCalendar : fromTz;
  }, [calendarId, deviceTz]);

  const selectCalendar = (id: CalendarId) => {
    setCalendarId(id);
    setTradition(getCalendar(id).defaultTradition);
    setCityId(suggestCityFromCalendar(id));
  };

  const finish = () => {
    const city = getCity(cityId);
    update({
      calendarId,
      tradition,
      cityId,
      timezone: city.timezone,
      onboardingCompleted: true,
    });
  };

  const calendar = getCalendar(calendarId);
  const city = getCity(cityId);

  return (
    <Screen>
      <Text style={type.eyebrow} className="mb-1 mt-1 text-[11px] text-saffron-300">
        Welcome
      </Text>
      <Text style={type.display} className="text-[34px] text-white">
        Observe Ekadashi in your calendar
      </Text>
      <Text className="mt-2 text-sm leading-5 text-violet-200">
        Pick your panchang, city, and fasting tradition. Published India dates stay in the app
        for five years; Parana follows your city sunrise.
      </Text>

      <View className="my-4 flex-row gap-2">
        {[1, 2, 3].map((n) => (
          <View
            key={n}
            className={`h-1.5 flex-1 rounded-full ${step >= n ? "bg-saffron-500" : "bg-white/15"}`}
          />
        ))}
      </View>

      <FadeInView key={step}>
        {step === 1 ? (
          <>
            <Text style={type.title} className="mb-3 text-lg text-white">
              1. Choose your calendar
            </Text>
            <CalendarPicker value={calendarId} onChange={selectCalendar} suggestedId={suggestedCalendar} />
            <View className="mt-4">
              <PrimaryButton
                label={`Continue with ${calendar.name}`}
                onPress={() => setStep(2)}
                accessibilityLabel="Continue to city"
              />
            </View>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <Text style={type.title} className="mb-1 text-lg text-white">
              2. Your city
            </Text>
            <Text className="mb-4 text-sm text-violet-300">
              Sunrise here sets the Parana window. Cities in India and Nepal keep published fasting
              dates; other cities calculate the local day when it shifts.
            </Text>
            <CityPicker value={cityId} onChange={setCityId} suggestedId={suggestedCity} />
            <View className="mt-4">
              <PrimaryButton label={`Continue with ${city.name}`} onPress={() => setStep(3)} />
            </View>
            <PressableScale onPress={() => setStep(1)} className="mt-3 py-2">
              <Text className="text-center text-sm text-violet-300">Back to calendars</Text>
            </PressableScale>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <Text style={type.title} className="mb-1 text-lg text-white">
              3. Fasting tradition
            </Text>
            <Text className="mb-4 text-sm text-violet-300">
              {calendar.name} defaults to {calendar.defaultTradition === "vaishnava" ? "Vaishnava" : "Smarta"}.
              You can change this anytime in Settings.
            </Text>
            <View className="gap-2">
              {TRADITIONS.map((item) => (
                <PressableScale key={item.id} onPress={() => setTradition(item.id)} haptic="selection">
                  <View
                    className={`rounded-3xl border p-5 ${
                      tradition === item.id
                        ? "border-saffron-400/60 bg-saffron-500/10"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <Text style={{ fontFamily: fonts.sansBold }} className="text-base text-white">
                      {item.name}
                    </Text>
                    <Text className="mt-1 text-sm leading-5 text-violet-200">{item.summary}</Text>
                  </View>
                </PressableScale>
              ))}
            </View>
            <View className="mt-4 flex-row flex-wrap gap-2">
              <Chip label={calendar.name} active />
              <Chip label={city.name} active />
              <Chip label={tradition === "vaishnava" ? "Vaishnava dates" : "Smarta dates"} active />
            </View>
            <View className="mt-4">
              <PrimaryButton label="Start using the app" onPress={finish} />
            </View>
            <PressableScale onPress={() => setStep(2)} className="mt-3 py-2">
              <Text className="text-center text-sm text-violet-300">Back to city</Text>
            </PressableScale>
          </>
        ) : null}
      </FadeInView>

      <Text className="mt-6 text-center text-[11px] leading-4 text-violet-500">
        Five years of dates stay in the app. Confirm Parana with a local panchang.
      </Text>
      <Text className="mt-2 text-center text-[11px] text-violet-600" style={{ color: palette.textMuted }}>
        You can change calendar, city, and tradition later in Settings.
      </Text>
    </Screen>
  );
}
