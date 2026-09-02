import { Text, View } from "react-native";

import { Card } from "@/components/Card";
import { FadeInView } from "@/components/motion";
import { Screen } from "@/components/Screen";
import { StackBack } from "@/components/StackBack";
import { PRIVACY_SECTIONS, PRIVACY_UPDATED } from "@/constants/legal";
import { fonts, motion, type } from "@/constants/theme";

export default function PrivacyScreen() {
  return (
    <Screen>
      <StackBack />
      <FadeInView>
        <Text style={type.eyebrow} className="mb-1 text-[11px] text-saffron-300">
          Legal
        </Text>
        <Text style={type.display} className="mb-1 text-[34px] text-white">
          Privacy
        </Text>
        <Text className="mb-5 text-xs text-violet-400">Updated {PRIVACY_UPDATED}</Text>
      </FadeInView>

      {PRIVACY_SECTIONS.map((section, index) => (
        <FadeInView key={section.title} delay={motion.staggerMs * (index + 1)}>
          <Card className="mb-3">
            <Text style={{ fontFamily: fonts.sansSemi }} className="text-base text-white">
              {section.title}
            </Text>
            <Text className="mt-2 text-sm leading-5 text-violet-200">{section.body}</Text>
          </Card>
        </FadeInView>
      ))}

      <View className="mt-2 px-1">
        <Text className="text-center text-[11px] leading-4 text-violet-500">
          Host this screen (the /privacy route) or the same text as the App Store and Play Store
          privacy-policy URL.
        </Text>
      </View>
    </Screen>
  );
}
