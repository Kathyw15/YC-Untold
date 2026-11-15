import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";

import { motion } from "@/theme";

type RiseProps = {
  children: ReactNode;
  order?: number;
  style?: StyleProp<ViewStyle>;
};

export function Rise({ children, order = 0, style }: RiseProps) {
  return (
    <Animated.View
      style={style}
      entering={FadeInDown.duration(motion.rise)
        .delay(order * motion.stagger)
        .easing(Easing.out(Easing.cubic))
        .withInitialValues({ opacity: 0, transform: [{ translateY: motion.riseDistance }] })}>
      {children}
    </Animated.View>
  );
}
