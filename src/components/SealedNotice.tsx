import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, View } from "react-native";

import { colors, radius, shadows, space } from "@/theme";

import { Rise } from "./Rise";
import { Text } from "./Text";

type SealedNoticeProps = {
  several: boolean;
  unread: boolean;
  onPress: () => void;
};

export function SealedNotice({ several, unread, onPress }: SealedNoticeProps) {
  return (
    <Rise>
      <Pressable
        testID="sealed-notice"
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <View style={styles.badge}>
          <Ionicons name="mail-outline" size={22} color={colors.ink} />
          {unread ? <View style={styles.dot} /> : null}
        </View>
        <View style={styles.words}>
          <Text variant="row">{several ? "A few Seals are waiting for you." : "Someone left you a Seal."}</Text>
          <Text variant="caption" soft>
            {several ? "They" : "It"} will stay sealed unless you both choose to open {several ? "them" : "it"}.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.ink3} />
      </Pressable>
    </Rise>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: space.md,
    borderRadius: radius.list,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
    backgroundColor: "rgba(255, 255, 255, 0.62)",
    boxShadow: shadows.card,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    boxShadow: shadows.card,
  },
  dot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.red,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  words: { flex: 1, gap: 2 },
  pressed: { opacity: 0.7 },
});
