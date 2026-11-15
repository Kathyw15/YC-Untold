import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
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

import { layout, space, tones } from "@/theme";

import { useTone } from "./Atmosphere";
import { Breathing } from "./Breathing";
import { QuietLink } from "./QuietLink";
import { Text } from "./Text";

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
  const tone = tones[toneName];
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
          style={[StyleSheet.absoluteFill, styles.afterword]}>
          <Breathing scale={0.08} dim={0.35} style={[styles.seal, { borderColor: tone.text }]}>
            <View style={[styles.core, { backgroundColor: tone.text }]} />
          </Breathing>
          <Text variant="title" style={styles.centered}>
            {title}
          </Text>
          <Text soft style={[styles.centered, styles.body]}>
            {body}
          </Text>
          <QuietLink testID="sealed-done" label="Done" onPress={onDone} />
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
  afterword: { alignItems: "center", justifyContent: "center", gap: space.md },
  seal: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.md,
  },
  core: { width: 6, height: 6, borderRadius: 3, opacity: 0.7 },
  centered: { textAlign: "center" },
  body: { maxWidth: 280, marginBottom: space.lg },
});
