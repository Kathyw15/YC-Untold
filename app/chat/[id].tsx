import { useMutation, useQuery } from "convex/react";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";

import { Countdown, useRemaining } from "@/components/Countdown";
import { QuietLink } from "@/components/QuietLink";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { StickerArt } from "@/components/Sticker";
import { Text } from "@/components/Text";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useSession } from "@/lib/session";
import { colors, radius, space, tones, type } from "@/theme";

const tone = tones.light;

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: Id<"conversations"> }>();
  const router = useRouter();
  const { status } = useSession();
  const chat = useQuery(api.chat.list, status === "ready" ? { conversationId: id } : "skip");
  const sticker = useQuery(api.stickers.forMatch, chat ? { matchId: chat.matchId } : "skip");
  const send = useMutation(api.chat.send);
  const [draft, setDraft] = useState("");
  const remaining = useRemaining(chat?.expiresAt);
  const closed = chat?.closed || remaining === 0;
  const body = draft.trim();

  function onSend() {
    if (!body || closed) return;
    setDraft("");
    send({ conversationId: id, body }).catch(() => setDraft(body));
  }

  if (status === "loading") return null;
  if (status !== "ready") return <Redirect href="/" />;

  return (
    <Screen scene="cloud" testID="chat-screen">
      <View style={styles.header}>
        <QuietLink label="Back" onPress={() => router.back()} testID="chat-back" />
        {chat ? <Countdown testID="chat-countdown" expiresAt={chat.expiresAt} suffix=" left" /> : null}
      </View>
      {chat ? (
        <>
          <Rise style={styles.title}>
            <View style={styles.who}>
              <Text variant="title" testID="chat-name">
                {chat.other.name}
              </Text>
              {sticker && sticker.status !== "pending" ? (
                <Text variant="caption" soft numberOfLines={1} testID="chat-sticker-title">
                  {sticker.title}
                </Text>
              ) : null}
            </View>
            {sticker ? (
              <Pressable
                testID="chat-sticker"
                accessibilityRole="button"
                accessibilityLabel="Open sticker"
                disabled={sticker.status === "pending"}
                onPress={() => router.push(`/sticker/${sticker.id}`)}>
                <StickerArt sticker={sticker} size={64} />
              </Pressable>
            ) : null}
          </Rise>
          <FlatList
            inverted
            style={styles.list}
            contentContainerStyle={styles.messages}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            data={chat.messages.toReversed()}
            keyExtractor={(message) => message.id}
            renderItem={({ item }) => (
              <View style={[styles.bubble, item.mine ? styles.mine : styles.theirs]}>
                <Text>{item.body}</Text>
              </View>
            )}
            ListFooterComponent={
              <View style={styles.opening}>
                <Text variant="label" soft>
                  Where this began
                </Text>
                <Text variant="quote" style={styles.openingTheirs}>
                  {chat.opening.theirs}
                </Text>
                <Text variant="quote" style={styles.openingMine}>
                  {chat.opening.mine}
                </Text>
              </View>
            }
          />
          {closed ? (
            <View style={styles.closed} testID="chat-closed">
              <Text variant="quote" style={styles.centered}>
                This conversation has closed.
              </Text>
              <Text variant="caption" soft style={styles.centered}>
                What you said to each other stays here.
              </Text>
            </View>
          ) : (
            <View style={styles.composer}>
              <TextInput
                testID="chat-input"
                accessibilityLabel="Message"
                value={draft}
                onChangeText={setDraft}
                placeholder="Say it"
                placeholderTextColor={tone.textMute}
                selectionColor={colors.pink}
                multiline
                style={[type.body, styles.input]}
              />
              <Pressable
                testID="chat-send"
                accessibilityRole="button"
                accessibilityLabel="Send"
                disabled={!body}
                hitSlop={space.md}
                onPress={onSend}
                style={({ pressed }) => ({ opacity: !body ? 0.35 : pressed ? 0.5 : 1 })}>
                <Text variant="button">Send</Text>
              </Pressable>
            </View>
          )}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { flexDirection: "row", alignItems: "center", gap: space.md },
  who: { flex: 1 },
  list: { flex: 1, marginTop: space.md },
  messages: { gap: space.sm, paddingVertical: space.md },
  bubble: {
    maxWidth: "82%",
    paddingVertical: space.sm + 2,
    paddingHorizontal: space.md,
    borderRadius: radius.bubble,
  },
  mine: { alignSelf: "flex-end", backgroundColor: colors.lilac, borderBottomRightRadius: 7 },
  theirs: { alignSelf: "flex-start", backgroundColor: colors.white, borderBottomLeftRadius: 7 },
  opening: { gap: space.sm, paddingBottom: space.lg },
  openingTheirs: { paddingRight: space.xl },
  openingMine: { textAlign: "right", paddingLeft: space.xl },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: space.md,
    paddingTop: space.md,
    borderTopWidth: StyleSheet.hairlineWidth * 2,
    borderTopColor: tone.hairline,
  },
  input: { flex: 1, maxHeight: 120, paddingVertical: 0, color: colors.ink },
  closed: { gap: space.xs, paddingTop: space.lg },
  centered: { textAlign: "center" },
});
