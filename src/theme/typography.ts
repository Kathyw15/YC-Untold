import { Caveat_700Bold } from "@expo-google-fonts/caveat/700Bold";
import { CaveatBrush_400Regular } from "@expo-google-fonts/caveat-brush/400Regular";
import { Nunito_600SemiBold } from "@expo-google-fonts/nunito/600SemiBold";
import { Nunito_700Bold } from "@expo-google-fonts/nunito/700Bold";
import { Nunito_800ExtraBold } from "@expo-google-fonts/nunito/800ExtraBold";
import { Nunito_900Black } from "@expo-google-fonts/nunito/900Black";
import Feather from "@expo/vector-icons/Feather";
import type { TextStyle } from "react-native";

export const fontAssets = {
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
  Caveat_700Bold,
  CaveatBrush_400Regular,
  ...Feather.font,
};

export const fonts = {
  body: "Nunito_600SemiBold",
  bold: "Nunito_700Bold",
  heavy: "Nunito_800ExtraBold",
  black: "Nunito_900Black",
  script: "Caveat_700Bold",
  brush: "CaveatBrush_400Regular",
} as const;

export const type = {
  hero: { fontFamily: fonts.black, fontSize: 44, lineHeight: 46, letterSpacing: -1.5 },
  display: { fontFamily: fonts.black, fontSize: 32, lineHeight: 36, letterSpacing: -0.9 },
  title: { fontFamily: fonts.heavy, fontSize: 24, lineHeight: 29, letterSpacing: -0.4 },
  quote: { fontFamily: fonts.script, fontSize: 25, lineHeight: 29 },
  brush: { fontFamily: fonts.brush, fontSize: 22, lineHeight: 27 },
  wordmark: { fontFamily: fonts.black, fontSize: 32, lineHeight: 38, letterSpacing: -1.9 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23 },
  row: { fontFamily: fonts.heavy, fontSize: 16, lineHeight: 22 },
  caption: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fonts.heavy, fontSize: 12, lineHeight: 16, letterSpacing: 0.25 },
  button: { fontFamily: fonts.heavy, fontSize: 17, lineHeight: 22 },
  input: { fontFamily: fonts.bold, fontSize: 19, lineHeight: 26 },
  writing: { fontFamily: fonts.bold, fontSize: 23, lineHeight: 30, letterSpacing: -0.2 },
} as const satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;
