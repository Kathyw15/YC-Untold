import { StyleSheet, TextInput, type TextInputProps, View } from "react-native";

import { colors, space, tones, type } from "@/theme";

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
      <Text variant="label" soft>
        {label}
      </Text>
      <TextInput
        multiline
        accessibilityLabel={label}
        placeholderTextColor={tone.textMute}
        selectionColor={colors.pink}
        keyboardAppearance={toneName}
        textAlignVertical="top"
        {...input}
        style={[type.writing, styles.input, { color: tone.text }, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: space.sm },
  input: { flex: 1, paddingVertical: space.sm },
});
