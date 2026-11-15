import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import { BreathingButton } from "@/components/BreathingButton";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Wordmark } from "@/components/Wordmark";
import { colors } from "@/theme";

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <Screen scene="sky" testID="welcome-screen">
      <View style={styles.middle}>
        <Rise>
          <View style={styles.lockup}>
            <View style={styles.orbit} />
            <Wordmark size={68} />
          </View>
        </Rise>
        <Rise order={1}>
          <Text style={styles.tagline}>{"A place for the things\nyou never said."}</Text>
        </Rise>
      </View>
      <Rise order={2}>
        <BreathingButton testID="welcome-continue" label="Continue with phone" onPress={() => router.push("/phone")} />
        <Text variant="caption" style={styles.terms}>
          By continuing you agree to the Terms and Privacy Policy.
        </Text>
      </Rise>
    </Screen>
  );
}

const styles = StyleSheet.create({
  middle: { flex: 1, alignItems: "center", paddingTop: 176 },
  lockup: { alignItems: "center", justifyContent: "center" },
  orbit: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 2.5,
    borderColor: colors.ink,
    transform: [{ rotate: "-5deg" }, { scaleY: 0.44 }],
  },
  terms: { textAlign: "center", marginTop: 12, color: "#3A4260" },
  tagline: {
    textAlign: "center",
    marginTop: 76,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "500",
    letterSpacing: -0.42,
    color: "#14141A",
  },
});
