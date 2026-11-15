import { BlurView } from "expo-blur";
import type { ReactNode } from "react";
import { type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";

import { radius, shadows, tones } from "@/theme";

import { useTone } from "./Atmosphere";

type GlassProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  solid?: boolean;
  testID?: string;
};

export function Glass({ children, style, solid = false, testID }: GlassProps) {
  const toneName = useTone();
  const tone = tones[toneName];
  return (
    <View
      testID={testID}
      style={[
        styles.card,
        toneName === "light" && { boxShadow: shadows.card },
        { borderColor: tone.surfaceBorder, backgroundColor: solid ? "#FFFFFF" : tone.surface },
        style,
      ]}>
      {solid ? null : <BlurView intensity={18} tint={toneName} style={styles.blur} pointerEvents="none" />}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, borderWidth: 1 },
  blur: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, borderRadius: radius.card, overflow: "hidden" },
});
