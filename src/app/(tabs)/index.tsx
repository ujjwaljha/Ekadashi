import { LinearGradient } from "expo-linear-gradient";
import { BellRing, MoonStar, Sunrise } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";

import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { accentGradient, palette } from "@/constants/theme";
import { getNextEkadashi, getUpcomingEkadashis, daysUntil } from "@/lib/ekadashi";
import { countdownLabel, formatLongDate, formatShortDate, formatTime12h } from "@/lib/format";
import { useSettings } from "@/store/settings";

export default function Dashboard() {
  const { settings } = useSettings();
  // A ticking clock so the "today" line and countdown stay fresh.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const next = useMemo(() => getNextEkadashi(now), [now]);
  const upcoming = useMemo(() => getUpcomingEkadashis(5, now).slice(next ? 1 : 0), [now, next]);

  const todayLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const clock = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <Screen>
      <View className="mb-5 mt-1">
        <Text className="text-xs uppercase tracking-[3px] text-saffron-300">
          Ekadashi Reminder
        </Text>
        <Text className="mt-1 text-3xl font-bold text-white">Namaste 🙏</Text>
        <Text className="mt-1 text-sm text-violet-300">
          {todayLabel} · {clock}
        </Text>
      </View>

      {next ? (
        <LinearGradient
          colors={accentGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 28, padding: 22, marginBottom: 20 }}
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold uppercase tracking-widest text-white/80">
              Next Ekadashi
            </Text>
            <View className="rounded-full bg-black/25 px-3 py-1">
              <Text className="text-xs font-bold text-white">
                {countdownLabel(daysUntil(next.date, now))}
              </Text>
            </View>
          </View>

          <Text className="mt-2 text-3xl font-extrabold text-white">{next.name}</Text>
          <Text className="text-base text-white/90">{formatLongDate(next.date)}</Text>

          <View className="mt-2 flex-row items-center gap-2">
            <MoonStar color="#fff" size={16} />
            <Text className="text-sm text-white/90">
              {next.paksha} Paksha · {next.month} maas
            </Text>
          </View>

          <Text className="mt-3 text-sm leading-5 text-white/90">{next.significance}</Text>

          <View className="mt-4 flex-row items-center gap-2 rounded-2xl bg-black/20 px-4 py-3">
            <Sunrise color="#fff" size={20} />
            <View>
              <Text className="text-xs uppercase tracking-wide text-white/70">
                Parana (break fast)
              </Text>
              <Text className="text-sm font-semibold text-white">
                {formatTime12h(next.parana.start)} – {formatTime12h(next.parana.end)}
              </Text>
              <Text className="text-xs text-white/80">on {formatLongDate(next.parana.date)}</Text>
            </View>
          </View>
        </LinearGradient>
      ) : (
        <Card className="mb-5">
          <Text className="text-white">No upcoming Ekadashi in the dataset.</Text>
        </Card>
      )}

      <View className="mb-3 flex-row items-center gap-2">
        <BellRing color={palette.saffronLight} size={18} />
        <Text className="text-sm text-violet-200">
          {settings.notificationsEnabled
            ? `Reminders on · ${settings.leadDays.length} lead-time${
                settings.leadDays.length === 1 ? "" : "s"
              } · ${formatTime12h(settings.reminderTime)}`
            : "Reminders are turned off"}
          {settings.alarmEnabled ? " · Alarm mode" : ""}
        </Text>
      </View>

      <Text className="mb-2 mt-3 text-lg font-bold text-white">Upcoming</Text>
      <View className="gap-2.5">
        {upcoming.map((e) => (
          <Card key={e.id} className="flex-row items-center">
            <View className="w-14">
              <Text className="text-lg font-bold text-saffron-300">{formatShortDate(e.date)}</Text>
              <Text className="text-[11px] text-violet-300">{e.paksha}</Text>
            </View>
            <View className="flex-1 pl-1">
              <Text className="text-base font-semibold text-white">{e.name} Ekadashi</Text>
              <Text className="text-xs text-violet-300" numberOfLines={1}>
                Parana {formatTime12h(e.parana.start)}–{formatTime12h(e.parana.end)}
              </Text>
            </View>
            <Text className="text-xs font-medium text-violet-200">
              {countdownLabel(daysUntil(e.date, now))}
            </Text>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
