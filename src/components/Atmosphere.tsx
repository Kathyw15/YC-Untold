import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { createContext, type ReactNode, use } from "react";
import { type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";

import { type SceneName, scenes, type Tone } from "@/theme";

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
  const { tone, ground, photo, fit, veil, veilStops, ...rest } = scenes[scene];
  const veilHeight = "veilHeight" in rest ? rest.veilHeight : undefined;

  return (
    <ToneContext value={tone}>
      <View style={[styles.root, { backgroundColor: ground }, style]}>
        {photo ? (
          <Image
            source={photo}
            style={fit === "top" ? styles.top : StyleSheet.absoluteFill}
            contentFit="cover"
            contentPosition="top"
            transition={300}
          />
        ) : null}
        <LinearGradient
          colors={veil}
          locations={veilStops}
          start={photo ? { x: 0.5, y: 0 } : { x: 1, y: 0 }}
          end={photo ? { x: 0.5, y: 1 } : { x: 0, y: 1 }}
          style={veilHeight ? [styles.top, { aspectRatio: undefined, height: veilHeight }] : StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        {children}
      </View>
    </ToneContext>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: "hidden" },
  top: { position: "absolute", top: 0, left: 0, right: 0, aspectRatio: 848 / 1264 },
});
