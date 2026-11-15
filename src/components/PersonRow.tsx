import Feather from "@expo/vector-icons/Feather";
import { Pressable, StyleSheet, View } from "react-native";

import { space } from "@/theme";

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
        <Text variant="row" numberOfLines={1}>
          {name}
        </Text>
        {note ? (
          <Text variant="caption" soft numberOfLines={1}>
            {note}
          </Text>
        ) : null}
      </View>
      <Feather name="chevron-right" size={18} color="#B5B6C4" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: space.sm + 4, paddingVertical: 11 },
  pressed: { opacity: 0.5 },
  words: { flex: 1 },
});
