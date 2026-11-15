import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet } from "react-native";

import { shadows, space, tones } from "@/theme";

import { useTone } from "./Atmosphere";

type IconButtonProps = {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
};

export function IconButton({ icon, label, onPress, disabled = false, testID }: IconButtonProps) {
  const toneName = useTone();
  const tone = tones[toneName];
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={space.sm}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        toneName === "dark"
          ? { backgroundColor: "rgba(255, 255, 255, 0.2)", borderColor: "rgba(255, 255, 255, 0.45)" }
          : { backgroundColor: "rgba(255, 255, 255, 0.72)", borderColor: "rgba(255, 255, 255, 0.95)", boxShadow: shadows.card },
        (pressed || disabled) && styles.pressed,
      ]}>
      <Ionicons name={icon} size={20} color={tone.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.6 },
});
