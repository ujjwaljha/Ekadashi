import { LinearGradient } from "expo-linear-gradient";
import { BellRing, MoonStar, Sparkles, Sunrise } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";

import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { getCalendar, traditionLabel } from "@/constants/calendars";
import { getCity } from "@/constants/cities";
import { accentGradient, palette, paranaGradient } from "@/constants/theme";
import { getTimezoneLabel } from "@/constants/timezones";
import {
  daysUntil,
  getNextEkadashi,
  getObservance,
  getUpcomingEkadashis,
  queryFromSettings,
} from "@/lib/ekadashi";
import { countdownLabel, formatLongDate, formatShortDate, formatTime12h, greetingForHour } from "@/lib/format";
import { formatPanchangLong } from "@/lib/panchang";
import { getZonedParts, todayISO } from "@/lib/timezone";
import { useSettings } from "@/store/settings";

export default function Dashboard() {
  const { settings } = useSettings();
  const [now, setNow] = useState(() => new Date());
  const query = useMemo(() => queryFromSettings(settings), [settings]);
  const calendar = getCalendar(settings.calendarId);
  const city = getCity(settings.cityId);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);

  const tz = settings.timezone;
  const parts = useMemo(() => getZonedParts(now, tz), [now, tz]);
  const next = useMemo(() => getNextEkadashi(now, tz, query), [now, tz, query]);
  const observance = useMemo(() => getObservance(now, tz, query), [now, tz, query]);
  const upcoming = useMemo(() => {
    const list = getUpcomingEkadashis(6, now, tz, query);
    return observance.kind === "fasting" ? list.slice(1) : list.slice(next ? 1 : 0);
  }, [now, tz, query, next, observance.kind]);

  const today = todayISO(now, tz);
  const todayLabel = new Date(parts.year, parts.month - 1, parts.day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const clock = `${((parts.hour + 11) % 12) + 1}:${String(parts.minute).padStart(2, "0")} ${
    parts.hour >= 12 ? "PM" : "AM"
  }`;

  return (
    <Screen>
      <View className="mb-5 mt-1">
        <Text className="text-xs uppercase tracking-[3px] text-saffron-300">Ekadashi Reminder</Text>
        <Text className="mt-1 text-3xl font-bold text-white">
          {greetingForHour(parts.hour)} 🙏
        </Text>
        <Text className="mt-1 text-sm text-violet-300">
          {todayLabel} · {clock}
        </Text>
        <Text className="mt-1 text-sm text-saffron-200">{formatPanchangLong(today, settings.calendarId)}</Text>
        <Text className="mt-0.5 text-xs text-violet-400">
          {calendar.name} · {traditionLabel(settings.tradition)} · {city.name} ·{" "}
          {getTimezoneLabel(settings.timezone)}
        </Text>
      </View>

      {observance.kind === "fasting" && observance.ekadashi ? (
        <HeroCard
          eyebrow="Fasting today"
          name={observance.ekadashi.name}
          dateLabel={formatLongDate(observance.ekadashi.date)}
          hinduLabel={formatPanchangLong(observance.ekadashi.date, settings.calendarId)}
          paksha={`${observance.ekadashi.paksha} Paksha · ${observance.ekadashi.month}`}
          significance={observance.ekadashi.significance}
          paranaStart={observance.ekadashi.parana.start}
          paranaEnd={observance.ekadashi.parana.end}
          paranaDate={observance.ekadashi.parana.date}
          calendarId={settings.calendarId}
          otherNote={
            observance.ekadashi.otherTraditionDate
              ? `${traditionLabel(observance.ekadashi.otherTraditionDate.tradition)} observes ${formatLongDate(observance.ekadashi.otherTraditionDate.date)}`
              : undefined
          }
          badge="Observe"
          colors={[...accentGradient]}
        />
      ) : null}

      {observance.kind === "parana" && observance.ekadashi ? (
        <HeroCard
          eyebrow="Parana today"
          name={observance.ekadashi.name}
          dateLabel={`Break fast for ${observance.ekadashi.name}`}
          hinduLabel={formatPanchangLong(observance.ekadashi.parana.date, settings.calendarId)}
          paksha={`${observance.ekadashi.paksha} Paksha · ${observance.ekadashi.month}`}
          significance={observance.ekadashi.significance}
          paranaStart={observance.ekadashi.parana.start}
          paranaEnd={observance.ekadashi.parana.end}
          paranaDate={observance.ekadashi.parana.date}
          calendarId={settings.calendarId}
          badge="Break fast"
          colors={[...paranaGradient]}
        />
      ) : null}

      {observance.kind === "none" && next ? (
        <HeroCard
          eyebrow="Next Ekadashi"
          name={next.name}
          dateLabel={formatLongDate(next.date)}
          hinduLabel={formatPanchangLong(next.date, settings.calendarId)}
          paksha={`${next.paksha} Paksha · ${next.month}`}
          significance={next.significance}
          paranaStart={next.parana.start}
          paranaEnd={next.parana.end}
          paranaDate={next.parana.date}
          calendarId={settings.calendarId}
          otherNote={
            next.otherTraditionDate
              ? `${traditionLabel(next.otherTraditionDate.tradition)} observes ${formatLongDate(next.otherTraditionDate.date)}`
              : undefined
          }
          badge={countdownLabel(daysUntil(next.date, now, tz))}
          colors={[...accentGradient]}
        />
      ) : null}

      {!next && observance.kind === "none" ? (
        <Card className="mb-5">
          <Text className="text-white">No upcoming Ekadashi remains in the 2026–2030 dataset.</Text>
        </Card>
      ) : null}

      <View className="mb-3 flex-row items-center gap-2">
        <BellRing color={palette.saffronLight} size={18} />
        <Text className="flex-1 text-sm text-violet-200">
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
              <Text className="text-xs text-saffron-200/90" numberOfLines={1}>
                {formatPanchangLong(e.date, settings.calendarId)}
              </Text>
              <Text className="text-xs text-violet-300" numberOfLines={1}>
                Parana {formatTime12h(e.parana.start)}–{formatTime12h(e.parana.end)}
              </Text>
            </View>
            <Text className="text-xs font-medium text-violet-200">
              {countdownLabel(daysUntil(e.date, now, tz))}
            </Text>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

function HeroCard({
  eyebrow,
  name,
  dateLabel,
  hinduLabel,
  paksha,
  significance,
  paranaStart,
  paranaEnd,
  paranaDate,
  calendarId,
  otherNote,
  badge,
  colors,
}: {
  eyebrow: string;
  name: string;
  dateLabel: string;
  hinduLabel: string;
  paksha: string;
  significance: string;
  paranaStart: string;
  paranaEnd: string;
  paranaDate: string;
  calendarId: import("@/types").CalendarId;
  otherNote?: string;
  badge: string;
  colors: readonly [string, string, ...string[]];
}) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 28, padding: 22, marginBottom: 20 }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <Sparkles color="#fff" size={14} />
          <Text className="text-xs font-semibold uppercase tracking-widest text-white/80">
            {eyebrow}
          </Text>
        </View>
        <View className="rounded-full bg-black/25 px-3 py-1">
          <Text className="text-xs font-bold text-white">{badge}</Text>
        </View>
      </View>

      <Text className="mt-2 text-3xl font-extrabold text-white">{name}</Text>
      <Text className="text-base text-white/90">{dateLabel}</Text>
      <Text className="text-sm text-white/80">{hinduLabel}</Text>

      <View className="mt-2 flex-row items-center gap-2">
        <MoonStar color="#fff" size={16} />
        <Text className="text-sm text-white/90">{paksha}</Text>
      </View>

      <Text className="mt-3 text-sm leading-5 text-white/90">{significance}</Text>
      {otherNote ? <Text className="mt-2 text-xs text-white/80">{otherNote}</Text> : null}

      <View className="mt-4 flex-row items-center gap-2 rounded-2xl bg-black/20 px-4 py-3">
        <Sunrise color="#fff" size={20} />
        <View>
          <Text className="text-xs uppercase tracking-wide text-white/70">Parana (break fast)</Text>
          <Text className="text-sm font-semibold text-white">
            {formatTime12h(paranaStart)} – {formatTime12h(paranaEnd)}
          </Text>
          <Text className="text-xs text-white/80">on {formatLongDate(paranaDate)}</Text>
          <Text className="text-[11px] text-white/70">{formatPanchangLong(paranaDate, calendarId)}</Text>
          <Text className="text-[11px] text-white/70">Window follows local sunrise</Text>
        </View>
      </View>
    </LinearGradient>
  );
}
