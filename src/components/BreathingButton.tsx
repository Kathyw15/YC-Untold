import { Pressable, StyleSheet } from "react-native";

import { radius, space, tones } from "@/theme";

import { useTone } from "./Atmosphere";
import { Breathing } from "./Breathing";
import { Text } from "./Text";

type BreathingButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
};

export function BreathingButton({ label, onPress, disabled = false, testID }: BreathingButtonProps) {
  const tone = tones[useTone()];
  return (
    <Breathing active={!disabled} scale={0.015} dim={0.14}>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          { borderColor: tone.text, backgroundColor: tone.surface },
          disabled && styles.disabled,
          pressed && styles.pressed,
        ]}>
        <Text variant="button">{label}</Text>
      </Pressable>
    </Breathing>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.xl,
  },
  disabled: { opacity: 0.38 },
  pressed: { opacity: 0.6 },
});
