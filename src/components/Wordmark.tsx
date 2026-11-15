import { Text, type TextProps } from "./Text";

export function Wordmark(props: Omit<TextProps, "variant" | "children">) {
  return (
    <Text accessibilityLabel="Untold" {...props} variant="wordmark">
      untold.
    </Text>
  );
}
