import type { ReactNode } from "react";
import { StyleSheet, TextInput, type TextInputProps, View } from "react-native";

import { colors, radius, space, tones, type } from "@/theme";

import { useTone } from "./Atmosphere";
import { Glass } from "./Glass";
import { Text } from "./Text";

type LineFieldProps = TextInputProps & {
  label: string;
  prefix?: ReactNode;
  message?: string | null;
};

export function LineField({ label, prefix, message, style, ...input }: LineFieldProps) {
  const toneName = useTone();
  const tone = tones[toneName];
  return (
    <View style={styles.root}>
      <Text variant="label" soft>
        {label}
      </Text>
      <Glass style={styles.field}>
        {prefix}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={tone.textMute}
          selectionColor={colors.pink}
          keyboardAppearance={toneName}
          {...input}
          style={[type.input, styles.input, { color: tone.text }, style]}
        />
      </Glass>
      <Text variant="caption" soft accessibilityLiveRegion="polite">
        {message ?? " "}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: space.sm },
  field: {
    height: 58,
    borderRadius: radius.field,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm + 4,
    paddingHorizontal: 18,
  },
  input: { flex: 1, height: "100%", lineHeight: undefined },
});
