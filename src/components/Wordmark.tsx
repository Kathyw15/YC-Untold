import { Text, type TextProps } from "./Text";

export function Wordmark(props: Omit<TextProps, "variant" | "children">) {
  return (
    <Text accessibilityLabel="Seal" {...props} variant="wordmark">
      Seal
    </Text>
  );
}
