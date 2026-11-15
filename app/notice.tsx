import { Image } from "expo-image";
import { Redirect, useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import { BreathingButton } from "@/components/BreathingButton";
import { IconButton } from "@/components/IconButton";
import { QuietLink } from "@/components/QuietLink";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { useSession } from "@/lib/session";
import { layout, radius, shadows } from "@/theme";

const MASCOT = require("@/assets/brand/seal-mascot.png") as number;
const MASCOT_RATIO = 360 / 314;

export default function NoticeScreen() {
  const router = useRouter();
  const { status } = useSession();
  if (status === "loading") return null;
  if (status !== "ready") return <Redirect href="/" />;

  return (
    <Screen scene="aurora" testID="notice-screen">
      <View style={styles.nav}>
        <IconButton icon="chevron-back" label="Back" onPress={() => router.back()} testID="notice-back" />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Rise style={styles.mascot}>
          <Image
            source={MASCOT}
            style={[{ height: 180, width: 180 * MASCOT_RATIO }, styles.shadow]}
            contentFit="contain"
            accessibilityLabel="Seal"
          />
        </Rise>
        <Rise order={1}>
          <Text variant="display" style={styles.title}>
            Someone left you a Seal.
          </Text>
        </Rise>
        <Rise order={2}>
          <Text soft style={styles.paragraph}>
            Someone in your contacts wrote you a few words and sealed them. We won’t tell you who, or what they said.
          </Text>
        </Rise>
        <Rise order={3}>
          <Text soft style={styles.paragraph}>
            If you write to them too and your words meet, we’ll ask you both if you want to reveal.
          </Text>
        </Rise>
        <Rise order={4}>
          <View style={styles.card}>
            <Text style={styles.cardText}>Is there someone you want to say something to?</Text>
          </View>
        </Rise>
      </ScrollView>
      <Rise order={5} style={styles.actions}>
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
  scroll: { flex: 1, marginHorizontal: -layout.screenPadding },
  nav: { height: 52, justifyContent: "center", marginHorizontal: -4 },
  body: { paddingHorizontal: layout.screenPadding, paddingBottom: 16 },
  mascot: { height: 220, alignItems: "center", justifyContent: "center", paddingTop: 20 },
  shadow: { filter: "drop-shadow(0 10px 18px rgba(0, 0, 0, 0.12))" } as object,
  title: { marginVertical: 12 },
  paragraph: { marginBottom: 14 },
  card: {
    marginVertical: 12,
    padding: 18,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
    backgroundColor: "rgba(255, 255, 255, 0.62)",
    boxShadow: shadows.card,
  },
  cardText: { fontSize: 19, lineHeight: 25, fontWeight: "600", letterSpacing: -0.38 },
  actions: { gap: 4, paddingTop: 10 },
});
