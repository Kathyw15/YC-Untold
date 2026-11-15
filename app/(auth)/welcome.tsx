import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import { BreathingButton } from "@/components/BreathingButton";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Wordmark } from "@/components/Wordmark";
import { space } from "@/theme";

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <Screen scene="sky" testID="welcome-screen">
      <View style={styles.middle}>
        <Rise>
          <Wordmark size={68} />
        </Rise>
        <Rise order={1}>
          <Text style={styles.tagline}>A place for the things you never said.</Text>
        </Rise>
      </View>
      <Rise order={2}>
        <BreathingButton testID="welcome-continue" label="Continue with phone" onPress={() => router.push("/phone")} />
      </Rise>
    </Screen>
  );
}

const styles = StyleSheet.create({
  middle: { flex: 1, alignItems: "center", justifyContent: "center", gap: space.xl, paddingBottom: space.xxl * 2 },
  tagline: { textAlign: "center", maxWidth: 220, fontSize: 19, lineHeight: 25, fontWeight: "500" },
});
