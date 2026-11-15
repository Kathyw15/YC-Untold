import { InstrumentSerif_400Regular } from "@expo-google-fonts/instrument-serif/400Regular";
import { InstrumentSerif_400Regular_Italic } from "@expo-google-fonts/instrument-serif/400Regular_Italic";
import { Inter_300Light } from "@expo-google-fonts/inter/300Light";
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import type { TextStyle } from "react-native";

export const fontAssets = {
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
  Inter_300Light,
  Inter_400Regular,
};

export const fonts = {
  serif: "InstrumentSerif_400Regular",
  serifItalic: "InstrumentSerif_400Regular_Italic",
  sansLight: "Inter_300Light",
  sans: "Inter_400Regular",
} as const;

export const type = {
  display: { fontFamily: fonts.serifItalic, fontSize: 40, lineHeight: 50 },
  title: { fontFamily: fonts.serifItalic, fontSize: 30, lineHeight: 40 },
  quote: { fontFamily: fonts.serifItalic, fontSize: 22, lineHeight: 33 },
  wordmark: { fontFamily: fonts.serif, fontSize: 26, lineHeight: 32, letterSpacing: 0.2 },
  body: { fontFamily: fonts.sansLight, fontSize: 16, lineHeight: 26, letterSpacing: 0.2 },
  caption: { fontFamily: fonts.sansLight, fontSize: 13, lineHeight: 20, letterSpacing: 0.3 },
  label: {
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 18,
    letterSpacing: 2.2,
    textTransform: "uppercase",
  },
  button: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 24, letterSpacing: 0.8 },
  input: { fontFamily: fonts.sansLight, fontSize: 26, lineHeight: 34, letterSpacing: 0.6 },
} as const satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;
