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
    <Screen scene="forest" testID="welcome-screen">
      <Rise>
        <Wordmark />
      </Rise>
      <View style={styles.middle}>
        <Rise order={1}>
          <Text variant="display">Say the thing you never said.</Text>
        </Rise>
        <Rise order={2}>
          <Text soft>Seal it. If they feel the same, you'll both find out.</Text>
        </Rise>
      </View>
      <Rise order={3}>
        <BreathingButton testID="welcome-continue" label="Continue with phone" onPress={() => router.push("/phone")} />
      </Rise>
    </Screen>
  );
}

const styles = StyleSheet.create({
  middle: { flex: 1, justifyContent: "center", gap: space.md },
});
