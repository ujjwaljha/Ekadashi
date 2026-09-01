import type { ReactNode } from "react";
import { Text, View } from "react-native";

export function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <View className="mb-3 flex-row items-center gap-2">
      {icon}
      <Text className="text-base font-bold text-white">{title}</Text>
    </View>
  );
}
