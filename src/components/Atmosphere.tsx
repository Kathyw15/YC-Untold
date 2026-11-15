import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { createContext, type ReactNode, use } from "react";
import { Image as TiledImage, type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { grain, layout, motion, type SceneName, scenes, type Tone, tones } from "@/theme";

import { useBreath } from "./Breathing";

const ToneContext = createContext<Tone>("light");

export function useTone() {
  return use(ToneContext);
}

type AtmosphereProps = {
  scene: SceneName;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Atmosphere({ scene, children, style }: AtmosphereProps) {
  const { source, tone } = scenes[scene];
  const drift = useBreath(motion.drift);
  const driftStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1.03 + 0.04 * drift.get() }] }));

  return (
    <ToneContext value={tone}>
      <View style={[styles.root, { backgroundColor: tones[tone].ground }, style]}>
        <Animated.View style={[StyleSheet.absoluteFill, driftStyle]} pointerEvents="none">
          <Image source={source} style={StyleSheet.absoluteFill} contentFit="cover" transition={600} />
        </Animated.View>
        <LinearGradient
          colors={tones[tone].veil}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <TiledImage source={grain} resizeMode="repeat" style={styles.grain} pointerEvents="none" />
        {children}
      </View>
    </ToneContext>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: "hidden" },
  grain: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, width: "100%", height: "100%", opacity: layout.grainOpacity },
});
