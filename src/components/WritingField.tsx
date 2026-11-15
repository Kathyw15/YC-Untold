import { StyleSheet, TextInput, type TextInputProps, View } from "react-native";

import { space, tones, type } from "@/theme";

import { useTone } from "./Atmosphere";
import { Text } from "./Text";

type WritingFieldProps = TextInputProps & {
  label: string;
};

export function WritingField({ label, style, ...input }: WritingFieldProps) {
  const tone = tones[useTone()];
  return (
    <View style={styles.root}>
      <Text variant="label" soft>
        {label}
      </Text>
      <TextInput
        multiline
        accessibilityLabel={label}
        placeholderTextColor={tone.hairline}
        selectionColor={tone.text}
        keyboardAppearance={tone === tones.dark ? "dark" : "light"}
        textAlignVertical="top"
        {...input}
        style={[type.quote, styles.input, { color: tone.text }, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: space.sm },
  input: { flex: 1, paddingVertical: space.sm },
});
