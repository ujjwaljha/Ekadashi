import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { StackBack } from "@/components/StackBack";
import { getAppVersion, getBuildLabel } from "@/lib/appInfo";
import { getDatasetMeta } from "@/lib/ekadashi";

export default function AboutScreen() {
  const router = useRouter();
  const meta = getDatasetMeta();

  return (
    <Screen>
      <StackBack />
      <Text className="mb-1 text-xs uppercase tracking-[3px] text-saffron-300">Ekadashi Reminder</Text>
      <Text className="mb-5 text-3xl font-bold text-white">About</Text>

      <Card className="mb-3">
        <Text className="text-lg font-semibold text-white">Version {getAppVersion()}</Text>
        <Text className="mt-1 text-sm text-saffron-200">{getBuildLabel()}</Text>
        <Text className="mt-3 text-sm leading-5 text-violet-200">
          A local calendar and alarm for Ekadashi fasting days and Parana windows, labeled in your
          regional panchang.
        </Text>
      </Card>

      <Card className="mb-3">
        <Text className="text-base font-semibold text-white">Dates in this install</Text>
        <Text className="mt-2 text-sm leading-5 text-violet-200">{meta.note}</Text>
        <Text className="mt-2 text-xs text-violet-400">{meta.region}</Text>
      </Card>

      <Card className="mb-3">
        <Text className="text-base font-semibold text-white">Installs and sounds</Text>
        <Text className="mt-2 text-sm leading-5 text-violet-200">
          Custom temple-bell and conch sounds need a development or production build (EAS). Expo Go
          can preview the UI; it cannot ship those notification sounds. Reminders are local — they
          do not run in the web preview.
        </Text>
      </Card>

      <Pressable
        onPress={() => router.push("/privacy")}
        className="rounded-2xl border border-white/15 bg-white/5 py-3.5"
      >
        <Text className="text-center text-base font-semibold text-saffron-200">Privacy policy</Text>
      </Pressable>

      <View className="mt-6 px-1">
        <Text className="text-center text-[11px] leading-4 text-violet-500">
          Confirm Parana with a local panchang before breaking the fast.
        </Text>
      </View>
    </Screen>
  );
}
