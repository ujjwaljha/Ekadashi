import {
  AlarmClock,
  Bell,
  CalendarRange,
  Check,
  Clock,
  Globe,
  MapPin,
  Play,
  RotateCcw,
  Send,
  Square,
  Volume2,
} from "lucide-react-native";
import { useState } from "react";
import { Platform, Pressable, Switch, Text, View } from "react-native";

import { CalendarPicker } from "@/components/CalendarPicker";
import { CityPicker } from "@/components/CityPicker";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { TimePicker } from "@/components/TimePicker";
import { ALARM_SOUNDS } from "@/constants/alarms";
import { getCalendar, TRADITIONS } from "@/constants/calendars";
import { getCity } from "@/constants/cities";
import { palette } from "@/constants/theme";
import { TIMEZONES } from "@/constants/timezones";
import { startAlarm, stopAlarm } from "@/lib/alarm";
import { getDatasetMeta } from "@/lib/ekadashi";
import { formatTime12h } from "@/lib/format";
import { scheduleReminders, sendTestNotification } from "@/lib/notifications";
import { useSettings } from "@/store/settings";
import type { CalendarId, LeadDay, TraditionId } from "@/types";

const LEAD_OPTIONS: { day: LeadDay; label: string }[] = [
  { day: 0, label: "On the Day" },
  { day: 1, label: "1 Day Before" },
  { day: 2, label: "2 Days Before" },
  { day: 3, label: "3 Days Before" },
  { day: 4, label: "4 Days Before" },
];

const REPEAT_OPTIONS = [0, 1, 2, 3, 4] as const;
const REPEAT_EVERY = [2, 5, 10] as const;

export default function SettingsScreen() {
  const { settings, update, toggleLeadDay, reset } = useSettings();
  const [status, setStatus] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [showCalendars, setShowCalendars] = useState(false);
  const [showCities, setShowCities] = useState(false);
  const isWeb = Platform.OS === "web";
  const meta = getDatasetMeta();
  const calendar = getCalendar(settings.calendarId);
  const city = getCity(settings.cityId);

  const flashStatus = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(null), 4500);
  };

  const applySchedule = async () => {
    if (isWeb) {
      flashStatus("Scheduling runs on a real iOS/Android device. Settings are saved.");
      return;
    }
    const { granted, scheduled } = await scheduleReminders(settings);
    flashStatus(
      granted
        ? `Scheduled ${scheduled} reminder${scheduled === 1 ? "" : "s"}.`
        : "Notification permission was denied."
    );
  };

  const test = async () => {
    if (isWeb) {
      flashStatus("Test notifications require a real device.");
      return;
    }
    const ok = await sendTestNotification(settings);
    flashStatus(ok ? "Test notification sent." : "Permission denied — enable notifications.");
  };

  const togglePreview = async () => {
    if (previewing) {
      await stopAlarm();
      setPreviewing(false);
      return;
    }
    const ok = await startAlarm(settings.alarmSound);
    setPreviewing(ok);
    if (!ok) flashStatus("This sound uses the system default (no in-app preview).");
  };

  const setCalendar = (id: CalendarId) => {
    const next = getCalendar(id);
    const patch: { calendarId: CalendarId; tradition?: TraditionId } = { calendarId: id };
    if (next.defaultTradition !== settings.tradition && (id === "iskcon" || id === "vaishnava" || id === "smarta")) {
      patch.tradition = next.defaultTradition;
    }
    update(patch);
    flashStatus(`${next.name} calendar selected.`);
  };

  const setCity = (id: string) => {
    const next = getCity(id);
    update({ cityId: id, timezone: next.timezone });
    flashStatus(`${next.name} sunrise will be used for Parana.`);
  };

  return (
    <Screen>
      <Text className="mb-1 mt-1 text-xs uppercase tracking-[3px] text-saffron-300">
        Preferences
      </Text>
      <Text className="mb-4 text-3xl font-bold text-white">Settings</Text>

      <Card className="mb-4">
        <SectionTitle
          icon={<CalendarRange color={palette.saffronLight} size={18} />}
          title="Your Calendar"
        />
        <Text className="text-base font-semibold text-white">{calendar.name}</Text>
        <Text className="text-sm text-saffron-200">{calendar.nativeName}</Text>
        <Text className="mt-1 text-xs leading-4 text-violet-300">{calendar.description}</Text>
        <Pressable
          onPress={() => setShowCalendars((v) => !v)}
          className="mt-3 rounded-2xl bg-white/10 py-2.5"
        >
          <Text className="text-center text-sm font-semibold text-saffron-200">
            {showCalendars ? "Hide calendars" : "Change calendar"}
          </Text>
        </Pressable>
        {showCalendars ? (
          <View className="mt-3">
            <CalendarPicker value={settings.calendarId} onChange={setCalendar} />
          </View>
        ) : null}

        <Text className="mb-2 mt-4 text-xs uppercase tracking-wide text-violet-300">
          City (sunrise / Parana)
        </Text>
        <Text className="text-base font-semibold text-white">{city.name}</Text>
        <Text className="text-sm text-saffron-200">{city.region}</Text>
        <Text className="mt-1 text-xs leading-4 text-violet-300">
          {city.usePublishedDates
            ? "Published India/Nepal fasting dates, with Parana from this sunrise."
            : "Local fasting day is calculated when it differs from the India reference."}
        </Text>
        <Pressable
          onPress={() => setShowCities((v) => !v)}
          className="mt-3 rounded-2xl bg-white/10 py-2.5"
        >
          <View className="flex-row items-center justify-center gap-2">
            <MapPin color={palette.saffronLight} size={14} />
            <Text className="text-center text-sm font-semibold text-saffron-200">
              {showCities ? "Hide cities" : "Change city"}
            </Text>
          </View>
        </Pressable>
        {showCities ? (
          <View className="mt-3">
            <CityPicker value={settings.cityId} onChange={setCity} />
          </View>
        ) : null}

        <Text className="mb-2 mt-4 text-xs uppercase tracking-wide text-violet-300">
          Fasting tradition
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {TRADITIONS.map((item) => (
            <Chip
              key={item.id}
              label={item.name}
              active={settings.tradition === item.id}
              onPress={() => update({ tradition: item.id })}
            />
          ))}
        </View>
        <Text className="mt-2 text-xs leading-4 text-violet-400">
          {TRADITIONS.find((t) => t.id === settings.tradition)?.summary}
        </Text>
      </Card>

      <Card className="mb-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Bell color={palette.saffronLight} size={20} />
            <View>
              <Text className="text-base font-semibold text-white">Reminders</Text>
              <Text className="text-xs text-violet-300">Enable Ekadashi notifications</Text>
            </View>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={(v) => update({ notificationsEnabled: v })}
            trackColor={{ true: palette.saffron, false: "#3f3a5a" }}
            thumbColor="#fff"
          />
        </View>
      </Card>

      <Card className="mb-4">
        <SectionTitle icon={<Clock color={palette.saffronLight} size={18} />} title="Advance Reminders" />
        <View className="flex-row flex-wrap gap-2">
          {LEAD_OPTIONS.map(({ day, label }) => (
            <Chip
              key={day}
              label={label}
              active={settings.leadDays.includes(day)}
              onPress={() => toggleLeadDay(day)}
            />
          ))}
        </View>
      </Card>

      <Card className="mb-4">
        <SectionTitle icon={<Clock color={palette.saffronLight} size={18} />} title="Reminder Time" />
        <Text className="mb-1 text-center text-sm text-violet-300">
          Advance reminders fire at {formatTime12h(settings.reminderTime)}
        </Text>
        <TimePicker value={settings.reminderTime} onChange={(t) => update({ reminderTime: t })} />
      </Card>

      <Card className="mb-4">
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <AlarmClock color={palette.saffronLight} size={20} />
            <View className="flex-1 pr-2">
              <Text className="text-base font-semibold text-white">Persistent Alarm</Text>
              <Text className="text-xs text-violet-300">
                Louder, repeating alert on Ekadashi morning and during Parana
              </Text>
            </View>
          </View>
          <Switch
            value={settings.alarmEnabled}
            onValueChange={(v) => update({ alarmEnabled: v })}
            trackColor={{ true: palette.saffron, false: "#3f3a5a" }}
            thumbColor="#fff"
          />
        </View>

        <Text className="mb-1 text-xs uppercase tracking-wide text-violet-300">
          Morning alarm time
        </Text>
        <TimePicker value={settings.alarmTime} onChange={(t) => update({ alarmTime: t })} />

        <Text className="mb-2 mt-3 text-xs uppercase tracking-wide text-violet-300">
          Repeat count (after the first ring)
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {REPEAT_OPTIONS.map((n) => (
            <Chip
              key={n}
              label={n === 0 ? "Once" : `${n} extra`}
              active={settings.alarmRepeatCount === n}
              onPress={() => update({ alarmRepeatCount: n })}
            />
          ))}
        </View>

        <Text className="mb-2 mt-3 text-xs uppercase tracking-wide text-violet-300">
          Repeat every
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {REPEAT_EVERY.map((n) => (
            <Chip
              key={n}
              label={`${n} min`}
              active={settings.alarmRepeatMinutes === n}
              onPress={() => update({ alarmRepeatMinutes: n })}
            />
          ))}
        </View>

        <View className="mt-4 flex-row items-center gap-2">
          <Volume2 color={palette.textMuted} size={16} />
          <Text className="text-xs uppercase tracking-wide text-violet-300">Alarm sound</Text>
        </View>
        <View className="mt-2 flex-row flex-wrap gap-2">
          {ALARM_SOUNDS.map((s) => (
            <Chip
              key={s.id}
              label={s.label}
              active={settings.alarmSound === s.id}
              onPress={() => update({ alarmSound: s.id })}
            />
          ))}
        </View>

        <Pressable
          onPress={togglePreview}
          className="mt-3 flex-row items-center justify-center gap-2 rounded-2xl bg-white/10 py-2.5"
        >
          {previewing ? (
            <Square color={palette.saffronLight} size={16} />
          ) : (
            <Play color={palette.saffronLight} size={16} />
          )}
          <Text className="text-sm font-semibold text-saffron-200">
            {previewing ? "Stop preview" : "Preview sound"}
          </Text>
        </Pressable>
      </Card>

      <Card className="mb-4">
        <SectionTitle icon={<Globe color={palette.saffronLight} size={18} />} title="Timezone Alignment" />
        <View className="flex-row flex-wrap gap-2">
          {TIMEZONES.map((tz) => (
            <Chip
              key={tz.id}
              label={tz.label}
              active={settings.timezone === tz.id}
              onPress={() => update({ timezone: tz.id })}
            />
          ))}
        </View>
        <Text className="mt-2 text-xs text-violet-400">
          Reminders fire at the chosen wall-clock time in this zone. Changing city also aligns
          the zone. Five years of {meta.region} dates stay in the app.
        </Text>
      </Card>

      <View className="gap-2.5">
        <Pressable
          onPress={applySchedule}
          className="flex-row items-center justify-center gap-2 rounded-2xl bg-saffron-500 py-3.5"
        >
          <Check color={palette.inkDeep} size={18} />
          <Text className="text-base font-bold text-indigoink-900">Apply & Reschedule</Text>
        </Pressable>

        <Pressable
          onPress={test}
          className="flex-row items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-3.5"
        >
          <Send color={palette.saffronLight} size={18} />
          <Text className="text-base font-semibold text-saffron-200">Send Test Notification</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            reset();
            flashStatus("Settings reset to defaults.");
          }}
          className="flex-row items-center justify-center gap-2 rounded-2xl py-3"
        >
          <RotateCcw color={palette.textMuted} size={16} />
          <Text className="text-sm text-violet-300">Reset to defaults</Text>
        </Pressable>
      </View>

      {status ? (
        <View className="mt-4 rounded-2xl border border-saffron-400/40 bg-saffron-500/10 px-4 py-3">
          <Text className="text-center text-sm text-saffron-200">{status}</Text>
        </View>
      ) : null}

      {isWeb ? (
        <Text className="mt-4 text-center text-xs text-violet-400">
          Local notifications and alarms run on iOS/Android devices, not the web preview.
        </Text>
      ) : null}

      <Text className="mt-6 text-center text-[11px] leading-4 text-violet-500">{meta.note}</Text>
    </Screen>
  );
}
