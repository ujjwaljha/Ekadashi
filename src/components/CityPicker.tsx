import { Check } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Text, View } from "react-native";

import { Card } from "@/components/Card";
import { PressableScale } from "@/components/motion";
import { SearchField } from "@/components/SearchField";
import { CITIES, searchCities } from "@/constants/cities";
import { fonts, palette } from "@/constants/theme";

interface CityPickerProps {
  value: string;
  onChange: (id: string) => void;
  suggestedId?: string;
}

export function CityPicker({ value, onChange, suggestedId }: CityPickerProps) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const found = searchCities(query);
    if (!suggestedId || query.trim()) return found;
    const suggested = found.find((c) => c.id === suggestedId);
    const rest = found.filter((c) => c.id !== suggestedId);
    return suggested ? [suggested, ...rest] : found;
  }, [query, suggestedId]);

  return (
    <View>
      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder="Search Delhi, Darbhanga, New York…"
        accessibilityLabel="Search cities"
      />

      <View className="gap-2">
        {results.map((city) => {
          const active = city.id === value;
          const suggested = city.id === suggestedId && !query.trim();
          return (
            <PressableScale
              key={city.id}
              onPress={() => onChange(city.id)}
              haptic="selection"
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${city.name}, ${city.region}`}
            >
              <Card className={active ? "border-saffron-400/70 bg-saffron-500/10" : ""}>
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <View className="flex-row flex-wrap items-center gap-2">
                      <Text style={{ fontFamily: fonts.sansBold }} className="text-base text-white">
                        {city.name}
                      </Text>
                      {suggested ? (
                        <Text className="text-[10px] font-semibold uppercase text-violet-300">
                          Suggested
                        </Text>
                      ) : null}
                    </View>
                    <Text className="mt-0.5 text-sm text-saffron-200">{city.region}</Text>
                    <Text className="mt-1 text-xs leading-4 text-violet-400">
                      {city.usePublishedDates
                        ? "Uses published India/Nepal dates; Parana from this city's sunrise."
                        : "Calculates the local fasting day from sunrise when it differs from India."}
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
            </PressableScale>
          );
        })}
        {results.length === 0 ? (
          <Text className="px-2 py-6 text-center text-sm text-violet-300">
            No city matches “{query}”. Try Darbhanga, Delhi, or New York.
          </Text>
        ) : null}
      </View>

      <Text className="mt-3 text-center text-[11px] text-violet-500">
        {CITIES.length} cities · sunrise used for Parana
      </Text>
    </View>
  );
}
