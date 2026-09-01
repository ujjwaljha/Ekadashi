import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { backgroundGradient } from "@/constants/theme";

interface ScreenProps {
  children: ReactNode;
  /** When true (default) content scrolls; set false for full-bleed layouts. */
  scroll?: boolean;
}

/** Full-screen serene gradient background with safe-area aware padding. */
export function Screen({ children, scroll = true }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const pad = { paddingTop: insets.top + 8, paddingBottom: 28 + insets.bottom };

  return (
    <LinearGradient colors={[...backgroundGradient]} style={{ flex: 1 }}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, ...pad }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, paddingHorizontal: 20, ...pad }}>{children}</View>
      )}
    </LinearGradient>
  );
}
