import { MoonStar, Sunrise } from "lucide-react-native";
import { Text, View } from "react-native";

import { getCalendar, traditionLabel } from "@/constants/calendars";
import { palette } from "@/constants/theme";
import { formatLongDate, formatTime12h } from "@/lib/format";
import { formatPanchangLong } from "@/lib/panchang";
import type { Ekadashi } from "@/types";

export function EkadashiDetail({ item }: { item: Ekadashi }) {
  const calendar = getCalendar(item.calendarId);
  return (
    <View>
      <Text className="text-xl font-bold text-white">{item.name} Ekadashi</Text>
      <Text className="mt-0.5 text-sm text-violet-200">{formatLongDate(item.date)}</Text>
      <Text className="mt-1 text-sm text-saffron-200">
        {formatPanchangLong(item.date, item.calendarId)}
      </Text>
      <View className="mt-1 flex-row items-center gap-1.5">
        <MoonStar color={palette.indigoLight} size={14} />
        <Text className="text-xs text-violet-300">
          {item.paksha} Paksha · {item.month}
          {item.adhika ? " · Adhika masa" : ""}
        </Text>
      </View>
      <Text className="mt-1 text-[11px] uppercase tracking-wide text-violet-500">
        {calendar.name} · {traditionLabel(item.tradition)}
        {item.localAdjusted ? " · local sunrise date" : item.source === "calculated" ? " · calculated" : ""}
      </Text>
      <Text className="mt-3 text-sm leading-5 text-violet-100">{item.significance}</Text>
      {item.otherTraditionDate ? (
        <Text className="mt-2 text-xs leading-4 text-saffron-200/90">
          {traditionLabel(item.otherTraditionDate.tradition)} observes this fast on{" "}
          {formatLongDate(item.otherTraditionDate.date)}.
        </Text>
      ) : null}
      <View className="mt-3 flex-row items-center gap-2 rounded-2xl bg-white/5 px-4 py-3">
        <Sunrise color={palette.saffronLight} size={20} />
        <View>
          <Text className="text-xs uppercase tracking-wide text-violet-300">Parana window</Text>
          <Text className="text-sm font-semibold text-white">
            {formatTime12h(item.parana.start)} – {formatTime12h(item.parana.end)}
          </Text>
          <Text className="text-xs text-violet-300">on {formatLongDate(item.parana.date)}</Text>
          <Text className="text-[11px] text-violet-400">
            {formatPanchangLong(item.parana.date, item.calendarId)}
          </Text>
          <Text className="text-[11px] text-violet-500">Parana from city sunrise</Text>
        </View>
      </View>
    </View>
  );
}
