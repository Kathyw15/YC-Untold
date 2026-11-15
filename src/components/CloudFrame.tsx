import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { type ReactNode, useEffect } from "react";
import { StyleSheet, Text as PlainText, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";

import { type } from "@/theme";

const BUMPS = {
  a: [
    [0, 0.31, 0.18],
    [38, 0.32, 0.165],
    [80, 0.31, 0.185],
    [124, 0.32, 0.17],
    [164, 0.31, 0.18],
    [205, 0.32, 0.17],
    [246, 0.31, 0.185],
    [290, 0.32, 0.162],
    [330, 0.31, 0.18],
  ],
  b: [
    [16, 0.32, 0.17],
    [57, 0.31, 0.185],
    [99, 0.32, 0.163],
    [141, 0.31, 0.182],
    [184, 0.32, 0.172],
    [226, 0.31, 0.18],
    [268, 0.32, 0.168],
    [311, 0.31, 0.185],
    [350, 0.32, 0.158],
  ],
} as const;

const BORDER = 8;
const MYSTERY = require("@/assets/photos/mystery.jpg");

type Variant = keyof typeof BUMPS;

function circles(variant: Variant, size: number) {
  const bumps = BUMPS[variant].map(([angle, distance, r]) => {
    const turn = (angle * Math.PI) / 180;
    return [0.5 + distance * Math.cos(turn), 0.5 + distance * Math.sin(turn), r];
  });
  return [[0.5, 0.5, 0.34], ...bumps].map(([cx, cy, r]) => {
    const diameter = Math.round(2 * r * size);
    return {
      left: Math.round((cx - r) * size),
      top: Math.round((cy - r) * size),
      width: diameter,
      height: diameter,
      borderRadius: diameter / 2,
    };
  });
}

function CloudClip({ variant, size, children }: { variant: Variant; size: number; children: ReactNode }) {
  return (
    <View style={{ width: size, height: size }}>
      {circles(variant, size).map((circle, index) => (
        <View key={index} style={[styles.circle, circle]}>
          <View style={{ position: "absolute", left: -circle.left, top: -circle.top, width: size, height: size }}>
            {children}
          </View>
        </View>
      ))}
    </View>
  );
}

export type CloudFace = {
  uri?: string | null;
  name?: string | null;
  emoji?: string | null;
  mystery?: boolean;
  revealing?: boolean;
};

type CloudFrameProps = CloudFace & {
  size: number;
  variant?: Variant;
};

export function CloudFrame({ size, variant = "a", uri, name, emoji, mystery = false, revealing = false }: CloudFrameProps) {
  const inner = size - BORDER * 2;
  const veil = useSharedValue(1);

  useEffect(() => {
    if (revealing) veil.set(withDelay(300, withTiming(0, { duration: 1400 })));
  }, [revealing, veil]);

  const fading = useAnimatedStyle(() => ({ opacity: veil.get() }));
  const outline = circles(variant, size);
  const hasFace = Boolean(uri || emoji || name);

  return (
    <View style={{ width: size, height: size }} pointerEvents="none">
      {outline.map((circle, index) => (
        <View key={index} style={[styles.circle, styles.shadow, circle]} />
      ))}
      {outline.map((circle, index) => (
        <View key={index} style={[styles.circle, styles.white, circle]} />
      ))}
      {hasFace ? (
        <View style={styles.inner}>
          <CloudClip variant={variant} size={inner}>
            <LinearGradient colors={["#E6E9F2", "#D6DAE6"]} style={[StyleSheet.absoluteFill, styles.centered]}>
              {uri ? (
                <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel="Profile photo" />
              ) : emoji ? (
                <PlainText style={{ fontSize: inner * 0.42, lineHeight: inner * 0.54 }}>{emoji}</PlainText>
              ) : (
                <PlainText style={[type.hero, styles.initial, { fontSize: inner * 0.36, lineHeight: inner * 0.46 }]}>
                  {name?.trim().charAt(0).toUpperCase() ?? ""}
                </PlainText>
              )}
            </LinearGradient>
          </CloudClip>
        </View>
      ) : null}
      {mystery || !hasFace ? (
        <Animated.View style={[styles.inner, fading]}>
          <CloudClip variant={variant} size={inner}>
            <View style={[StyleSheet.absoluteFill, styles.centered]}>
              <Image source={MYSTERY} style={StyleSheet.absoluteFill} contentFit="cover" />
              <PlainText style={[type.hero, styles.question, { fontSize: size * 0.36, lineHeight: size * 0.44 }]}>?</PlainText>
            </View>
          </CloudClip>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { position: "absolute", overflow: "hidden" },
  shadow: {
    backgroundColor: "#FFFFFF",
    boxShadow: "0 12px 22px rgba(40, 50, 90, 0.1), 0 2px 4px rgba(40, 50, 90, 0.05)",
  },
  white: { backgroundColor: "#FFFFFF" },
  inner: { position: "absolute", left: BORDER, top: BORDER },
  centered: { alignItems: "center", justifyContent: "center" },
  initial: { color: "#5D6273", fontWeight: "600", letterSpacing: 0 },
  question: {
    color: "#FFFFFF",
    fontWeight: "800",
    letterSpacing: 0,
    textShadowColor: "rgba(80, 80, 150, 0.35)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 14,
  },
});
