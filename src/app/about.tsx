import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Card } from "@/components/Card";
import { FadeInView } from "@/components/motion";
import { GhostButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { StackBack } from "@/components/StackBack";
import { fonts, type } from "@/constants/theme";
import { getAppVersion, getBuildLabel } from "@/lib/appInfo";
import { getDatasetMeta } from "@/lib/ekadashi";

export default function AboutScreen() {
  const router = useRouter();
  const meta = getDatasetMeta();

  return (
    <Screen>
      <StackBack />
      <FadeInView>
        <Text style={type.eyebrow} className="mb-1 text-[11px] text-saffron-300">
          Ekadashi Reminder
        </Text>
        <Text style={type.display} className="mb-5 text-[34px] text-white">
          About
        </Text>
      </FadeInView>

      <FadeInView delay={60}>
        <Card className="mb-3">
          <Text style={{ fontFamily: fonts.sansBold }} className="text-lg text-white">
            Version {getAppVersion()}
          </Text>
          <Text className="mt-1 text-sm text-saffron-200">{getBuildLabel()}</Text>
          <Text className="mt-3 text-sm leading-5 text-violet-200">
            A local calendar and alarm for Ekadashi fasting days and Parana windows, labeled in your
            regional panchang.
          </Text>
        </Card>
      </FadeInView>

      <FadeInView delay={110}>
        <Card className="mb-3">
          <Text style={{ fontFamily: fonts.sansSemi }} className="text-base text-white">
            Dates in this install
          </Text>
          <Text className="mt-2 text-sm leading-5 text-violet-200">{meta.note}</Text>
          <Text className="mt-2 text-xs text-violet-400">{meta.region}</Text>
        </Card>
      </FadeInView>

      <FadeInView delay={160}>
        <Card className="mb-3">
          <Text style={{ fontFamily: fonts.sansSemi }} className="text-base text-white">
            Installs and sounds
          </Text>
          <Text className="mt-2 text-sm leading-5 text-violet-200">
            Custom temple-bell and conch sounds need a development or production build (EAS). Expo Go
            can preview the UI; it cannot ship those notification sounds. Reminders are local — they
            do not run in the web preview.
          </Text>
        </Card>
      </FadeInView>

      <GhostButton label="Privacy policy" onPress={() => router.push("/privacy")} />

      <View className="mt-6 px-1">
        <Text className="text-center text-[11px] leading-4 text-violet-500">
          Confirm Parana with a local panchang before breaking the fast.
        </Text>
      </View>
    </Screen>
  );
}
