import type { ReactNode } from "react";
import { Pressable, StyleSheet } from "react-native";

import { radius, space, tones } from "@/theme";

import { useTone } from "./Atmosphere";

type CardProps = {
  children: ReactNode;
  onPress?: () => void;
  horizontal?: boolean;
  testID?: string;
};

export function Card({ children, onPress, horizontal = false, testID }: CardProps) {
  const tone = tones[useTone()];
  return (
    <Pressable
      testID={testID}
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        horizontal && styles.horizontal,
        { borderColor: tone.hairline, backgroundColor: tone.surface },
        pressed && styles.pressed,
      ]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth * 2,
    padding: space.lg,
    gap: space.sm,
  },
  horizontal: { flexDirection: "row", alignItems: "center", gap: space.md },
  pressed: { opacity: 0.6 },
});
