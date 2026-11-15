import { StyleSheet, TextInput, type TextInputProps, View } from "react-native";

import { colors, radius, space, tones, type } from "@/theme";

import { useTone } from "./Atmosphere";
import { Text } from "./Text";

type WritingFieldProps = TextInputProps & {
  label: string;
};

export function WritingField({ label, style, ...input }: WritingFieldProps) {
  const toneName = useTone();
  const tone = tones[toneName];
  return (
    <View style={styles.root}>
      <Text variant="row" style={styles.label}>
        {label}
      </Text>
      <View
        style={[
          styles.composer,
          toneName === "dark"
            ? { backgroundColor: "rgba(255, 255, 255, 0.58)", borderColor: "rgba(255, 255, 255, 0.85)" }
            : { backgroundColor: "rgba(255, 255, 255, 0.72)", borderColor: colors.white },
        ]}>
        <TextInput
          multiline
          accessibilityLabel={label}
          placeholderTextColor="rgba(11, 11, 15, 0.4)"
          selectionColor={colors.blue}
          keyboardAppearance={toneName}
          textAlignVertical="top"
          {...input}
          style={[type.composer, styles.input, style]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: space.md },
  label: { marginHorizontal: space.xs },
  composer: {
    flex: 1,
    maxHeight: 320,
    minHeight: 180,
    borderRadius: radius.feed,
    borderWidth: 1,
    paddingHorizontal: space.lg,
    paddingVertical: space.lg - 4,
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12)",
  },
  input: { flex: 1, color: colors.ink, outlineStyle: "none" } as object,
});
