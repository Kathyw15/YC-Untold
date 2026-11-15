import Feather from "@expo/vector-icons/Feather";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet } from "react-native";

import { radius, shadows, space, tones } from "@/theme";

import { useTone } from "./Atmosphere";
import { Text } from "./Text";

type BreathingButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: ComponentProps<typeof Feather>["name"];
  testID?: string;
};

export function BreathingButton({ label, onPress, disabled = false, icon, testID }: BreathingButtonProps) {
  const tone = tones[useTone()];
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
        { backgroundColor: tone.button },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}>
      {icon ? <Feather name={icon} size={18} color={tone.buttonText} /> : null}
      <Text variant="button" style={{ color: tone.buttonText }}>
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
    paddingHorizontal: space.xl,
    boxShadow: shadows.button,
  },
  disabled: { opacity: 0.38 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
});
