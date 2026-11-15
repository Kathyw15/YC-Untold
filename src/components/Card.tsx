import type { ReactNode } from "react";
import { Pressable, StyleSheet } from "react-native";

import { radius, shadows, space, tones } from "@/theme";

import { useTone } from "./Atmosphere";

type CardProps = {
  children: ReactNode;
  onPress?: () => void;
  horizontal?: boolean;
  testID?: string;
};

export function Card({ children, onPress, horizontal = false, testID }: CardProps) {
  const toneName = useTone();
  const tone = tones[toneName];
  return (
    <Pressable
      testID={testID}
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        horizontal && styles.horizontal,
        { borderColor: tone.border, backgroundColor: tone.surface },
        toneName === "light" && { boxShadow: shadows.card },
        pressed && styles.pressed,
      ]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: 18,
    gap: space.sm,
  },
  horizontal: { flexDirection: "row", alignItems: "center", gap: 12 },
  pressed: { opacity: 0.7 },
});
