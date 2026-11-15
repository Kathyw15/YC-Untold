import { Redirect, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import { BreathingButton } from "@/components/BreathingButton";
import { QuietLink } from "@/components/QuietLink";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { useSession } from "@/lib/session";
import { space } from "@/theme";

export default function NoticeScreen() {
  const router = useRouter();
  const { status } = useSession();
  if (status === "loading") return null;
  if (status !== "ready") return <Redirect href="/" />;

  return (
    <Screen scene="mist" testID="notice-screen">
      <View style={styles.back}>
        <QuietLink label="Back" onPress={() => router.back()} testID="notice-back" />
      </View>
      <View style={styles.middle}>
        <Rise order={1}>
          <Text variant="title">Someone left you a Seal.</Text>
        </Rise>
        <Rise order={2}>
          <Text soft>
            Someone you know wrote something for you and sealed it. You can't see who wrote it or what it says, and
            they can't see whether you looked.
          </Text>
        </Rise>
        <Rise order={3}>
          <Text soft>
            If you write to the same person and your words meet theirs, you'll both be asked before anything is shown.
          </Text>
        </Rise>
      </View>
      <Rise order={4} style={styles.actions}>
        <BreathingButton
          testID="notice-write"
          label="Write to someone"
          onPress={() => router.dismissTo({ pathname: "/people", params: { hint: "1" } })}
        />
        <QuietLink testID="notice-not-now" label="Not now" onPress={() => router.back()} />
      </Rise>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { alignItems: "flex-start" },
  middle: { flex: 1, justifyContent: "center", gap: space.md },
  actions: { gap: space.sm },
});
