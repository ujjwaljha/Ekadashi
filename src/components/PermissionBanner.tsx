import { BellOff } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Linking, Platform, Pressable, Text, View } from "react-native";

import { palette } from "@/constants/theme";
import { getNotificationPermission } from "@/lib/notifications";

/**
 * Shown when reminders or the alarm are on but the OS has denied notification
 * access. Tapping opens system Settings — we cannot re-prompt after a denial.
 */
export function PermissionBanner({ active }: { active: boolean }) {
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web" || !active) {
      setDenied(false);
      return;
    }
    let cancelled = false;
    getNotificationPermission()
      .then((p) => {
        if (!cancelled) setDenied(!p.granted);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [active]);

  if (Platform.OS === "web" || !active || !denied) return null;

  return (
    <View className="mb-4 rounded-3xl border border-saffron-400/40 bg-saffron-500/10 p-4">
      <View className="flex-row items-start gap-2">
        <BellOff color={palette.saffronLight} size={18} />
        <View className="flex-1">
          <Text className="text-sm font-semibold text-saffron-200">Notifications are blocked</Text>
          <Text className="mt-1 text-xs leading-4 text-violet-200">
            Reminders and the persistent alarm need notification access. Enable them in system
            Settings, then return to this app.
          </Text>
          <Pressable
            onPress={() => Linking.openSettings()}
            className="mt-3 self-start rounded-full bg-saffron-500 px-3.5 py-1.5"
          >
            <Text className="text-xs font-bold text-indigoink-900">Open Settings</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
