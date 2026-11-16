import { Image } from "expo-image";
import { useIsFocused, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet } from "react-native";

import { Screen } from "@/components/Screen";

export default function WelcomeScreen() {
  const router = useRouter();
  const focused = useIsFocused();
  return (
    <Screen scene="sky" testID="welcome-screen" contentStyle={styles.screen}>
      <StatusBar style={focused ? "light" : "dark"} />
      <Pressable
        testID="welcome-continue"
        accessibilityRole="button"
        accessibilityLabel="Seal. Say the real thing. Continue"
        onPress={() => router.push("/phone")}
        style={styles.fill}>
        <Image source={require("@/assets/brand/logo-combo-seal.png")} style={styles.logo} contentFit="contain" />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 },
  fill: { flex: 1, alignItems: "center" },
  logo: { width: 220, height: 235, marginTop: 222 },
});
