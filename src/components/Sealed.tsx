import { BlurView } from "expo-blur";
import { type ReactNode, useEffect } from "react";
import { type StyleProp, StyleSheet, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import { radius, space } from "@/theme";

import { Glass } from "./Glass";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const SEALED_INTENSITY = 38;
const REVEAL_DELAY = 700;
const REVEAL_DURATION = 3200;

type SealedProps = {
  children: ReactNode;
  open: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Sealed({ children, open, style }: SealedProps) {
  const clarity = useSharedValue(0);

  useEffect(() => {
    clarity.set(
      open
        ? withDelay(REVEAL_DELAY, withTiming(1, { duration: REVEAL_DURATION, easing: Easing.inOut(Easing.cubic) }))
        : 0,
    );
  }, [clarity, open]);

  const veil = useAnimatedProps(() => ({ intensity: SEALED_INTENSITY * (1 - clarity.get()) }));
  const words = useAnimatedStyle(() => ({
    opacity: 0.45 + 0.55 * clarity.get(),
    transform: [{ scale: 0.97 + 0.03 * clarity.get() }],
  }));

  return (
    <Glass style={style}>
      <Animated.View style={[styles.words, words]}>{children}</Animated.View>
      <AnimatedBlurView animatedProps={veil} tint="light" style={styles.veil} pointerEvents="none" />
    </Glass>
  );
}

const styles = StyleSheet.create({
  veil: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, borderRadius: radius.card, overflow: "hidden" },
  words: { padding: space.lg, gap: space.md },
});
