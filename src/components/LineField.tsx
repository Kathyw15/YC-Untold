import type { ReactNode } from "react";
import { StyleSheet, TextInput, type TextInputProps, View } from "react-native";

import { space, tones, type } from "@/theme";

import { useTone } from "./Atmosphere";
import { Text } from "./Text";

type LineFieldProps = TextInputProps & {
  label: string;
  prefix?: ReactNode;
  message?: string | null;
};

export function LineField({ label, prefix, message, style, ...input }: LineFieldProps) {
  const tone = tones[useTone()];
  return (
    <View>
      <Text variant="label" soft>
        {label}
      </Text>
      <View style={[styles.row, { borderBottomColor: tone.hairline }]}>
        {prefix}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={tone.hairline}
          selectionColor={tone.text}
          keyboardAppearance={tone === tones.dark ? "dark" : "light"}
          {...input}
          style={[type.input, styles.input, { color: tone.text }, style]}
        />
      </View>
      <Text variant="caption" soft style={styles.message} accessibilityLiveRegion="polite">
        {message ?? " "}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    marginTop: space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth * 2,
  },
  input: { flex: 1, paddingVertical: space.md, lineHeight: undefined },
  message: { marginTop: space.sm },
});
