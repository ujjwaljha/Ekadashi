import {
  AlarmClock,
  Bell,
  Check,
  Clock,
  Globe,
  Play,
  RotateCcw,
  Send,
  Square,
  Volume2,
} from "lucide-react-native";
import { useState } from "react";
import { Platform, Pressable, Switch, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { TimePicker } from "@/components/TimePicker";
import { ALARM_SOUNDS } from "@/constants/alarms";
import { palette } from "@/constants/theme";
import { startAlarm, stopAlarm } from "@/lib/alarm";
import { formatTime12h } from "@/lib/format";
import { scheduleReminders, sendTestNotification } from "@/lib/notifications";
import { useSettings } from "@/store/settings";
import type { LeadDay } from "@/types";

const LEAD_OPTIONS: { day: LeadDay; label: string }[] = [
  { day: 0, label: "On the Day" },
  { day: 1, label: "1 Day Before" },
  { day: 2, label: "2 Days Before" },
  { day: 3, label: "3 Days Before" },
  { day: 4, label: "4 Days Before" },
];

const TIMEZONES = [
  { id: "device", label: "Device" },
  { id: "Asia/Kolkata", label: "India (IST)" },
  { id: "America/New_York", label: "New York" },
  { id: "Europe/London", label: "London" },
  { id: "America/Los_Angeles", label: "Los Angeles" },
  { id: "Australia/Sydney", label: "Sydney" },
];

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <View className="mb-3 flex-row items-center gap-2">
      {icon}
      <Text className="text-base font-bold text-white">{title}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const { settings, update, toggleLeadDay, reset } = useSettings();
  const [status, setStatus] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);

  const isWeb = Platform.OS === "web";

  const flashStatus = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(null), 4000);
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
    if (!ok) flashStatus("This sound uses the system default (no preview).");
  };

  return (
    <Screen>
      <Text className="mb-1 mt-1 text-xs uppercase tracking-[3px] text-saffron-300">
        Preferences
      </Text>
      <Text className="mb-4 text-3xl font-bold text-white">Settings</Text>

      {/* Master toggle */}
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

      {/* Lead times */}
      <Card className="mb-4">
        <SectionTitle
          icon={<Clock color={palette.saffronLight} size={18} />}
          title="Advance Reminders"
        />
        <View className="flex-row flex-wrap gap-2">
          {LEAD_OPTIONS.map(({ day, label }) => {
            const active = settings.leadDays.includes(day);
            return (
              <Pressable
                key={day}
                onPress={() => toggleLeadDay(day)}
                className={`flex-row items-center gap-1.5 rounded-full border px-3.5 py-2 ${
                  active
                    ? "border-saffron-400 bg-saffron-500/20"
                    : "border-white/15 bg-white/5"
                }`}
              >
                {active && <Check color={palette.saffron} size={14} />}
                <Text className={active ? "text-sm text-saffron-200" : "text-sm text-violet-200"}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* Reminder time */}
      <Card className="mb-4">
        <SectionTitle
          icon={<Clock color={palette.saffronLight} size={18} />}
          title="Reminder Time"
        />
        <Text className="mb-1 text-center text-sm text-violet-300">
          Advance reminders fire at {formatTime12h(settings.reminderTime)}
        </Text>
        <TimePicker value={settings.reminderTime} onChange={(t) => update({ reminderTime: t })} />
      </Card>

      {/* Alarm mode */}
      <Card className="mb-4">
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <AlarmClock color={palette.saffronLight} size={20} />
            <View>
              <Text className="text-base font-semibold text-white">Persistent Alarm</Text>
              <Text className="text-xs text-violet-300">
                Louder, high-priority alert that repeats
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

        <View className="flex-row items-center gap-2">
          <Volume2 color={palette.textMuted} size={16} />
          <Text className="text-xs uppercase tracking-wide text-violet-300">Alarm sound</Text>
        </View>
        <View className="mt-2 flex-row flex-wrap gap-2">
          {ALARM_SOUNDS.map((s) => {
            const active = settings.alarmSound === s.id;
            return (
              <Pressable
                key={s.id}
                onPress={() => update({ alarmSound: s.id })}
                className={`rounded-full border px-3.5 py-2 ${
                  active ? "border-saffron-400 bg-saffron-500/20" : "border-white/15 bg-white/5"
                }`}
              >
                <Text className={active ? "text-sm text-saffron-200" : "text-sm text-violet-200"}>
                  {s.label}
                </Text>
              </Pressable>
            );
          })}
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

      {/* Timezone */}
      <Card className="mb-4">
        <SectionTitle
          icon={<Globe color={palette.saffronLight} size={18} />}
          title="Timezone Alignment"
        />
        <View className="flex-row flex-wrap gap-2">
          {TIMEZONES.map((tz) => {
            const active = settings.timezone === tz.id;
            return (
              <Pressable
                key={tz.id}
                onPress={() => update({ timezone: tz.id })}
                className={`rounded-full border px-3.5 py-2 ${
                  active ? "border-saffron-400 bg-saffron-500/20" : "border-white/15 bg-white/5"
                }`}
              >
                <Text className={active ? "text-sm text-saffron-200" : "text-sm text-violet-200"}>
                  {tz.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text className="mt-2 text-xs text-violet-400">
          "Device" follows your phone's clock. Parana times are shown in local time.
        </Text>
      </Card>

      {/* Actions */}
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

      {status && (
        <View className="mt-4 rounded-2xl border border-saffron-400/40 bg-saffron-500/10 px-4 py-3">
          <Text className="text-center text-sm text-saffron-200">{status}</Text>
        </View>
      )}

      {isWeb && (
        <Text className="mt-4 text-center text-xs text-violet-400">
          Note: local notifications & alarms run on iOS/Android devices, not the web preview.
        </Text>
      )}
    </Screen>
  );
}
