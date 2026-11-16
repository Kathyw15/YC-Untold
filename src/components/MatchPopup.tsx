import { useMutation, useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";

import { api } from "@/convex/_generated/api";
import { useSealingOpen } from "@/lib/sealing";
import { useSession } from "@/lib/session";
import { colors, space } from "@/theme";

import { CloudFrame } from "./CloudFrame";
import { Burst, MatchTitle, Pill, TextLink } from "./MatchParts";
import { Screen } from "./Screen";
import { Text } from "./Text";

type Proposal = (typeof api.notices.matchProposals)["_returnType"][number];

export function MatchPopup() {
  const proposals = useQuery(api.notices.matchProposals);
  const markRead = useMutation(api.notices.markRead);
  const pathname = usePathname();
  const router = useRouter();
  const [handled, setHandled] = useState<string[]>([]);
  const sealing = useSealingOpen();
  const respond = useMutation(api.matches.respond);

  const pending = proposals?.filter((proposal) => !handled.includes(proposal.id)) ?? [];
  const onItsOwnScreen = pending.find((proposal) => pathname === "/match/" + proposal.matchId);
  const current = sealing ? undefined : pending.find((proposal) => proposal !== onItsOwnScreen);

  function settle(proposal: Proposal) {
    setHandled((ids) => [...ids, proposal.id]);
    void markRead({ noticeIds: [proposal.id] });
  }

  useEffect(() => {
    if (onItsOwnScreen) settle(onItsOwnScreen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onItsOwnScreen?.id]);

  if (!current) return null;
  return (
    <Celebration
      key={current.id}
      social={current.type === "social"}
      onOpen={() => {
        settle(current);
        void respond({ matchId: current.matchId, decision: "accept" }).finally(() => router.push(`/match/${current.matchId}`));
      }}
      onLater={() => {
        settle(current);
        void respond({ matchId: current.matchId, decision: "decline" });
      }}
    />
  );
}

type CelebrationProps = {
  social: boolean;
  onOpen: () => void;
  onLater: () => void;
};

const CLOUD = 168;
const APART = 44;

function Celebration({ social, onOpen, onLater }: CelebrationProps) {
  const session = useSession();
  const me = session.status === "ready" ? session.me : null;
  const presence = useSharedValue(0);
  const meeting = useSharedValue(0);
  const spark = useSharedValue(0);
  const words = useSharedValue(0);

  useEffect(() => {
    Keyboard.dismiss();
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    presence.set(withTiming(1, { duration: 400 }));
    meeting.set(withDelay(250, withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) })));
    spark.set(withDelay(1000, withTiming(1, { duration: 320, easing: Easing.out(Easing.quad) })));
    words.set(withDelay(1100, withTiming(1, { duration: 700 })));
  }, [meeting, presence, spark, words]);

  const veil = useAnimatedStyle(() => ({ opacity: presence.get() }));
  const left = useAnimatedStyle(() => ({ transform: [{ translateX: -APART * (1 - meeting.get()) }] }));
  const right = useAnimatedStyle(() => ({ transform: [{ translateX: APART * (1 - meeting.get()) }] }));
  const burst = useAnimatedStyle(() => ({
    opacity: spark.get(),
    transform: [{ translateY: 8 * (1 - spark.get()) }, { scale: 0.6 + 0.4 * spark.get() }],
  }));
  const rising = useAnimatedStyle(() => ({
    opacity: words.get(),
    transform: [{ translateY: 12 * (1 - words.get()) }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, veil]} accessibilityViewIsModal>
      <Screen scene="lime" testID="match-popup">
        <View style={styles.middle}>
          <View style={styles.pair}>
            <Animated.View style={[styles.burst, burst]}>
              <Burst />
            </Animated.View>
            <Animated.View style={left}>
              <CloudFrame size={CLOUD} uri={me?.avatarUrl} name={me?.name} />
            </Animated.View>
            <Animated.View style={[styles.overlap, right]}>
              <CloudFrame size={CLOUD} variant="b" mystery />
            </Animated.View>
          </View>
          <Animated.View style={[styles.words, rising]}>
            <MatchTitle text="It’s a Match" testID="match-popup-headline" />
            <Text style={[styles.centered, styles.body]}>
              {social
                ? "Someone’s answer to the question resonated with yours."
                : "You and someone who knows you both left a Seal."}
            </Text>
          </Animated.View>
        </View>
        <Animated.View style={[styles.actions, rising]}>
          <Pill testID="match-popup-open" label="Reveal & Chat" arrow onPress={onOpen} />
          <TextLink testID="match-popup-later" label="Not now" onPress={onLater} />
          <Text variant="caption" soft style={styles.centered}>
            We only show who it is if you both say yes.
          </Text>
        </Animated.View>
      </Screen>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  middle: { flex: 1, alignItems: "center", justifyContent: "center", gap: 44 },
  pair: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  burst: { position: "absolute", left: "50%", marginLeft: -24, top: -46 },
  overlap: { marginLeft: -26 },
  words: { alignItems: "center", gap: space.md },
  actions: { gap: 2 },
  centered: { textAlign: "center" },
  body: { maxWidth: 300, color: colors.ink },
});
