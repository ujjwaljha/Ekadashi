import { ChevronLeft, ChevronRight, Sunrise } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { palette } from "@/constants/theme";
import { getEkadashisInMonth, getYearRange } from "@/lib/ekadashi";
import { formatLongDate, formatTime12h } from "@/lib/format";
import type { Ekadashi } from "@/types";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEK = ["S", "M", "T", "W", "T", "F", "S"];

function isoOf(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function CalendarScreen() {
  const today = new Date();
  const range = getYearRange();
  const [cursor, setCursor] = useState({
    // Default to the current month, clamped into the dataset's year range.
    year: Math.min(Math.max(today.getFullYear(), range.min), range.max),
    month: today.getMonth(),
  });
  const [selected, setSelected] = useState<Ekadashi | null>(null);

  const monthEkadashis = useMemo(
    () => getEkadashisInMonth(cursor.year, cursor.month),
    [cursor]
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

  return (
    <Screen>
      <Text className="mb-1 mt-1 text-xs uppercase tracking-[3px] text-saffron-300">
        Ekadashi Calendar
      </Text>
      <Text className="mb-4 text-3xl font-bold text-white">
        {MONTH_NAMES[cursor.month]} {cursor.year}
      </Text>

      <Card className="mb-4">
        <View className="mb-3 flex-row items-center justify-between">
          <Pressable
            onPress={() => canPrev && shift(-1)}
            disabled={!canPrev}
            className="rounded-full bg-white/10 p-2"
            style={{ opacity: canPrev ? 1 : 0.3 }}
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
          >
            <ChevronRight color={palette.textPrimary} size={20} />
          </Pressable>
        </View>

        <View className="flex-row">
          {WEEK.map((d, i) => (
            <View key={i} className="flex-1 items-center py-1">
              <Text className="text-xs font-semibold text-violet-300">{d}</Text>
            </View>
          ))}
        </View>

        <View className="flex-row flex-wrap">
          {cells.map((day, idx) => {
            if (day === null) return <View key={`e${idx}`} style={{ width: `${100 / 7}%` }} />;
            const ekadashi = ekadashiByDay.get(day);
            const isToday =
              today.getFullYear() === cursor.year &&
              today.getMonth() === cursor.month &&
              today.getDate() === day;
            const isSelected = selected?.date === isoOf(cursor.year, cursor.month, day);
            return (
              <Pressable
                key={day}
                style={{ width: `${100 / 7}%` }}
                className="items-center py-1.5"
                disabled={!ekadashi}
                onPress={() => ekadashi && setSelected(ekadashi)}
              >
                <View
                  className={`h-10 w-10 items-center justify-center rounded-full ${
                    ekadashi ? "bg-saffron-500" : ""
                  } ${isSelected ? "border-2 border-white" : ""} ${
                    isToday && !ekadashi ? "border border-violet-300" : ""
                  }`}
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

      {selected ? (
        <Card>
          <Text className="text-xl font-bold text-white">{selected.name} Ekadashi</Text>
          <Text className="mt-0.5 text-sm text-violet-200">{formatLongDate(selected.date)}</Text>
          <Text className="mt-1 text-xs text-violet-300">
            {selected.paksha} Paksha · {selected.month} maas
          </Text>
          <Text className="mt-3 text-sm leading-5 text-violet-100">{selected.significance}</Text>
          <View className="mt-3 flex-row items-center gap-2 rounded-2xl bg-white/5 px-4 py-3">
            <Sunrise color={palette.saffronLight} size={20} />
            <View>
              <Text className="text-xs uppercase tracking-wide text-violet-300">Parana window</Text>
              <Text className="text-sm font-semibold text-white">
                {formatTime12h(selected.parana.start)} – {formatTime12h(selected.parana.end)}
              </Text>
              <Text className="text-xs text-violet-300">
                on {formatLongDate(selected.parana.date)}
              </Text>
            </View>
          </View>
        </Card>
      ) : (
        <Text className="px-1 text-center text-sm text-violet-300">
          Tap a highlighted date to see its Parana timing and significance.
        </Text>
      )}
    </Screen>
  );
}
