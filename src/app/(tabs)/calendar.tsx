import { ChevronLeft, ChevronRight, LocateFixed } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { EkadashiDetail } from "@/components/EkadashiDetail";
import { Screen } from "@/components/Screen";
import { getCalendar, traditionLabel } from "@/constants/calendars";
import { getCity } from "@/constants/cities";
import { palette } from "@/constants/theme";
import { getEkadashisInMonth, getYearRange, queryFromSettings } from "@/lib/ekadashi";
import { formatShortDate, formatTime12h } from "@/lib/format";
import { formatPanchangLong, getPanchangDay } from "@/lib/panchang";
import { todayISO } from "@/lib/timezone";
import { useSettings } from "@/store/settings";
import type { Ekadashi } from "@/types";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEK = ["S", "M", "T", "W", "T", "F", "S"];

function isoOf(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function CalendarScreen() {
  const { settings } = useSettings();
  const query = useMemo(() => queryFromSettings(settings), [settings]);
  const calendar = getCalendar(settings.calendarId);
  const city = getCity(settings.cityId);
  const today = todayISO(new Date(), settings.timezone);
  const [ty, tm] = today.split("-").map(Number);
  const range = getYearRange();
  const [cursor, setCursor] = useState({
    year: Math.min(Math.max(ty, range.min), range.max),
    month: tm - 1,
  });
  const [selected, setSelected] = useState<Ekadashi | null>(null);

  const monthEkadashis = useMemo(
    () => getEkadashisInMonth(cursor.year, cursor.month, query),
    [cursor, query]
  );
  const ekadashiByDay = useMemo(() => {
    const map = new Map<number, Ekadashi>();
    for (const e of monthEkadashis) map.set(Number(e.date.slice(8, 10)), e);
    return map;
  }, [monthEkadashis]);

  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const firstWeekday = new Date(cursor.year, cursor.month, 1).getDay();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthStartIso = isoOf(cursor.year, cursor.month, 1);
  const monthPanchang = getPanchangDay(monthStartIso, settings.calendarId);

  const canPrev = cursor.year > range.min || cursor.month > 0;
  const canNext = cursor.year < range.max || cursor.month < 11;
  const canPrevYear = cursor.year > range.min;
  const canNextYear = cursor.year < range.max;

  const shift = (delta: number) => {
    setSelected(null);
    setCursor((c) => {
      const total = c.year * 12 + c.month + delta;
      return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
    });
  };

  const shiftYear = (delta: number) => {
    setSelected(null);
    setCursor((c) => ({
      year: Math.min(range.max, Math.max(range.min, c.year + delta)),
      month: c.month,
    }));
  };

  const jumpToday = () => {
    setCursor({ year: ty, month: tm - 1 });
    setSelected(null);
  };

  return (
    <Screen>
      <Text className="mb-1 mt-1 text-xs uppercase tracking-[3px] text-saffron-300">
        {calendar.name}
      </Text>
      <View className="mb-4 flex-row items-end justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-3xl font-bold text-white">
            {MONTH_NAMES[cursor.month]} {cursor.year}
          </Text>
          <Text className="mt-0.5 text-sm text-saffron-200">{monthPanchang.civilLabel}</Text>
          <Text className="text-xs text-violet-400">
            {traditionLabel(settings.tradition)} · {city.name}
          </Text>
        </View>
        <Pressable
          onPress={jumpToday}
          className="flex-row items-center gap-1 rounded-full bg-white/10 px-3 py-1.5"
        >
          <LocateFixed color={palette.saffronLight} size={14} />
          <Text className="text-xs font-semibold text-saffron-200">Today</Text>
        </Pressable>
      </View>

      <Card className="mb-4">
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <Pressable
              onPress={() => canPrevYear && shiftYear(-1)}
              disabled={!canPrevYear}
              className="rounded-full bg-white/10 px-2 py-2"
              style={{ opacity: canPrevYear ? 1 : 0.3 }}
              accessibilityRole="button"
              accessibilityLabel="Previous year"
            >
              <Text className="text-xs font-bold text-white">«</Text>
            </Pressable>
            <Pressable
              onPress={() => canPrev && shift(-1)}
              disabled={!canPrev}
              className="rounded-full bg-white/10 p-2"
              style={{ opacity: canPrev ? 1 : 0.3 }}
              accessibilityRole="button"
              accessibilityLabel="Previous month"
            >
              <ChevronLeft color={palette.textPrimary} size={20} />
            </Pressable>
          </View>
          <Text className="text-base font-semibold text-white">
            {MONTH_NAMES[cursor.month]} {cursor.year}
          </Text>
          <View className="flex-row items-center gap-1">
            <Pressable
              onPress={() => canNext && shift(1)}
              disabled={!canNext}
              className="rounded-full bg-white/10 p-2"
              style={{ opacity: canNext ? 1 : 0.3 }}
              accessibilityRole="button"
              accessibilityLabel="Next month"
            >
              <ChevronRight color={palette.textPrimary} size={20} />
            </Pressable>
            <Pressable
              onPress={() => canNextYear && shiftYear(1)}
              disabled={!canNextYear}
              className="rounded-full bg-white/10 px-2 py-2"
              style={{ opacity: canNextYear ? 1 : 0.3 }}
              accessibilityRole="button"
              accessibilityLabel="Next year"
            >
              <Text className="text-xs font-bold text-white">»</Text>
            </Pressable>
          </View>
        </View>

        <View className="flex-row">
          {WEEK.map((d, i) => (
            <View key={`${d}-${i}`} className="flex-1 items-center py-1">
              <Text className="text-xs font-semibold text-violet-300">{d}</Text>
            </View>
          ))}
        </View>

        <View className="flex-row flex-wrap">
          {cells.map((day, idx) => {
            if (day === null) return <View key={`e${idx}`} style={{ width: `${100 / 7}%` }} />;
            const ekadashi = ekadashiByDay.get(day);
            const iso = isoOf(cursor.year, cursor.month, day);
            const isToday = iso === today;
            const isSelected = selected?.date === iso;
            const panchang = getPanchangDay(iso, settings.calendarId);
            return (
              <Pressable
                key={day}
                style={{ width: `${100 / 7}%` }}
                className="items-center py-1"
                onPress={() => ekadashi && setSelected(ekadashi)}
                disabled={!ekadashi}
                accessibilityRole="button"
                accessibilityLabel={
                  ekadashi
                    ? `${ekadashi.name} Ekadashi on day ${day}, ${panchang.civilLabel}`
                    : `Day ${day}, ${panchang.civilLabel}`
                }
              >
                <View
                  className={`aspect-square w-[92%] items-center justify-center rounded-2xl ${
                    ekadashi ? "bg-saffron-500" : ""
                  } ${isSelected ? "border-2 border-white" : ""} ${
                    isToday && !ekadashi ? "border border-violet-300" : ""
                  } ${isToday && ekadashi ? "border-2 border-white" : ""}`}
                >
                  <Text
                    className={`text-sm ${
                      ekadashi ? "font-bold text-indigoink-900" : "text-violet-100"
                    }`}
                  >
                    {day}
                  </Text>
                  <Text
                    className={`text-[8px] ${
                      ekadashi ? "font-semibold text-indigoink-900/80" : "text-violet-400"
                    }`}
                  >
                    {panchang.civilShort}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-3 flex-row items-center gap-2">
          <View className="h-4 w-4 rounded-full bg-saffron-500" />
          <Text className="flex-1 text-xs text-violet-300">
            Ekadashi in {calendar.name} · each cell also shows the regional date
          </Text>
        </View>
      </Card>

      {monthEkadashis.length > 0 ? (
        <View className="mb-4 gap-2">
          <Text className="text-lg font-bold text-white">This month</Text>
          {monthEkadashis.map((e) => (
            <Pressable key={e.id} onPress={() => setSelected(e)}>
              <Card className={`flex-row items-center ${selected?.id === e.id ? "border-saffron-400/50" : ""}`}>
                <View className="w-14">
                  <Text className="text-base font-bold text-saffron-300">
                    {formatShortDate(e.date)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-white">{e.name}</Text>
                  <Text className="text-xs text-saffron-200/90" numberOfLines={1}>
                    {formatPanchangLong(e.date, settings.calendarId)}
                  </Text>
                  <Text className="text-xs text-violet-300">
                    Parana {formatTime12h(e.parana.start)}–{formatTime12h(e.parana.end)}
                  </Text>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      ) : (
        <Text className="mb-4 text-center text-sm text-violet-300">
          No Ekadashi in this month of the dataset.
        </Text>
      )}

      {selected ? (
        <Card>
          <EkadashiDetail item={selected} />
        </Card>
      ) : (
        <Text className="px-1 text-center text-sm text-violet-300">
          Tap a highlighted date to see its Parana timing and {calendar.name} label.
        </Text>
      )}
    </Screen>
  );
}
