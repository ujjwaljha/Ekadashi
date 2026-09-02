import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { fonts } from "@/constants/theme";

export function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <View className="mb-3 flex-row items-center gap-2">
      {icon}
      <Text style={{ fontFamily: fonts.sansBold }} className="text-base text-white">
        {title}
      </Text>
    </View>
  );
}
