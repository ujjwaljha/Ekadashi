import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { PressableScale } from "@/components/motion";
import { accentGradient, fonts, type } from "@/constants/theme";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  icon?: ReactNode;
  accessibilityLabel?: string;
}

export function PrimaryButton({ label, onPress, icon, accessibilityLabel }: ButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      haptic="light"
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <LinearGradient
        colors={[...accentGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 18, paddingVertical: 15, paddingHorizontal: 18 }}
      >
        <View className="flex-row items-center justify-center gap-2">
          {icon}
          <Text style={type.title} className="text-base text-indigoink-900">
            {label}
          </Text>
        </View>
      </LinearGradient>
    </PressableScale>
  );
}

export function GhostButton({ label, onPress, icon, accessibilityLabel }: ButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      haptic="light"
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      className="flex-row items-center justify-center gap-2 rounded-[18px] border border-white/15 bg-white/[0.06] py-[14px]"
    >
      {icon}
      <Text style={{ fontFamily: fonts.sansSemi }} className="text-base font-semibold text-saffron-200">
        {label}
      </Text>
    </PressableScale>
  );
}
