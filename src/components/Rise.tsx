import type { ReactNode } from "react";
import { Platform, type StyleProp, type ViewStyle } from "react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";

import { motion } from "@/theme";

type RiseProps = {
  children: ReactNode;
  order?: number;
  style?: StyleProp<ViewStyle>;
};

export function Rise({ children, order = 0, style }: RiseProps) {
  const rise = FadeInDown.duration(motion.rise)
    .delay(order * motion.stagger)
    .easing(Easing.out(Easing.cubic));
  return (
    <Animated.View
      style={style}
      entering={
        Platform.OS === "web"
          ? rise
          : rise.withInitialValues({ opacity: 0, transform: [{ translateY: motion.riseDistance }] })
      }>
      {children}
    </Animated.View>
  );
}
