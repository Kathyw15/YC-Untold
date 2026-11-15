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

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { layout, space } from "@/theme";

import { Atmosphere, useTone } from "./Atmosphere";
import { BreathingButton } from "./BreathingButton";
import { Deco } from "./Deco";
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
  const insets = useSafeAreaInsets();
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
          style={[
            styles.afterword,
            { top: -(insets.top + space.md), bottom: -(insets.bottom + space.lg) },
          ]}>
          <Atmosphere scene="pastel" style={[styles.page, { paddingBottom: insets.bottom + space.lg }]}>
            <View style={styles.middle}>
              <View style={styles.stickers}>
                <Deco name="star" width={34} rotate={-12} style={styles.star} />
                <Deco name="envelope" width={190} rotate={-5} />
                <Deco name="lock" width={84} rotate={8} style={styles.lock} />
              </View>
              <Text variant="hero" style={styles.centered}>
                {title}
              </Text>
              <Text soft style={[styles.centered, styles.body]}>
                {body}
              </Text>
            </View>
            <BreathingButton testID="sealed-done" label="Done" onPress={onDone} />
          </Atmosphere>
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
  afterword: { position: "absolute", left: -layout.screenPadding, right: -layout.screenPadding },
  page: { paddingHorizontal: layout.screenPadding },
  middle: { flex: 1, alignItems: "center", justifyContent: "center", gap: space.sm },
  stickers: { marginBottom: space.lg },
  star: { position: "absolute", top: -14, left: -22, zIndex: 1 },
  lock: { position: "absolute", right: -18, bottom: -34 },
  centered: { textAlign: "center" },
  body: { maxWidth: 280 },
});
