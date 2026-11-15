import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { createContext, type ReactNode, use } from "react";
import { type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";

import { type SceneName, scenes, type Tone, tones } from "@/theme";

const ToneContext = createContext<Tone>("light");

export function useTone() {
  return use(ToneContext);
}

export function ToneProvider({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <ToneContext value={tone}>{children}</ToneContext>;
}

const SCRIM = ["rgba(6, 10, 26, 0.2)", "rgba(6, 10, 26, 0.04)", "rgba(6, 10, 26, 0.06)", "rgba(6, 10, 26, 0.48)"] as const;

type AtmosphereProps = {
  scene: SceneName;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Atmosphere({ scene, children, style }: AtmosphereProps) {
  const { source, tone, fit } = scenes[scene];
  return (
    <ToneContext value={tone}>
      <View style={[styles.root, { backgroundColor: tones[tone].ground }, style]}>
        <Image source={source} style={StyleSheet.absoluteFill} contentFit={fit} transition={300} />
        {tone === "dark" ? (
          <LinearGradient colors={SCRIM} locations={[0, 0.26, 0.52, 1]} style={StyleSheet.absoluteFill} pointerEvents="none" />
        ) : null}
        {children}
      </View>
    </ToneContext>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: "hidden" },
});
