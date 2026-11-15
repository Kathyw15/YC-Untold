import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, View } from "react-native";

import { colors, space } from "@/theme";

import { Avatar } from "./Avatar";
import { Text } from "./Text";

type PersonRowProps = {
  name: string;
  avatarUrl?: string | null;
  note?: string | null;
  onPress: () => void;
  testID?: string;
};

export function PersonRow({ name, avatarUrl = null, note, onPress, testID }: PersonRowProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={"Write to " + name}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Avatar uri={avatarUrl} name={name} size={44} />
      <View style={styles.words}>
        <Text numberOfLines={1} style={styles.name}>
          {name}
        </Text>
        {note ? (
          <Text variant="caption" soft numberOfLines={1}>
            {note}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.ink3} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  pressed: { opacity: 0.5 },
  words: { flex: 1 },
  name: { fontWeight: "500" },
});
