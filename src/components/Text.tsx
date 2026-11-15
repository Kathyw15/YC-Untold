import { Text as NativeText, type TextProps as NativeTextProps } from "react-native";

import { tones, type, type TypeVariant } from "@/theme";

import { useTone } from "./Atmosphere";

export type TextProps = NativeTextProps & {
  variant?: TypeVariant;
  soft?: boolean;
};

export function Text({ variant = "body", soft = false, style, ...rest }: TextProps) {
  const tone = tones[useTone()];
  return <NativeText {...rest} style={[type[variant], { color: soft ? tone.textSoft : tone.text }, style]} />;
}
