import { useMutation, useQuery } from "convex/react";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import { QuietLink } from "@/components/QuietLink";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { StickerKeepsake } from "@/components/Sticker";
import { Text } from "@/components/Text";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useSession } from "@/lib/session";
import { space } from "@/theme";

export default function StickerScreen() {
  const { id } = useLocalSearchParams<{ id: Id<"stickers"> }>();
  const router = useRouter();
  const { status } = useSession();
  const sticker = useQuery(api.stickers.get, status === "ready" ? { stickerId: id } : "skip");
  const collect = useMutation(api.stickers.collect);

  if (status === "loading") return null;
  if (status !== "ready") return <Redirect href="/" />;

  return (
    <Screen scene="wheat" testID="sticker-screen">
      <View style={styles.back}>
        <QuietLink label="Back" onPress={() => router.back()} testID="sticker-back" />
      </View>
      {sticker ? (
        <Rise style={styles.scroll}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text variant="label" soft style={styles.centered}>
              Badge
            </Text>
            <StickerKeepsake sticker={sticker} size={240} onCollect={() => void collect({ stickerId: id })} />
            <View style={styles.facts}>
              <Text variant="caption" soft style={styles.centered} testID="sticker-date">
                {new Date(sticker.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
              <Text style={styles.centered} testID="sticker-origin">
                From your conversation with {sticker.other.name}
              </Text>
              <Text variant="caption" soft style={styles.centered}>
                {sticker.question
                  ? "You both answered: " + sticker.question
                  : "It began with two sealed messages that reached for each other."}
              </Text>
            </View>
            {sticker.conversationId ? (
              <QuietLink
                testID="sticker-open-chat"
                label="Open the conversation"
                onPress={() => router.push(`/chat/${sticker.conversationId}`)}
              />
            ) : null}
          </ScrollView>
        </Rise>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { alignItems: "flex-start" },
  scroll: { flex: 1 },
  content: { gap: space.lg, paddingTop: space.lg, paddingBottom: space.xl },
  facts: { gap: space.xs },
  centered: { textAlign: "center" },
});
