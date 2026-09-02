import { type ReactNode, useEffect } from "react";
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
  ZoomIn,
} from "react-native-reanimated";

import { motion } from "@/constants/theme";
import { tapLight, tapSelection } from "@/lib/haptics";

const easeOut = Easing.bezier(0.22, 1, 0.36, 1);

export const enterDown = (delay = 0) =>
  FadeInDown.duration(motion.enterMs)
    .delay(delay)
    .easing(easeOut)
    .reduceMotion(ReduceMotion.System);

export const enterFade = (delay = 0) =>
  FadeIn.duration(motion.enterMs).delay(delay).reduceMotion(ReduceMotion.System);

export const enterZoom = (delay = 0) =>
  ZoomIn.duration(380).delay(delay).easing(easeOut).reduceMotion(ReduceMotion.System);

export const exitFade = FadeOut.duration(160).reduceMotion(ReduceMotion.System);

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ScaleProps = PressableProps & {
  children: ReactNode;
  haptic?: "light" | "selection" | "none";
  className?: string;
  style?: StyleProp<ViewStyle>;
};

/** Soft spring press — the primary tactile control for chips, cards, and buttons. */
export function PressableScale({
  children,
  onPress,
  onPressIn,
  onPressOut,
  haptic = "light",
  disabled,
  style,
  className,
  ...rest
}: ScaleProps) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      className={className}
      style={[animated, style]}
      onPressIn={(event) => {
        scale.value = withSpring(disabled ? 1 : 0.97, motion.press);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withSpring(1, motion.press);
        onPressOut?.(event);
      }}
      onPress={(event) => {
        if (disabled) return;
        if (haptic === "light") tapLight();
        if (haptic === "selection") tapSelection();
        onPress?.(event);
      }}
    >
      {children}
    </AnimatedPressable>
  );
}

export function FadeInView({
  children,
  delay = 0,
  zoom = false,
  style,
  className,
}: {
  children: ReactNode;
  delay?: number;
  zoom?: boolean;
  style?: StyleProp<ViewStyle>;
  className?: string;
}) {
  return (
    <Animated.View
      entering={zoom ? enterZoom(delay) : enterDown(delay)}
      className={className}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

/** Slow breathing ring used on the alarm icon. */
export function PulseHalo({ size = 112 }: { size?: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [progress]);

  const ring = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + progress.value * 0.22 }],
    opacity: 0.45 - progress.value * 0.35,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: "rgba(251, 146, 60, 0.7)",
        },
        ring,
      ]}
    />
  );
}
