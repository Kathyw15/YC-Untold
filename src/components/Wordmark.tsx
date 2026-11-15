import { fonts } from "@/theme";

import { Text, type TextProps } from "./Text";

export function Wordmark(props: Omit<TextProps, "variant" | "children">) {
  return (
    <Text accessibilityLabel="Untold" {...props} variant="wordmark">
      <Text variant="wordmark" style={{ fontFamily: fonts.serifItalic }}>
        un
      </Text>
      told
    </Text>
  );
}
