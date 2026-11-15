import { useMutation, useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { type ReactNode, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";

import { Breathing } from "@/components/Breathing";
import { BreathingButton } from "@/components/BreathingButton";
import { Countdown, useRemaining } from "@/components/Countdown";
import { QuietLink } from "@/components/QuietLink";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { Sealed } from "@/components/Sealed";
import { StickerKeepsake } from "@/components/Sticker";
import { Text } from "@/components/Text";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { markRevealWitnessed } from "@/lib/reveals";
import { useSession } from "@/lib/session";
import { colors, space } from "@/theme";

const COPY = {
  invited: {
    label: "A possible connection",
    direct: "Someone wrote to you, too.",
    social: "Another answer echoes yours.",
    note: "If you both say yes, your words and your names are shown to each other, and you can open a conversation that lasts 24 hours. If either of you doesn't, nothing is ever shown.",
  },
  waiting: {
    label: "Waiting",
    direct: "You said yes.",
    social: "You said yes.",
    note: "Now it rests with them. Nothing is shown unless they say yes too. If nothing happens within 7 days, this quietly closes.",
  },
  declined: {
    label: "Let go",
    direct: "You let this one pass.",
    social: "You let this one pass.",
    note: "Nothing was shown, and they will never be told.",
  },
  expired: {
    label: "Faded",
    direct: "This invitation has faded.",
    social: "This invitation has faded.",
    note: "Nothing was shown to anyone.",
  },
} as const;

export default function MatchScreen() {
  const { id } = useLocalSearchParams<{ id: Id<"matches"> }>();
  const router = useRouter();
  const { status } = useSession();
  const match = useQuery(api.matches.get, status === "ready" ? { matchId: id } : "skip");
  const respond = useMutation(api.matches.respond);
  const open = useMutation(api.matches.open);
  const collect = useMutation(api.stickers.collect);
  const [busy, setBusy] = useState(false);

  const revealed = match?.revealed ?? null;
  const isRevealed = revealed !== null;
  const sticker = useQuery(api.stickers.forMatch, isRevealed ? { matchId: id } : "skip");
  const conversation = revealed?.conversation ?? null;
  const remaining = useRemaining(conversation?.expiresAt);
  const copy = match && match.state !== "revealed" ? COPY[match.state] : null;

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

  return (
    <Screen scene={isRevealed ? "wheat" : "mist"} testID="match-screen">
      <View style={styles.back}>
        <QuietLink label="Back" onPress={() => router.back()} testID="match-back" />
      </View>
      {match ? (
        <Rise style={styles.scroll}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.heading}>
              <Text variant="label" soft testID="match-state">
                {copy ? copy.label : "You both said yes"}
              </Text>
              <Text variant="display">{copy ? copy[match.type] : "It's " + revealed?.other.name + "."}</Text>
            </View>

            {match.question ? <Text soft>{match.question}</Text> : null}

            <Breathing active={match.state === "invited" || match.state === "waiting"} scale={0.015} dim={0.15}>
              <Sealed open={isRevealed}>
                <Text variant="label" soft>
                  You wrote
                </Text>
                <Text variant="quote" testID="match-mine">
                  {revealed ? revealed.mine : "Something you meant, and kept."}
                </Text>
                <View style={[styles.thread, isRevealed && styles.threadLit]} />
                <Text variant="label" soft>
                  {revealed ? revealed.other.name + " wrote" : "They wrote"}
                </Text>
                <Text variant="quote" testID="match-theirs">
                  {revealed ? revealed.theirs : "Something they meant, and kept from you."}
                </Text>
              </Sealed>
            </Breathing>

            {revealed ? (
              <Afterward>
                <Text variant="caption" soft style={styles.centered}>
                  {revealed.theme}
                </Text>
                {sticker ? (
                  <StickerKeepsake
                    sticker={sticker}
                    onCollect={() => void collect({ stickerId: sticker.id })}
                    onOpen={() => router.push(`/sticker/${sticker.id}`)}
                  />
                ) : null}
                <BreathingButton
                  testID="match-open-chat"
                  label={remaining === 0 ? "Read the conversation" : "Open the conversation"}
                  disabled={busy}
                  onPress={() => void openConversation()}
                />
                {conversation ? (
                  <Countdown
                    expiresAt={conversation.expiresAt}
                    suffix=" left to talk"
                    closedLabel="The conversation has closed."
                    style={styles.centered}
                  />
                ) : (
                  <Text variant="caption" soft style={styles.centered} testID="match-window-note">
                    You'll have 24 hours, starting when the conversation opens.
                  </Text>
                )}
              </Afterward>
            ) : (
              <View style={styles.after}>
                <Text soft>{copy?.note}</Text>
                {match.state === "invited" ? (
                  <>
                    <BreathingButton
                      testID="match-accept"
                      label="Reveal if they agree"
                      disabled={busy}
                      onPress={() => void decide("accept")}
                    />
                    <QuietLink
                      testID="match-decline"
                      label="Not now"
                      disabled={busy}
                      onPress={() => void decide("decline")}
                    />
                    <Text variant="caption" soft style={styles.centered}>
                      If you choose Not now, they won't be told.
                    </Text>
                  </>
                ) : null}
                {match.state === "waiting" ? (
                  <QuietLink testID="match-to-conversations" label="Back to Conversations" onPress={() => router.back()} />
                ) : null}
              </View>
            )}
          </ScrollView>
        </Rise>
      ) : null}
    </Screen>
  );
}

function Afterward({ children }: { children: ReactNode }) {
  const presence = useSharedValue(0);
  useEffect(() => {
    presence.set(withDelay(3400, withTiming(1, { duration: 1200 })));
  }, [presence]);
  const style = useAnimatedStyle(() => ({ opacity: presence.get() }));
  return <Animated.View style={[styles.after, style]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  back: { alignItems: "flex-start" },
  scroll: { flex: 1 },
  content: { gap: space.lg, paddingTop: space.lg, paddingBottom: space.xl },
  heading: { gap: space.sm },
  thread: {
    height: StyleSheet.hairlineWidth * 2,
    width: 48,
    marginVertical: space.sm,
    backgroundColor: colors.inkSoft,
    opacity: 0.3,
  },
  threadLit: { height: 2, backgroundColor: colors.wheat, opacity: 1 },
  after: { gap: space.lg },
  centered: { textAlign: "center" },
});
