import { Pressable, StyleSheet, View } from "react-native";

import { space } from "@/theme";

import { Avatar } from "./Avatar";
import { Text } from "./Text";

type PersonRowProps = {
  name: string;
  avatarUrl?: string | null;
  avatarEmoji?: string | null;
  note?: string | null;
  onPress: () => void;
  testID?: string;
};

export function PersonRow({ name, avatarUrl = null, avatarEmoji, note, onPress, testID }: PersonRowProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={"Write to " + name}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Avatar uri={avatarUrl} emoji={avatarEmoji} name={name} size={44} />
      <View style={styles.words}>
        <Text numberOfLines={1}>{name}</Text>
        {note ? (
          <Text variant="caption" soft numberOfLines={1}>
            {note}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: space.sm + 2 },
  pressed: { opacity: 0.5 },
  words: { flex: 1 },
});
