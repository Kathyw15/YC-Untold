import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQuery } from "convex/react";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { Easing, FadeIn, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { ToneProvider } from "@/components/Atmosphere";
import { Card } from "@/components/Card";
import { useRemaining } from "@/components/Countdown";
import { IconButton } from "@/components/IconButton";
import { CloudPair, MatchTitle, Pill, SaidCards, Tag, TextLink, timeLeft } from "@/components/MatchParts";
import { gradientFor } from "@/components/QuestionCard";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { StickerArt, type StickerView } from "@/components/Sticker";
import { Text } from "@/components/Text";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { markRevealWitnessed } from "@/lib/reveals";
import { useSession } from "@/lib/session";
import { colors, layout, radius, shadows, space } from "@/theme";

const QUIET = {
  declined: { title: "You let this one pass.", note: "Nothing was shown, and they will never be told." },
  expired: { title: "This invitation has faded.", note: "Nothing was shown to anyone." },
} as const;

export default function MatchScreen() {
  const { id } = useLocalSearchParams<{ id: Id<"matches"> }>();
  const router = useRouter();
  const session = useSession();
  const { status } = session;
  const match = useQuery(api.matches.get, status === "ready" ? { matchId: id } : "skip");
  const respond = useMutation(api.matches.respond);
  const open = useMutation(api.matches.open);
  const collect = useMutation(api.stickers.collect);
  const [busy, setBusy] = useState(false);
  const [collecting, setCollecting] = useState(false);

  const revealed = match?.revealed ?? null;
  const isRevealed = revealed !== null;
  const sticker = useQuery(api.stickers.forMatch, isRevealed ? { matchId: id } : "skip");
  const conversation = revealed?.conversation ?? null;
  const remaining = useRemaining(conversation?.expiresAt);

  useEffect(() => {
    if (!isRevealed) return;
    markRevealWitnessed(id);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [id, isRevealed]);

  async function decide(decision: "accept" | "decline") {
    setBusy(true);
    if (decision === "accept") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await respond({ matchId: id, decision }).finally(() => setBusy(false));
    if (decision === "decline") router.back();
  }

  async function openConversation() {
    if (conversation) return router.replace(`/chat/${conversation.id}`);
    setBusy(true);
    try {
      router.replace(`/chat/${(await open({ matchId: id })).conversationId}`);
    } catch {
      setBusy(false);
    }
  }

  if (status === "loading") return null;
  if (status !== "ready") return <Redirect href="/" />;

  const me = { uri: session.me.avatarUrl, name: session.me.name };
  const first = revealed?.other.name?.trim().split(" ")[0] || "them";

  return (
    <View style={styles.root}>
      <Screen scene="lime" testID="match-screen">
        <View style={styles.nav}>
          {match?.state === "invited" ? (
            <Pressable
              testID="match-back"
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={space.sm}
              onPress={() => router.back()}
              style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
              <Ionicons name="close-outline" size={30} color={colors.ink} />
            </Pressable>
          ) : (
            <IconButton icon="chevron-back" label="Back" onPress={() => router.back()} testID="match-back" />
          )}
        </View>

        {match?.state === "invited" ? (
          <>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <Rise>
                <CloudPair size={178} left={me} right={{ mystery: true }} style={styles.cloudsInvited} />
              </Rise>
              <Rise order={1}>
                <MatchTitle text="It’s a Match" testID="match-state" style={styles.titleInvited} />
              </Rise>
              <Rise order={2}>
                {match.type === "social" ? (
                  <>
                    <Text style={[styles.centered, styles.lead]}>
                      Someone’s answer to the question resonated with yours. Want to reveal and start a conversation?
                    </Text>
                    {match.question ? (
                      <View style={styles.chip}>
                        <LinearGradient
                          colors={gradientFor(id)}
                          start={{ x: 0.35, y: 0 }}
                          end={{ x: 0.65, y: 1 }}
                          style={styles.thumb}
                        />
                        <View style={styles.grow}>
                          <Text variant="label" soft>
                            A question you answered
                          </Text>
                          <Text style={styles.chipText} numberOfLines={3}>
                            {match.question}
                          </Text>
                        </View>
                      </View>
                    ) : null}
                  </>
                ) : (
                  <Text style={[styles.centered, styles.lead]}>
                    You and someone who knows you both left a Seal.{"\n"}Want to reveal and start a conversation?
                  </Text>
                )}
              </Rise>
            </ScrollView>
            <View style={styles.foot}>
              <Pill testID="match-accept" label="Reveal & Chat" arrow disabled={busy} onPress={() => void decide("accept")} />
              <TextLink testID="match-decline" label="Keep private" disabled={busy} onPress={() => void decide("decline")} />
              <Text variant="caption" soft style={[styles.centered, styles.promise]}>
                We only show who it is if you both say yes.
              </Text>
            </View>
          </>
        ) : null}

        {match && match.state !== "invited" && match.state !== "revealed" ? (
          <>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <Rise>
                <CloudPair size={168} left={me} right={{ mystery: true }} burstOpacity={0.35} style={styles.cloudsWaiting} />
              </Rise>
              <Rise order={1}>
                <Text variant="hero" style={[styles.centered, styles.waiting]} testID="match-state">
                  {match.state === "waiting" ? "Waiting…" : QUIET[match.state].title}
                </Text>
              </Rise>
              <Rise order={2}>
                <Text style={[styles.centered, styles.waitingLead]}>
                  {match.state === "waiting" ? "If they say yes too, you’ll both see who it is." : QUIET[match.state].note}
                </Text>
                {match.state === "waiting" ? (
                  <Text variant="caption" soft style={[styles.centered, styles.waitingNote]}>
                    If nothing happens within 7 days, this quietly closes.
                  </Text>
                ) : null}
              </Rise>
            </ScrollView>
            <View style={styles.foot}>
              <Pill
                testID={match.state === "waiting" ? "match-to-conversations" : "match-done"}
                label="Back to Conversations"
                onPress={() => router.back()}
              />
            </View>
          </>
        ) : null}

        {match && revealed ? (
          <>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <Rise>
                <CloudPair
                  size={128}
                  left={me}
                  right={{
                    uri: revealed.other.avatarUrl,
                    emoji: revealed.other.avatarEmoji,
                    name: revealed.other.name,
                    mystery: true,
                    revealing: true,
                  }}
                  style={styles.cloudsRevealed}
                />
              </Rise>
              <Rise order={1}>
                <MatchTitle
                  text={"It’s " + first + "!"}
                  size={44}
                  underline={170}
                  sparkle={38}
                  testID="match-state"
                  style={styles.titleRevealed}
                />
                <Text style={[styles.centered, styles.revealLead]}>
                  {match.type === "social" && match.question
                    ? "You both answered “" + match.question + "”"
                    : "You and " + first + " both left a Seal."}
                </Text>
              </Rise>
              <Rise order={2}>
                <SaidCards
                  mine={revealed.mine}
                  theirs={revealed.theirs}
                  name={first}
                  mineTestID="match-mine"
                  theirsTestID="match-theirs"
                  style={styles.said}
                />
              </Rise>
              {sticker ? (
                <Rise order={3}>
                  <Card horizontal testID="sticker-keepsake">
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Open sticker"
                      onPress={() => router.push(`/sticker/${sticker.id}`)}
                      style={styles.tilted}>
                      <StickerArt sticker={sticker} size={84} />
                    </Pressable>
                    <View style={styles.grow}>
                      <Text variant="label" soft>
                        <Text variant="label" soft testID="sticker-title">
                          {sticker.title}
                        </Text>
                        {" · what you share"}
                      </Text>
                      {revealed.theme ? <Text style={styles.theme}>{revealed.theme}</Text> : null}
                      <View style={styles.collect}>
                        {sticker.collected ? (
                          <Tag tone="lime" icon="checkmark" label="In your Badges" testID="sticker-collected" />
                        ) : (
                          <Pill
                            small
                            testID="sticker-collect"
                            icon="sparkles"
                            label="Collect sticker"
                            onPress={() => {
                              setCollecting(true);
                              void collect({ stickerId: sticker.id });
                            }}
                          />
                        )}
                      </View>
                    </View>
                  </Card>
                </Rise>
              ) : null}
            </ScrollView>
            <View style={styles.foot}>
              <Pill
                testID="match-open-chat"
                label={conversation ? "Back to conversation" : "Open conversation"}
                arrow
                disabled={busy}
                onPress={() => void openConversation()}
              />
              {conversation ? (
                <Text variant="caption" soft style={[styles.centered, styles.window]}>
                  {remaining ? timeLeft(remaining) + " left" : "This conversation has ended."}
                </Text>
              ) : (
                <Text variant="caption" soft style={[styles.centered, styles.window]} testID="match-window-note">
                  You’ll have 24 hours, starting when the conversation opens.
                </Text>
              )}
            </View>
          </>
        ) : null}
      </Screen>

      {collecting && sticker ? (
        <Collected
          sticker={sticker}
          name={first}
          busy={busy}
          onOpen={() => void openConversation()}
          onClose={() => setCollecting(false)}
        />
      ) : null}
    </View>
  );
}

type CollectedProps = {
  sticker: StickerView;
  name: string;
  busy: boolean;
  onOpen: () => void;
  onClose: () => void;
};

function Collected({ sticker, name, busy, onOpen, onClose }: CollectedProps) {
  const pop = useSharedValue(0);
  useEffect(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    pop.set(withTiming(1, { duration: 700, easing: Easing.bezier(0.2, 1.5, 0.4, 1) }));
  }, [pop]);
  const popping = useAnimatedStyle(() => ({
    opacity: Math.min(1, pop.get() * 2),
    transform: [{ scale: 0.4 + 0.6 * pop.get() }, { rotate: -14 * (1 - pop.get()) + "deg" }],
  }));

  return (
    <Animated.View entering={FadeIn.duration(260)} style={StyleSheet.absoluteFill} testID="sticker-collected-overlay">
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <ToneProvider tone="dark">
        <View style={styles.overlay}>
          <Tag tone="lime" icon="sparkles" label="New sticker" large />
          <Animated.View style={[styles.pop, popping]}>
            <StickerArt sticker={sticker} size={200} />
          </Animated.View>
          <Text variant="display" style={styles.centered}>
            {sticker.title}
          </Text>
          <Text soft style={[styles.centered, styles.added]}>
            Added to your Badges. {name} gets one too.
          </Text>
          <View style={styles.overlayActions}>
            <Pill testID="collected-open-chat" variant="white" label="Open conversation" arrow disabled={busy} onPress={onOpen} />
            <TextLink testID="collected-keep-looking" ghost label="Keep looking" onPress={onClose} />
          </View>
        </View>
      </ToneProvider>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  nav: { height: 40, flexDirection: "row", alignItems: "center" },
  close: { width: 40, height: 40, alignItems: "center", justifyContent: "center", marginLeft: -6 },
  pressed: { opacity: 0.5 },
  scroll: { flex: 1, marginHorizontal: -layout.screenPadding },
  content: { paddingHorizontal: layout.screenPadding + 4, paddingBottom: space.md },
  grow: { flex: 1, minWidth: 0 },
  centered: { textAlign: "center" },
  cloudsInvited: { marginTop: 52 },
  titleInvited: { marginTop: 40 },
  lead: { marginTop: 20, color: colors.ink },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
    backgroundColor: "rgba(255, 255, 255, 0.62)",
    boxShadow: shadows.card,
  },
  thumb: { width: 56, height: 56, borderRadius: radius.thumb },
  chipText: { fontSize: 15, lineHeight: 20, fontWeight: "600", marginTop: 2 },
  cloudsWaiting: { marginTop: 62 },
  waiting: { marginTop: 44 },
  waitingLead: { marginTop: 12, color: colors.ink },
  waitingNote: { marginTop: 14 },
  cloudsRevealed: { marginTop: 48 },
  titleRevealed: { marginTop: 20 },
  revealLead: { marginTop: 10, color: colors.ink },
  said: { marginTop: 30, marginBottom: 10 },
  tilted: { transform: [{ rotate: "-6deg" }] },
  theme: { fontSize: 15, lineHeight: 20, fontWeight: "600", marginTop: 3 },
  collect: { marginTop: 10, alignItems: "flex-start" },
  foot: { paddingTop: 10, gap: 2 },
  window: { marginTop: 10 },
  promise: { marginTop: -4 },
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: "rgba(14, 14, 24, 0.62)",
  },
  pop: { marginTop: 26, marginBottom: 16 },
  added: { marginTop: 8 },
  overlayActions: { alignSelf: "stretch", marginTop: 22, gap: 4 },
});
