import { Pressable } from "react-native";

import { space, tones } from "@/theme";

import { useTone } from "./Atmosphere";
import { Text } from "./Text";

type QuietLinkProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
};

export function QuietLink({ label, onPress, disabled = false, testID }: QuietLinkProps) {
  const tone = tones[useTone()];
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={space.sm}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: disabled ? 0.45 : pressed ? 0.5 : 1, paddingVertical: space.sm + 4 })}>
      <Text variant="row" style={{ textAlign: "center", color: tone.textSoft, fontWeight: "500" }}>
        {label}
      </Text>
    </Pressable>
  );
}
