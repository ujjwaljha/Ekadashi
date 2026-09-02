import { Text, View } from "react-native";

import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { StackBack } from "@/components/StackBack";
import { PRIVACY_SECTIONS, PRIVACY_UPDATED } from "@/constants/legal";

export default function PrivacyScreen() {
  return (
    <Screen>
      <StackBack />
      <Text className="mb-1 text-xs uppercase tracking-[3px] text-saffron-300">Legal</Text>
      <Text className="mb-1 text-3xl font-bold text-white">Privacy</Text>
      <Text className="mb-5 text-xs text-violet-400">Updated {PRIVACY_UPDATED}</Text>

      {PRIVACY_SECTIONS.map((section) => (
        <Card key={section.title} className="mb-3">
          <Text className="text-base font-semibold text-white">{section.title}</Text>
          <Text className="mt-2 text-sm leading-5 text-violet-200">{section.body}</Text>
        </Card>
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
