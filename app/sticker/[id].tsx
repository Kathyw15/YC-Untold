import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { Card } from "@/components/Card";
import { IconButton } from "@/components/IconButton";
import { Pill } from "@/components/MatchParts";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { StickerArt } from "@/components/Sticker";
import { Text } from "@/components/Text";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { shortDate } from "@/lib/dates";
import { useSession } from "@/lib/session";
import { STICKER_IMAGES } from "@/lib/stickerImages";
import { space } from "@/theme";

export default function StickerScreen() {
  const { id } = useLocalSearchParams<{ id: Id<"stickers"> }>();
  const router = useRouter();
  const { status } = useSession();
  const sticker = useQuery(api.stickers.get, status === "ready" ? { stickerId: id } : "skip");
  const collect = useMutation(api.stickers.collect);

  if (status === "loading") return null;
  if (status !== "ready") return <Redirect href="/" />;

  const first = sticker?.other.name?.trim().split(" ")[0] || "them";
  const today = sticker ? new Date(sticker.createdAt).toDateString() === new Date().toDateString() : false;

  return (
    <Screen scene="aurora" testID="sticker-screen">
      <View style={styles.back}>
        <IconButton icon="chevron-back" label="Back" onPress={() => router.back()} testID="sticker-back" />
      </View>
      {sticker ? (
        <>
          <Rise style={styles.scroll}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.stage} testID="sticker-keepsake">
                <Image source={STICKER_IMAGES.sparkles} style={styles.sparkle} contentFit="contain" />
                <StickerArt sticker={sticker} size={250} />
              </View>
              <Text variant="display" style={[styles.centered, styles.title]} testID="sticker-title">
                {sticker.title}
              </Text>
              <View testID={sticker.collected ? "sticker-collected" : undefined}>
                <Text soft style={[styles.centered, styles.when]} testID="sticker-date">
                  {(sticker.collected ? "Collected " + (today ? "today" : "on " + shortDate(sticker.createdAt)) : "Not collected yet") +
                    " · with " +
                    first}
                </Text>
              </View>
              {sticker.collected ? null : (
                <View style={styles.collect}>
                  <Pill
                    small
                    testID="sticker-collect"
                    icon="sparkles"
                    label="Collect sticker"
                    onPress={() => void collect({ stickerId: id })}
                  />
                </View>
              )}
              <Card horizontal>
                <Avatar uri={sticker.other.avatarUrl} emoji={sticker.other.avatarEmoji} name={sticker.other.name} size={48} />
                <View style={styles.grow}>
                  <Text variant="label" soft testID="sticker-origin">
                    From your conversation with {first}
                  </Text>
                  {sticker.theme ? (
                    <Text style={styles.theme} testID="sticker-theme">
                      {sticker.theme}
                    </Text>
                  ) : null}
                </View>
              </Card>
            </ScrollView>
          </Rise>
          {sticker.conversationId ? (
            <Pill
              testID="sticker-open-chat"
              icon="chatbox-ellipses-outline"
              label="View conversation"
              onPress={() => router.push(`/chat/${sticker.conversationId}`)}
            />
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { alignItems: "flex-start" },
  scroll: { flex: 1, marginHorizontal: -6 },
  content: { paddingHorizontal: 6, paddingBottom: space.lg },
  stage: { height: 290, alignItems: "center", paddingTop: 20 },
  sparkle: { position: "absolute", left: 24, top: 40, width: 46, height: 46 },
  centered: { textAlign: "center" },
  title: { fontSize: 38, lineHeight: 42, letterSpacing: -1.14 },
  when: { marginTop: 12, marginBottom: 16 },
  collect: { alignItems: "center", marginBottom: 16 },
  grow: { flex: 1, minWidth: 0 },
  theme: { fontWeight: "600", lineHeight: 23, marginTop: 3 },
});
