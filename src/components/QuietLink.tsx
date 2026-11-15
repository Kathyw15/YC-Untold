import { Pressable } from "react-native";

import { fonts, space, tones } from "@/theme";

import { useTone } from "./Atmosphere";
import { Text } from "./Text";

type QuietLinkProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
};

export function QuietLink({ label, onPress, disabled = false, testID }: QuietLinkProps) {
  const toneName = useTone();
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
      <Text
        style={{
          fontFamily: fonts.heavy,
          textAlign: "center",
          textDecorationLine: "underline",
          color: toneName === "dark" ? tones.dark.text : tones.light.textSoft,
        }}>
        {label}
      </Text>
    </Pressable>
  );
}
