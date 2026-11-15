import { Text as NativeText, type TextProps as NativeTextProps } from "react-native";

import { tones, type, type TypeVariant } from "@/theme";

import { useTone } from "./Atmosphere";

export type TextProps = NativeTextProps & {
  variant?: TypeVariant;
  soft?: boolean;
};

export function Text({ variant = "body", soft = false, style, ...rest }: TextProps) {
  const tone = tones[useTone()];
  const quiet = variant === "caption" || variant === "label" ? tone.textMute : tone.textSoft;
  return <NativeText {...rest} style={[type[variant], { color: soft ? quiet : tone.text }, style]} />;
}
