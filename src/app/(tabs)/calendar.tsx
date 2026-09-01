import { ChevronLeft, ChevronRight, LocateFixed } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { EkadashiDetail } from "@/components/EkadashiDetail";
import { Screen } from "@/components/Screen";
import { getTraditionLabel } from "@/constants/traditions";
import { palette } from "@/constants/theme";
import { getEkadashisInMonth, getYearRange } from "@/lib/ekadashi";
import { formatShortDate, formatTime12h } from "@/lib/format";
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
  const today = todayISO(new Date(), settings.timezone);
  const [ty, tm] = today.split("-").map(Number);
  const tradition = settings.tradition;
  const range = getYearRange(tradition);
  const [cursor, setCursor] = useState({
    year: Math.min(Math.max(ty, range.min), range.max),
    month: tm - 1,
  });
  const [selected, setSelected] = useState<Ekadashi | null>(null);

  useEffect(() => {
    setSelected(null);
  }, [tradition]);

  const monthEkadashis = useMemo(
    () => getEkadashisInMonth(cursor.year, cursor.month, tradition),
    [cursor, tradition]
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

  const canPrev = cursor.year > range.min || cursor.month > 0;
  const canNext = cursor.year < range.max || cursor.month < 11;

  const shift = (delta: number) => {
    setSelected(null);
    setCursor((c) => {
      const total = c.year * 12 + c.month + delta;
      return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
    });
  };

  const jumpToday = () => {
    setCursor({ year: ty, month: tm - 1 });
    setSelected(null);
  };

  return (
    <Screen>
      <Text className="mb-1 mt-1 text-xs uppercase tracking-[3px] text-saffron-300">
        Ekadashi Calendar
      </Text>
      <Text className="mb-3 text-xs text-violet-400">{getTraditionLabel(tradition)}</Text>
      <View className="mb-4 flex-row items-end justify-between">
        <Text className="text-3xl font-bold text-white">
          {MONTH_NAMES[cursor.month]} {cursor.year}
        </Text>
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
          <Text className="text-base font-semibold text-white">
            {MONTH_NAMES[cursor.month]} {cursor.year}
          </Text>
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
            return (
              <Pressable
                key={day}
                style={{ width: `${100 / 7}%` }}
                className="items-center py-1.5"
                disabled={!ekadashi}
                onPress={() => ekadashi && setSelected(ekadashi)}
                accessibilityRole="button"
                accessibilityLabel={
                  ekadashi ? `${ekadashi.name} Ekadashi on day ${day}` : `Day ${day}`
                }
              >
                <View
                  className={`h-10 w-10 items-center justify-center rounded-full ${
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
                </View>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-3 flex-row items-center gap-2">
          <View className="h-4 w-4 rounded-full bg-saffron-500" />
          <Text className="text-xs text-violet-300">Ekadashi fasting day</Text>
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
          Tap a highlighted date to see its Parana timing and significance.
        </Text>
      )}
    </Screen>
  );
}
