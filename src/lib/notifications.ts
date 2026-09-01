import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { getAlarmSound } from "@/constants/alarms";
import { getUpcomingEkadashis } from "@/lib/ekadashi";
import { buildNotificationPlan } from "@/lib/schedule";
import type { NotificationKind, Settings } from "@/types";

export const REMINDER_CHANNEL = "reminders";
export const ALARM_CHANNEL = "alarm";

const isWeb = Platform.OS === "web";

// Show a banner + play sound even while the app is open so the persistent
// alarm can take over immediately from the received-notification listener.
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const kind = notification.request.content.data?.kind as NotificationKind | undefined;
    const isAlarm = kind === "alarm-fasting" || kind === "alarm-parana";
    return {
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowAlert: true,
      priority: isAlarm
        ? Notifications.AndroidNotificationPriority.MAX
        : Notifications.AndroidNotificationPriority.HIGH,
    };
  },
});

/**
 * Create the Android notification channels. `reminders` is a normal
 * high-priority channel; `alarm` is MAX-importance with alarm audio usage
 * and Do-Not-Disturb bypass so the persistent alarm is hard to miss.
 */
export async function ensureAndroidChannels(alarmSoundFile: string | null): Promise<void> {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL, {
    name: "Ekadashi Reminders",
    description: "Advance reminders for upcoming Ekadashi fasting days.",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#f97316",
    enableVibrate: true,
  });

  await Notifications.setNotificationChannelAsync(ALARM_CHANNEL, {
    name: "Ekadashi Alarm",
    description: "High-priority repeating alarm on Ekadashi morning and during Parana.",
    importance: Notifications.AndroidImportance.MAX,
    sound: alarmSoundFile ?? undefined,
    vibrationPattern: [0, 500, 500, 500, 500, 500],
    lightColor: "#f97316",
    bypassDnd: true,
    enableVibrate: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    audioAttributes: {
      usage: Notifications.AndroidAudioUsage.ALARM,
      contentType: Notifications.AndroidAudioContentType.SONIFICATION,
    },
  });
}

export interface PermissionState {
  granted: boolean;
  canAskAgain: boolean;
  status: Notifications.PermissionStatus;
}

/** Read the current OS permission without prompting. */
export async function getNotificationPermission(): Promise<PermissionState> {
  if (isWeb) {
    return { granted: false, canAskAgain: false, status: Notifications.PermissionStatus.DENIED };
  }
  const current = await Notifications.getPermissionsAsync();
  return {
    granted: current.status === "granted",
    canAskAgain: current.canAskAgain,
    status: current.status,
  };
}

/**
 * Request notification permission (and register Android channels).
 * Safe to call on first launch; returns whether permission was granted.
 */
export async function registerForNotifications(alarmSoundFile: string | null): Promise<boolean> {
  if (isWeb) {
    console.warn("[notifications] scheduling is not supported on web");
    return false;
  }
  if (!Device.isDevice) {
    console.warn("[notifications] a physical device is required for reliable local notifications");
  }

  await ensureAndroidChannels(alarmSoundFile);

  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== "granted") {
    const req = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowSound: true,
        allowBadge: true,
      },
    });
    status = req.status;
  }
  return status === "granted";
}

export interface ScheduleResult {
  granted: boolean;
  scheduled: number;
}

/**
 * Cancel any existing schedule and (re)schedule every reminder implied by the
 * current settings. Uses the pure planner so iOS's 64-notification budget is
 * honoured and timezone alignment is applied.
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
  const upcoming = getUpcomingEkadashis(12, now, settings.timezone);
  const plan = buildNotificationPlan({ now, settings, upcoming });

  for (const item of plan) {
    const isAlarm = item.kind === "alarm-fasting" || item.kind === "alarm-parana";
    const channelId = isAlarm ? ALARM_CHANNEL : REMINDER_CHANNEL;
    const trigger: Notifications.DateTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: item.fireAt,
      ...(Platform.OS === "android" ? { channelId } : {}),
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: item.title,
        body: item.body,
        sound: isAlarm ? (alarm.notificationSound ?? true) : true,
        data: {
          kind: item.kind,
          ekadashiId: item.ekadashiId,
          key: item.key,
        },
        ...(isAlarm
          ? {
              priority: Notifications.AndroidNotificationPriority.MAX,
              interruptionLevel: "timeSensitive" as const,
              sticky: true,
            }
          : {}),
      },
      trigger,
    });
  }

  return { granted: true, scheduled: plan.length };
}

/** Fire an immediate notification so users can preview their settings. */
export async function sendTestNotification(settings: Settings): Promise<boolean> {
  if (isWeb) return false;
  const alarm = getAlarmSound(settings.alarmSound);
  const granted = await registerForNotifications(alarm.notificationSound);
  if (!granted) return false;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Ekadashi Reminder (Test)",
      body: "This is how your Ekadashi reminders will look and sound.",
      sound: settings.alarmEnabled ? (alarm.notificationSound ?? true) : true,
      data: { kind: "test" },
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

/** Schedule a single snooze alarm `minutes` from now. */
export async function scheduleSnooze(
  settings: Settings,
  minutes: number,
  title: string,
  body: string,
  kind: NotificationKind,
  ekadashiId: string
): Promise<boolean> {
  if (isWeb) return false;
  const alarm = getAlarmSound(settings.alarmSound);
  const granted = await registerForNotifications(alarm.notificationSound);
  if (!granted) return false;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: alarm.notificationSound ?? true,
      data: { kind, ekadashiId, key: `snooze:${ekadashiId}` },
      priority: Notifications.AndroidNotificationPriority.MAX,
      interruptionLevel: "timeSensitive" as const,
      sticky: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(30, minutes * 60),
      ...(Platform.OS === "android" ? { channelId: ALARM_CHANNEL } : {}),
    },
  });
  return true;
}
