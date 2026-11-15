import { Platform, type TextStyle } from "react-native";

const fontFamily = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, "Segoe UI", system-ui, sans-serif',
  default: undefined,
});

export const type = {
  hero: { fontFamily, fontSize: 42, lineHeight: 46, fontWeight: "800", letterSpacing: -1.5 },
  display: { fontFamily, fontSize: 34, lineHeight: 37, fontWeight: "800", letterSpacing: -1 },
  title: { fontFamily, fontSize: 28, lineHeight: 32, fontWeight: "800", letterSpacing: -0.8 },
  heading: { fontFamily, fontSize: 20, lineHeight: 25, fontWeight: "700", letterSpacing: -0.5 },
  quote: { fontFamily, fontSize: 19, lineHeight: 26, fontWeight: "500", letterSpacing: -0.3 },
  composer: { fontFamily, fontSize: 26, lineHeight: 34, fontWeight: "400", letterSpacing: -0.5 },
  wordmark: { fontFamily, fontSize: 30, lineHeight: 32, fontWeight: "900", letterSpacing: -1.5 },
  body: { fontFamily, fontSize: 17, lineHeight: 24, fontWeight: "400", letterSpacing: -0.17 },
  row: { fontFamily, fontSize: 16, lineHeight: 21, fontWeight: "600", letterSpacing: -0.24 },
  caption: { fontFamily, fontSize: 13, lineHeight: 18, fontWeight: "400" },
  label: { fontFamily, fontSize: 13, lineHeight: 18, fontWeight: "600" },
  button: { fontFamily, fontSize: 17, lineHeight: 22, fontWeight: "600", letterSpacing: -0.25 },
  input: { fontFamily, fontSize: 18, lineHeight: 24, fontWeight: "500", letterSpacing: -0.2 },
} as const satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;
