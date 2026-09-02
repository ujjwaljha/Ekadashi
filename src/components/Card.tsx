import type { ReactNode } from "react";
import { View, type ViewStyle } from "react-native";

import { shadows } from "@/constants/theme";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: ViewStyle;
  elevated?: boolean;
}

/** Frosted surface container used to group content across the app. */
export function Card({ children, className = "", style, elevated = true }: CardProps) {
  return (
    <View
      className={`rounded-3xl border border-white/10 bg-white/[0.055] p-5 ${className}`}
      style={[elevated ? shadows.card : undefined, style]}
    >
      {children}
    </View>
  );
}
