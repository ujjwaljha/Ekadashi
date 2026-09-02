import { Check, Search, Sparkles } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { Card } from "@/components/Card";
import { CALENDARS, getCalendar, searchCalendars, traditionLabel } from "@/constants/calendars";
import { palette } from "@/constants/theme";
import type { CalendarId } from "@/types";

interface CalendarPickerProps {
  value: CalendarId;
  onChange: (id: CalendarId) => void;
  /** Optional highlight id shown first (e.g. locale suggestion). */
  suggestedId?: CalendarId;
}

export function CalendarPicker({ value, onChange, suggestedId }: CalendarPickerProps) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const found = searchCalendars(query);
    if (!suggestedId || query.trim()) return found;
    const suggested = found.find((c) => c.id === suggestedId);
    const rest = found.filter((c) => c.id !== suggestedId);
    return suggested ? [suggested, ...rest] : found;
  }, [query, suggestedId]);

  return (
    <View>
      <View className="mb-3 flex-row items-center rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
        <Search color={palette.textMuted} size={16} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search Mithila, Bengali, Tamil, ISKCON…"
          placeholderTextColor={palette.textMuted}
          autoCorrect={false}
          autoCapitalize="none"
          className="ml-2 flex-1 py-1 text-base text-white"
          accessibilityLabel="Search calendars"
        />
      </View>

      <View className="gap-2">
        {results.map((calendar) => {
          const active = calendar.id === value;
          const suggested = calendar.id === suggestedId && !query.trim();
          return (
            <Pressable
              key={calendar.id}
              onPress={() => onChange(calendar.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${calendar.name}, ${calendar.region}`}
            >
              <Card className={active ? "border-saffron-400/60 bg-saffron-500/10" : ""}>
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <View className="flex-row flex-wrap items-center gap-2">
                      <Text className="text-base font-bold text-white">{calendar.name}</Text>
                      {calendar.featured ? (
                        <View className="flex-row items-center gap-1 rounded-full bg-saffron-500/20 px-2 py-0.5">
                          <Sparkles color={palette.saffronLight} size={10} />
                          <Text className="text-[10px] font-semibold uppercase text-saffron-200">
                            Featured
                          </Text>
                        </View>
                      ) : null}
                      {suggested ? (
                        <Text className="text-[10px] font-semibold uppercase text-violet-300">
                          Suggested
                        </Text>
                      ) : null}
                    </View>
                    <Text className="mt-0.5 text-sm text-saffron-200">{calendar.nativeName}</Text>
                    <Text className="mt-1 text-xs text-violet-300">{calendar.region}</Text>
                    <Text className="mt-1 text-xs leading-4 text-violet-400">{calendar.description}</Text>
                    <Text className="mt-2 text-[11px] uppercase tracking-wide text-violet-500">
                      {calendar.monthSystem} · {calendar.civilKind} year · default{" "}
                      {traditionLabel(calendar.defaultTradition)}
                    </Text>
                  </View>
                  {active ? (
                    <View className="h-7 w-7 items-center justify-center rounded-full bg-saffron-500">
                      <Check color={palette.inkDeep} size={16} />
                    </View>
                  ) : (
                    <View className="h-7 w-7 rounded-full border border-white/20" />
                  )}
                </View>
              </Card>
            </Pressable>
          );
        })}
        {results.length === 0 ? (
          <Text className="px-2 py-6 text-center text-sm text-violet-300">
            No calendar matches “{query}”. Try Mithila, Tamil, or Vaishnava.
          </Text>
        ) : null}
      </View>

      <Text className="mt-3 text-center text-[11px] text-violet-500">
        {CALENDARS.length} regional calendars · {getCalendar(value).name} selected
      </Text>
    </View>
  );
}
