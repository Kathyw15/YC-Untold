import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { type } from "@/theme";

import { Text } from "./Text";

const MASCOT = require("@/assets/brand/seal-mascot.png") as number;
const MASCOT_RATIO = 360 / 314;

export function Wordmark({ size = 30 }: { size?: number }) {
  const height = size * 1.3;
  return (
    <View style={styles.lockup} accessibilityRole="header" accessibilityLabel="Seal">
      <Image source={MASCOT} style={{ height, width: height * MASCOT_RATIO }} contentFit="contain" />
      <Text style={[type.wordmark, { fontSize: size, lineHeight: size * 1.1, letterSpacing: size * -0.05 }]}>Seal</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  lockup: { flexDirection: "row", alignItems: "center", gap: 4 },
});
