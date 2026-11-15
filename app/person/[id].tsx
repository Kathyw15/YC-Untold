import { useQuery } from "convex/react";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { BreathingButton } from "@/components/BreathingButton";
import { QuietLink } from "@/components/QuietLink";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { StickerGrid } from "@/components/Sticker";
import { Text } from "@/components/Text";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useSession } from "@/lib/session";
import { space } from "@/theme";

export default function PersonScreen() {
  const { id, name, phone } = useLocalSearchParams<{ id: Id<"users">; name: string; phone: string }>();
  const router = useRouter();
  const { status } = useSession();
  const ready = status === "ready";
  const person = useQuery(api.contacts.listMatched, ready ? {} : "skip")?.find((match) => match.userId === id);
  const stickers = useQuery(api.stickers.withPerson, ready ? { userId: id } : "skip");
  const firstName = name.split(" ")[0];

  if (status === "loading") return null;
  if (!ready) return <Redirect href="/" />;

  return (
    <Screen scene="soft" testID="person-screen">
      <View style={styles.back}>
        <QuietLink label="Back" onPress={() => router.back()} testID="person-back" />
      </View>
      <Rise style={styles.scroll}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.identity}>
            <Avatar uri={person?.avatarUrl ?? null} name={name} />
            <Text variant="display" style={styles.centered} testID="person-name">
              {name}
            </Text>
          </View>
          <BreathingButton
            testID="person-write"
            label={"Write to " + firstName}
            onPress={() => router.push({ pathname: "/compose/direct", params: { phone, name, here: "1" } })}
          />
          <View style={styles.section}>
            <Text variant="label" soft>
              Badges
            </Text>
            {stickers?.length ? (
              <>
                <Text variant="caption" soft>
                  {firstName} & Me
                </Text>
                <StickerGrid stickers={stickers} onOpen={(stickerId) => router.push(`/sticker/${stickerId}`)} />
              </>
            ) : stickers ? (
              <Text soft testID="person-badges-empty">
                No badges with {firstName} yet. When a conversation opens between you, its sticker can be kept here.
              </Text>
            ) : null}
          </View>
        </ScrollView>
      </Rise>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { alignItems: "flex-start" },
  scroll: { flex: 1 },
  content: { gap: space.xl, paddingTop: space.lg, paddingBottom: space.xl },
  identity: { alignItems: "center", gap: space.md },
  section: { gap: space.md },
  centered: { textAlign: "center" },
});
