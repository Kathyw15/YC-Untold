import { Pressable, StyleSheet, View } from "react-native";

import { colors, radius, space, tones } from "@/theme";

import { useTone } from "./Atmosphere";
import { Breathing } from "./Breathing";
import { Rise } from "./Rise";
import { Text } from "./Text";

type SealedNoticeProps = {
  several: boolean;
  unread: boolean;
  onPress: () => void;
};

export function SealedNotice({ several, unread, onPress }: SealedNoticeProps) {
  const tone = tones[useTone()];
  return (
    <Rise>
      <Pressable
        testID="sealed-notice"
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          { borderColor: tone.hairline, backgroundColor: tone.surface },
          pressed && styles.pressed,
        ]}>
        <Breathing active={unread} scale={0.5} dim={0.5} style={[styles.dot, !unread && styles.settled]} />
        <View style={styles.words}>
          <Text variant="quote" soft={!unread}>
            {several ? "A few Seals are waiting for you." : "Someone left you a Seal."}
          </Text>
          <Text variant="caption" soft>
            {several ? "They" : "It"} will stay sealed unless you both choose to open {several ? "them" : "it"}.
          </Text>
        </View>
      </Pressable>
    </Rise>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 12, backgroundColor: colors.wheat },
  settled: { backgroundColor: colors.moss, opacity: 0.5 },
  words: { flex: 1, gap: space.sm },
  pressed: { opacity: 0.6 },
});
