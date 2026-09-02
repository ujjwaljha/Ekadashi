import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { backgroundGradient } from "@/constants/theme";

interface ScreenProps {
  children: ReactNode;
  /** When true (default) content scrolls; set false for full-bleed layouts. */
  scroll?: boolean;
}

function AmbientGlow() {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [drift]);

  const warm = useAnimatedStyle(() => ({
    transform: [{ translateY: drift.value * 18 }, { translateX: drift.value * -8 }],
    opacity: 0.28 + drift.value * 0.1,
  }));
  const cool = useAnimatedStyle(() => ({
    transform: [{ translateY: drift.value * -14 }, { translateX: drift.value * 10 }],
    opacity: 0.22 + (1 - drift.value) * 0.08,
  }));

  return (
    <View style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, pointerEvents: "none" }}>
      <Animated.View
        style={[
          {
            position: "absolute",
            top: -80,
            right: -60,
            width: 240,
            height: 240,
            borderRadius: 120,
            backgroundColor: "rgba(249, 115, 22, 0.22)",
          },
          warm,
        ]}
      />
      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: 80,
            left: -70,
            width: 260,
            height: 260,
            borderRadius: 130,
            backgroundColor: "rgba(99, 102, 241, 0.2)",
          },
          cool,
        ]}
      />
    </View>
  );
}

/** Full-screen serene gradient background with safe-area aware padding. */
export function Screen({ children, scroll = true }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const pad = { paddingTop: insets.top + 10, paddingBottom: 32 + insets.bottom };

  return (
    <LinearGradient colors={[...backgroundGradient]} style={{ flex: 1 }}>
      <AmbientGlow />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {scroll ? (
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, ...pad }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        ) : (
          <View style={{ flex: 1, paddingHorizontal: 20, ...pad }}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
