import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text as PlainText, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/Avatar";
import { useRemaining } from "@/components/Countdown";
import { SaidCards, timeLeft } from "@/components/MatchParts";
import { Screen } from "@/components/Screen";
import { StickerArt } from "@/components/Sticker";
import { Text } from "@/components/Text";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { shortDate } from "@/lib/dates";
import { useSession } from "@/lib/session";
import { colors, shadows, space, type } from "@/theme";

const DAY_MS = 24 * 60 * 60 * 1000;
const webInput = { outlineStyle: "none" } as object;

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: Id<"conversations"> }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  const first = chat?.other.name?.trim().split(" ")[0] || "";
  const unlockedAt = chat ? chat.expiresAt - DAY_MS : 0;
  const unlockedDay = new Date(unlockedAt).toDateString() === new Date().toDateString() ? "Today" : shortDate(unlockedAt);

  return (
    <Screen
      scene="base"
      testID="chat-screen"
      contentStyle={{ backgroundColor: colors.white, paddingHorizontal: 0, paddingTop: insets.top + 6, paddingBottom: insets.bottom + space.sm }}>
      <View style={styles.header}>
        <Pressable
          testID="chat-back"
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={space.sm}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.plain, pressed && styles.pressed]}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        {chat ? (
          <>
            <Avatar uri={chat.other.avatarUrl} emoji={chat.other.avatarEmoji} name={chat.other.name} size={42} />
            <View style={styles.who}>
              <Text style={styles.title} numberOfLines={1} testID={sticker ? "chat-sticker-title" : undefined}>
                {sticker?.title ?? chat.other.name}
              </Text>
              <Text variant="caption" soft numberOfLines={1}>
                <PlainText testID="chat-name">{first}</PlainText>
                {" · "}
                <PlainText testID="chat-countdown">{closed ? "Ended" : timeLeft(remaining ?? 0) + " left"}</PlainText>
              </Text>
            </View>
            {sticker ? (
              <Pressable
                testID="chat-sticker"
                accessibilityRole="button"
                accessibilityLabel="Open sticker"
                onPress={() => router.push(`/sticker/${sticker.id}`)}
                style={({ pressed }) => [styles.round, pressed && styles.pressed]}>
                <StickerArt sticker={sticker} size={28} />
              </Pressable>
            ) : null}
            <View style={styles.plain} accessibilityLabel="More">
              <Ionicons name="ellipsis-horizontal" size={22} color={colors.ink} />
            </View>
          </>
        ) : null}
      </View>
      {chat ? (
        <>
          <FlatList
            inverted
            style={styles.list}
            contentContainerStyle={styles.messages}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            data={chat.messages.toReversed()}
            keyExtractor={(message) => message.id}
            renderItem={({ item }) =>
              item.mine ? (
                <LinearGradient colors={["#4F96FF", "#2F7CF6"]} style={[styles.bubble, styles.mine]}>
                  <Text style={[styles.bubbleText, styles.mineText]}>{item.body}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.theirRow}>
                  <Avatar uri={chat.other.avatarUrl} emoji={chat.other.avatarEmoji} name={chat.other.name} size={30} />
                  <View style={[styles.bubble, styles.theirs]}>
                    <Text style={styles.bubbleText}>{item.body}</Text>
                  </View>
                </View>
              )
            }
            ListFooterComponent={
              <View style={styles.opening}>
                <SaidCards mine={chat.opening.mine} theirs={chat.opening.theirs} name={first} minHeight={150} sparkle={44} />
                <Text variant="caption" soft style={styles.unlocked}>
                  Conversation unlocked · {unlockedDay}
                </Text>
              </View>
            }
          />
          {closed ? (
            <View style={styles.ended} testID="chat-closed">
              <Text soft style={styles.endedText}>
                This conversation has ended.
              </Text>
            </View>
          ) : (
            <View style={styles.composer}>
              <TextInput
                testID="chat-input"
                accessibilityLabel="Message"
                value={draft}
                onChangeText={setDraft}
                placeholder="Message…"
                placeholderTextColor="#8E8E96"
                selectionColor={colors.blue}
                multiline
                rows={1}
                style={[type.row, styles.input, Platform.OS === "web" && webInput]}
              />
              {body ? (
                <Pressable
                  testID="chat-send"
                  accessibilityRole="button"
                  accessibilityLabel="Send"
                  hitSlop={space.sm}
                  onPress={onSend}
                  style={({ pressed }) => [styles.send, pressed && styles.pressed]}>
                  <Ionicons name="arrow-up" size={20} color={colors.white} />
                </Pressable>
              ) : null}
            </View>
          )}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 52,
    paddingLeft: 8,
    paddingRight: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  plain: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  round: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.95)",
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    boxShadow: shadows.card,
  },
  pressed: { opacity: 0.5 },
  who: { flex: 1, minWidth: 0 },
  title: { fontSize: 17, lineHeight: 21, fontWeight: "700", letterSpacing: -0.34 },
  list: { flex: 1 },
  messages: { flexGrow: 1, justifyContent: "flex-end", paddingHorizontal: 16, paddingVertical: space.sm, gap: space.sm },
  opening: { paddingTop: 28 },
  unlocked: { textAlign: "center", fontWeight: "500", marginTop: 20, marginBottom: 6 },
  bubble: { maxWidth: "74%", paddingVertical: 11, paddingHorizontal: 15, borderRadius: 22 },
  bubbleText: { fontSize: 16, lineHeight: 22, letterSpacing: -0.16 },
  mine: { alignSelf: "flex-end", borderBottomRightRadius: 7 },
  mineText: { color: colors.white },
  theirRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  theirs: { backgroundColor: colors.bubble, borderBottomLeftRadius: 7, flexShrink: 1 },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    minHeight: 46,
    marginHorizontal: 16,
    marginTop: 8,
    paddingLeft: 18,
    paddingRight: 5,
    paddingVertical: 5,
    borderRadius: 23,
    backgroundColor: "#EFEFF3",
  },
  input: { flex: 1, minHeight: 36, maxHeight: 120, paddingVertical: 7, fontWeight: "400", color: colors.ink },
  send: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.blue,
  },
  ended: {
    marginHorizontal: 16,
    marginTop: 6,
    padding: 14,
    borderRadius: 999,
    backgroundColor: "#F0F0F4",
  },
  endedText: { textAlign: "center", fontSize: 14, lineHeight: 18, fontWeight: "500" },
});
