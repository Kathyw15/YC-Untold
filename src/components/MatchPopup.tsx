import { useMutation, useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { api } from "@/convex/_generated/api";
import { colors, space } from "@/theme";

import { BreathingButton } from "./BreathingButton";
import { QuietLink } from "./QuietLink";
import { Screen } from "./Screen";
import { Text } from "./Text";

type Proposal = (typeof api.notices.matchProposals)["_returnType"][number];

export function MatchPopup() {
  const proposals = useQuery(api.notices.matchProposals);
  const markRead = useMutation(api.notices.markRead);
  const pathname = usePathname();
  const router = useRouter();
  const [handled, setHandled] = useState<string[]>([]);

  const pending = proposals?.filter((proposal) => !handled.includes(proposal.id)) ?? [];
  const onItsOwnScreen = pending.find((proposal) => pathname === "/match/" + proposal.matchId);
  const current = pending.find((proposal) => proposal !== onItsOwnScreen);

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
        router.push(`/match/${current.matchId}`);
      }}
      onLater={() => settle(current)}
    />
  );
}

type CelebrationProps = {
  social: boolean;
  onOpen: () => void;
  onLater: () => void;
};

const SEAL = 72;
const APART = 64;
const TOGETHER = 20;

function Celebration({ social, onOpen, onLater }: CelebrationProps) {
  const presence = useSharedValue(0);
  const meeting = useSharedValue(0);
  const glow = useSharedValue(0);
  const ripple = useSharedValue(0);
  const words = useSharedValue(0);

  useEffect(() => {
    Keyboard.dismiss();
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    presence.set(withTiming(1, { duration: 400 }));
    meeting.set(withDelay(250, withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) })));
    glow.set(
      withDelay(
        1000,
        withSequence(withTiming(1.5, { duration: 260 }), withTiming(1, { duration: 320, easing: Easing.out(Easing.quad) })),
      ),
    );
    ripple.set(withDelay(1100, withRepeat(withTiming(1, { duration: 2200, easing: Easing.out(Easing.quad) }), -1, false)));
    words.set(withDelay(1100, withTiming(1, { duration: 700 })));
  }, [glow, meeting, presence, ripple, words]);

  const veil = useAnimatedStyle(() => ({ opacity: presence.get() }));
  const left = useAnimatedStyle(() => ({
    transform: [{ translateX: -APART + (APART - TOGETHER) * meeting.get() }],
  }));
  const right = useAnimatedStyle(() => ({
    transform: [{ translateX: APART - (APART - TOGETHER) * meeting.get() }],
  }));
  const core = useAnimatedStyle(() => ({ opacity: Math.min(1, glow.get()), transform: [{ scale: glow.get() }] }));
  const ring = useAnimatedStyle(() => ({
    opacity: 0.7 * (1 - ripple.get()),
    transform: [{ scale: 0.4 + 2.2 * ripple.get() }],
  }));
  const rising = useAnimatedStyle(() => ({
    opacity: words.get(),
    transform: [{ translateY: 12 * (1 - words.get()) }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, veil]} accessibilityViewIsModal>
      <Screen scene="lime" testID="match-popup">
        <View style={styles.middle}>
          <View style={styles.emblem}>
            <Animated.View style={[styles.ring, ring]} />
            <Animated.View style={[styles.seal, left]} />
            <Animated.View style={[styles.seal, right]} />
            <Animated.View style={[styles.core, core]} />
          </View>
          <Animated.View style={[styles.words, rising]}>
            <Text variant="label" soft style={styles.centered}>
              A possible connection
            </Text>
            <Text variant="display" style={styles.centered} testID="match-popup-headline">
              Your words met.
            </Text>
            <Text soft style={[styles.centered, styles.body]}>
              {social
                ? "Your answer and someone else's echo each other. Nothing is shown unless you both say yes."
                : "Someone you wrote to has written to you, too. Nothing is shown unless you both say yes."}
            </Text>
          </Animated.View>
        </View>
        <Animated.View style={[styles.actions, rising]}>
          <BreathingButton testID="match-popup-open" label="See the invitation" onPress={onOpen} />
          <QuietLink testID="match-popup-later" label="Later" onPress={onLater} />
        </Animated.View>
      </Screen>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  middle: { flex: 1, alignItems: "center", justifyContent: "center", gap: space.xl },
  emblem: { width: SEAL * 3, height: SEAL * 2, alignItems: "center", justifyContent: "center" },
  seal: {
    position: "absolute",
    width: SEAL,
    height: SEAL,
    borderRadius: SEAL / 2,
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  core: { position: "absolute", width: 14, height: 14, borderRadius: 7, backgroundColor: colors.ink },
  ring: {
    position: "absolute",
    width: SEAL,
    height: SEAL,
    borderRadius: SEAL / 2,
    borderWidth: 2,
    borderColor: "#BFE04E",
  },
  words: { alignItems: "center", gap: space.sm },
  actions: { gap: space.sm },
  centered: { textAlign: "center" },
  body: { maxWidth: 300 },
});
