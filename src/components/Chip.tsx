import { Check } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, Text } from "react-native";

import { palette } from "@/constants/theme";

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: ReactNode;
}

export function Chip({ label, active = false, onPress, icon }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-1.5 rounded-full border px-3.5 py-2 ${
        active ? "border-saffron-400 bg-saffron-500/20" : "border-white/15 bg-white/5"
      }`}
    >
      {active && !icon ? <Check color={palette.saffron} size={14} /> : icon}
      <Text className={active ? "text-sm text-saffron-200" : "text-sm text-violet-200"}>
        {label}
      </Text>
    </Pressable>
  );
}
