import type { ReactNode } from "react";
import { StyleSheet, TextInput, type TextInputProps, View } from "react-native";

import { colors, radius, shadows, type } from "@/theme";

import { Text } from "./Text";

type BoxFieldProps = TextInputProps & {
  label: string;
  prefix?: ReactNode;
  message?: string | null;
};

export function BoxField({ label, prefix, message, style, ...input }: BoxFieldProps) {
  return (
    <View>
      <View style={styles.field}>
        {prefix ? (
          <>
            {prefix}
            <View style={styles.divider} />
          </>
        ) : null}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.ink3}
          selectionColor={colors.blue}
          keyboardAppearance="light"
          {...input}
          style={[type.input, styles.input, style]}
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
    gap: 12,
    height: 60,
    paddingHorizontal: 18,
    borderRadius: radius.field,
    backgroundColor: colors.white,
    boxShadow: shadows.card,
  },
  divider: { width: 1, height: 26, backgroundColor: colors.line },
  input: { flex: 1, height: 60, fontSize: 20, lineHeight: undefined, color: colors.ink, outlineStyle: "none" } as object,
  message: { marginTop: 10, marginHorizontal: 2 },
});
