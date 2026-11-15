import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet } from "react-native";

import { radius, shadows, space, tones } from "@/theme";

import { useTone } from "./Atmosphere";
import { Text } from "./Text";

type BreathingButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: ComponentProps<typeof Ionicons>["name"];
  testID?: string;
};

export function BreathingButton({ label, onPress, disabled = false, icon, testID }: BreathingButtonProps) {
  const toneName = useTone();
  const tone = tones[toneName];
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: tone.pill, boxShadow: toneName === "dark" ? shadows.whitePill : shadows.blackPill },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}>
      {icon ? <Ionicons name={icon} size={18} color={tone.onPill} /> : null}
      <Text variant="button" style={{ color: tone.onPill }} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    paddingHorizontal: space.lg,
  },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.985 }] },
});
