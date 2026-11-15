import Feather from "@expo/vector-icons/Feather";
import { StyleSheet, View } from "react-native";

import { colors, space } from "@/theme";

import { Deco } from "./Deco";
import { Glass } from "./Glass";
import { Rise } from "./Rise";
import { Text } from "./Text";

type SealedNoticeProps = {
  several: boolean;
  unread: boolean;
};

export function SealedNotice({ several, unread }: SealedNoticeProps) {
  return (
    <Rise>
      <Glass testID="sealed-notice" style={styles.card}>
        <Deco name="envelope" width={52} rotate={-6} />
        <View style={styles.words}>
          <Text variant="row">
            {several ? "There are a few messages waiting for you on Untold." : "Someone left you a message on Untold."}
          </Text>
          <Text variant="caption" soft>
            {several ? "They" : "It"} will stay sealed unless you both choose to open {several ? "them" : "it"}.
          </Text>
        </View>
        {unread ? <View style={styles.dot} /> : <Feather name="chevron-right" size={18} color="#B5B6C4" />}
      </Glass>
    </Rise>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: space.md, padding: space.md },
  words: { flex: 1, gap: space.xs },
  dot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.pink,
    borderWidth: 2,
    borderColor: colors.white,
  },
});
