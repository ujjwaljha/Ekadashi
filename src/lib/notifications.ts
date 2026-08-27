import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { getAlarmSound } from "@/constants/alarms";
import { getUpcomingEkadashis, parseISODate } from "@/lib/ekadashi";
import type { Settings } from "@/types";

export const REMINDER_CHANNEL = "reminders";
export const ALARM_CHANNEL = "alarm";

const isWeb = Platform.OS === "web";

// Foreground presentation: show a banner + play sound even while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Create the Android notification channels. `reminders` is a normal high-priority
 * channel; `alarm` is a MAX-importance channel with strong vibration that bypasses
 * Do-Not-Disturb so the persistent alarm cannot be easily missed.
 */
export async function ensureAndroidChannels(alarmSoundFile: string | null): Promise<void> {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL, {
    name: "Ekadashi Reminders",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#f97316",
  });

  await Notifications.setNotificationChannelAsync(ALARM_CHANNEL, {
    name: "Ekadashi Alarm",
    importance: Notifications.AndroidImportance.MAX,
    sound: alarmSoundFile ?? undefined,
    vibrationPattern: [0, 500, 500, 500, 500, 500],
    lightColor: "#f97316",
    bypassDnd: true,
    enableVibrate: true,
    audioAttributes: {
      usage: Notifications.AndroidAudioUsage.ALARM,
      contentType: Notifications.AndroidAudioContentType.SONIFICATION,
    },
  });
}

/**
 * Request notification permission (and register the Android channels).
 * Safe to call on first launch; returns whether permission was granted.
 */
export async function registerForNotifications(alarmSoundFile: string | null): Promise<boolean> {
  if (isWeb) {
    console.warn("[notifications] scheduling is not supported on web");
    return false;
  }
  if (!Device.isDevice) {
    console.warn("[notifications] must use a physical device for push/local notifications");
  }

  await ensureAndroidChannels(alarmSoundFile);

  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== "granted") {
    const req = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowSound: true, allowBadge: true },
    });
    status = req.status;
  }
  return status === "granted";
}

/** Build a Date at the given wall-clock time on an ISO calendar date. */
function atTime(isoDate: string, hhmm: string): Date {
  const d = parseISODate(isoDate);
  const [h, m] = hhmm.split(":").map(Number);
  d.setHours(h, m, 0, 0);
  return d;
}

interface ScheduleResult {
  granted: boolean;
  scheduled: number;
}

/**
 * Cancel any existing schedule and (re)schedule all reminders implied by the
 * current settings across every upcoming Ekadashi in the dataset:
 *  - one advance reminder per enabled lead-day at the user's chosen time, and
 *  - when alarm mode is on, a MAX-priority alert on the morning of Ekadashi and
 *    at the start of the Parana (fast-breaking) window.
 * Returns how many notifications were scheduled.
 */
export async function scheduleReminders(settings: Settings): Promise<ScheduleResult> {
  if (isWeb) {
    return { granted: false, scheduled: 0 };
  }

  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!settings.notificationsEnabled) {
    return { granted: true, scheduled: 0 };
  }

  const alarm = getAlarmSound(settings.alarmSound);
  const granted = await registerForNotifications(alarm.notificationSound);
  if (!granted) return { granted: false, scheduled: 0 };

  const now = new Date();
  const upcoming = getUpcomingEkadashis(24, now);
  let scheduled = 0;

  const schedule = async (
    date: Date,
    title: string,
    body: string,
    channelId: string,
    sound: string | true | null
  ) => {
    if (date.getTime() <= now.getTime()) return;
    const trigger: Notifications.DateTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      ...(Platform.OS === "android" ? { channelId } : {}),
    };
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: sound ?? undefined,
        ...(channelId === ALARM_CHANNEL
          ? {
              priority: Notifications.AndroidNotificationPriority.MAX,
              interruptionLevel: "timeSensitive" as const,
            }
          : {}),
      },
      trigger,
    });
    scheduled += 1;
  };

  for (const e of upcoming) {
    // Advance reminders at the chosen time of day.
    for (const lead of settings.leadDays) {
      const fireDate = atTime(e.date, settings.reminderTime);
      fireDate.setDate(fireDate.getDate() - lead);
      const when =
        lead === 0 ? "is today" : `is in ${lead} day${lead > 1 ? "s" : ""}`;
      await schedule(
        fireDate,
        `${e.name} Ekadashi ${lead === 0 ? "Today" : "Approaching"}`,
        `${e.name} Ekadashi ${when}. Parana: ${e.parana.start}–${e.parana.end} on ${e.parana.date}.`,
        REMINDER_CHANNEL,
        true
      );
    }

    // Persistent alarm: morning of Ekadashi + start of the Parana window.
    if (settings.alarmEnabled) {
      await schedule(
        atTime(e.date, "06:00"),
        `⏰ ${e.name} Ekadashi`,
        `Today is ${e.name} Ekadashi. Begin your fast and observance.`,
        ALARM_CHANNEL,
        alarm.notificationSound ?? true
      );
      await schedule(
        atTime(e.parana.date, e.parana.start),
        `⏰ Parana Time — Break Your Fast`,
        `The Parana window for ${e.name} Ekadashi is open (${e.parana.start}–${e.parana.end}).`,
        ALARM_CHANNEL,
        alarm.notificationSound ?? true
      );
    }
  }

  return { granted: true, scheduled };
}

/** Fire an immediate notification so users can preview their settings. */
export async function sendTestNotification(settings: Settings): Promise<boolean> {
  if (isWeb) return false;
  const alarm = getAlarmSound(settings.alarmSound);
  const granted = await registerForNotifications(alarm.notificationSound);
  if (!granted) return false;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🔔 Ekadashi Reminder (Test)",
      body: "This is how your Ekadashi reminders will look.",
      sound: settings.alarmEnabled ? alarm.notificationSound ?? true : true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
      ...(Platform.OS === "android"
        ? { channelId: settings.alarmEnabled ? ALARM_CHANNEL : REMINDER_CHANNEL }
        : {}),
    },
  });
  return true;
}

export async function getScheduledCount(): Promise<number> {
  if (isWeb) return 0;
  const all = await Notifications.getAllScheduledNotificationsAsync();
  return all.length;
}
