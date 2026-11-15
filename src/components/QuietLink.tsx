import { Pressable } from "react-native";

import { space } from "@/theme";

import { Text } from "./Text";

type QuietLinkProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
};

export function QuietLink({ label, onPress, disabled = false, testID }: QuietLinkProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={space.md}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: disabled ? 0.45 : pressed ? 0.5 : 1, paddingVertical: space.sm })}>
      <Text variant="caption" soft style={{ textAlign: "center", textDecorationLine: "underline" }}>
        {label}
      </Text>
    </Pressable>
  );
}
