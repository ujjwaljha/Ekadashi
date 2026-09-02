import type { NotificationKind } from "@/types";

export const ALARM_CATEGORY = "ekadashi-alarm";
export const SNOOZE_ACTION = "snooze";
export const DISMISS_ACTION = "dismiss";

export type NotificationPayload = {
  kind: NotificationKind;
  ekadashiId: string;
  key?: string;
};

const KINDS = new Set<NotificationKind>(["reminder", "alarm-fasting", "alarm-parana", "test"]);

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function isKind(value: unknown): value is NotificationKind {
  return typeof value === "string" && KINDS.has(value as NotificationKind);
}

/** Parse OS notification `content.data` into a typed payload, or null if invalid. */
export function parseNotificationData(data: unknown): NotificationPayload | null {
  const record = asRecord(data);
  if (!record || !isKind(record.kind)) return null;

  const ekadashiId = typeof record.ekadashiId === "string" ? record.ekadashiId : "";
  if (record.kind !== "test" && ekadashiId.length === 0) return null;

  return {
    kind: record.kind,
    ekadashiId,
    key: typeof record.key === "string" ? record.key : undefined,
  };
}

export function shouldOpenAlarm(payload: NotificationPayload | null): payload is NotificationPayload {
  return payload?.kind === "alarm-fasting" || payload?.kind === "alarm-parana";
}

export function isAlarmAction(actionIdentifier: string): boolean {
  return actionIdentifier === SNOOZE_ACTION || actionIdentifier === DISMISS_ACTION;
}

export type PermissionCopy = {
  title: string;
  detail: string;
  showOpenSettings: boolean;
};

/** Settings copy for the current OS permission + schedule state. */
export function describeNotificationStatus(params: {
  isWeb: boolean;
  granted: boolean;
  canAskAgain: boolean;
  notificationsEnabled: boolean;
  scheduled: number;
}): PermissionCopy {
  if (params.isWeb) {
    return {
      title: "Web preview",
      detail: "Reminders and the persistent alarm schedule on a real iOS or Android install, not here.",
      showOpenSettings: false,
    };
  }
  if (!params.notificationsEnabled) {
    return {
      title: "Reminders off",
      detail: "No notifications are scheduled. Turn reminders on and apply to register them.",
      showOpenSettings: false,
    };
  }
  if (params.granted) {
    const noun = params.scheduled === 1 ? "reminder" : "reminders";
    return {
      title: "Notifications allowed",
      detail: `${params.scheduled} ${noun} scheduled on this device.`,
      showOpenSettings: false,
    };
  }
  if (params.canAskAgain) {
    return {
      title: "Permission needed",
      detail: "Apply & Reschedule will ask for notification access.",
      showOpenSettings: false,
    };
  }
  return {
    title: "Permission denied",
    detail: "Enable notifications in system settings, then apply the schedule again.",
    showOpenSettings: true,
  };
}
