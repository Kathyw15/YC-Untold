import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { type ReactNode, useEffect } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { colors, layout } from "@/theme";

import { ToneProvider, useTone } from "./Atmosphere";
import { BreathingButton } from "./BreathingButton";
import { IconButton } from "./IconButton";
import { Text } from "./Text";

const MASCOT = require("@/assets/brand/seal-mascot.png") as number;
const MASCOT_RATIO = 360 / 314;

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const SEAL_MS = 2800;
const SEAL_BLUR = 20;
const SINK_DISTANCE = 56;

type SealingProps = {
  sealed: boolean;
  children: ReactNode;
  title: string;
  body: string;
  onDone: () => void;
};

export function Sealing({ sealed, children, title, body, onDone }: SealingProps) {
  const toneName = useTone();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!sealed) return;
    Keyboard.dismiss();
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    progress.set(withTiming(1, { duration: SEAL_MS, easing: Easing.inOut(Easing.cubic) }));
  }, [progress, sealed]);

  const sinking = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0, 0.35, 1], [1, 0.85, 0]),
    transform: [{ translateY: SINK_DISTANCE * progress.get() }, { scale: 1 - 0.06 * progress.get() }],
  }));
  const blurring = useAnimatedProps(() => ({ intensity: SEAL_BLUR * progress.get() }));

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.root, sinking]} pointerEvents={sealed ? "none" : "auto"}>
        {children}
      </Animated.View>
      <AnimatedBlurView pointerEvents="none" tint={toneName} animatedProps={blurring} style={styles.veil} />
      {sealed ? (
        <Animated.View
          testID="sealed-afterword"
          entering={FadeIn.duration(900).delay(SEAL_MS - 600)}
          style={StyleSheet.absoluteFill}>
          <ToneProvider tone="light">
            <View style={styles.ground} pointerEvents="none" />
            <View style={styles.nav}>
              <IconButton icon="close" label="Close" onPress={onDone} />
            </View>
            <View style={styles.afterword}>
              <View style={styles.mascot}>
                <Image source={MASCOT} style={[{ height: 240, width: 240 * MASCOT_RATIO }, styles.shadow]} contentFit="contain" />
              </View>
              <Text variant="hero" style={styles.centered}>
                {title}
              </Text>
              <Text soft style={[styles.centered, styles.body]}>
                {body}
              </Text>
            </View>
            <BreathingButton testID="sealed-done" label="Done" onPress={onDone} />
          </ToneProvider>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  veil: {
    position: "absolute",
    top: -200,
    bottom: -200,
    left: -layout.screenPadding,
    right: -layout.screenPadding,
  },
  ground: {
    position: "absolute",
    top: -200,
    bottom: -200,
    left: -layout.screenPadding,
    right: -layout.screenPadding,
    backgroundColor: colors.base,
  },
  nav: { height: 52, justifyContent: "center", alignItems: "flex-start", marginHorizontal: -4 },
  afterword: { flex: 1, alignItems: "center" },
  mascot: { height: 320, marginTop: 10, justifyContent: "flex-end", paddingBottom: 40 },
  shadow: { filter: "drop-shadow(0 12px 22px rgba(0, 0, 0, 0.12))" } as object,
  centered: { textAlign: "center" },
  body: { maxWidth: 300, marginTop: 12 },
});
