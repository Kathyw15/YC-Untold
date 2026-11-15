import type { ReactNode } from "react";
import { StyleSheet, TextInput, type TextInputProps, View } from "react-native";

import { colors, radius, shadows, space, tones, type } from "@/theme";

import { useTone } from "./Atmosphere";
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
    <View>
      <Text variant="label" soft>
        {label}
      </Text>
      <View
        style={[
          styles.field,
          toneName === "dark"
            ? { backgroundColor: tone.surface, borderWidth: 1, borderColor: tone.border }
            : { backgroundColor: colors.white, boxShadow: shadows.card },
        ]}>
        {prefix}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={tone.faint}
          selectionColor={colors.blue}
          keyboardAppearance={toneName}
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
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    marginTop: space.sm,
    height: 56,
    paddingHorizontal: space.md,
    borderRadius: radius.field,
  },
  input: { flex: 1, height: 56, lineHeight: undefined, outlineStyle: "none" } as object,
  message: { marginTop: space.sm },
});
