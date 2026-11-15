import { type ReactNode, useEffect } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { motion } from "@/theme";

export function useBreath(period: number = motion.breath, active = true) {
  const reducedMotion = useReducedMotion();
  const breath = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion || !active) {
      breath.set(withTiming(0, { duration: 300 }));
      return;
    }
    breath.set(
      withRepeat(withTiming(1, { duration: period / 2, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
    return () => cancelAnimation(breath);
  }, [active, breath, period, reducedMotion]);

  return breath;
}

type BreathingProps = {
  children?: ReactNode;
  period?: number;
  scale?: number;
  dim?: number;
  active?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Breathing({ children, period, scale = 0.03, dim = 0.2, active, style }: BreathingProps) {
  const breath = useBreath(period, active);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - dim * (1 - breath.get()),
    transform: [{ scale: 1 + scale * breath.get() }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
