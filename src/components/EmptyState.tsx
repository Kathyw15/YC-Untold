import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";

import { colors, shadows, space } from "@/theme";

import { Rise } from "./Rise";
import { Text } from "./Text";

type EmptyStateProps = {
  title: string;
  body: string;
  icon?: ComponentProps<typeof Ionicons>["name"];
  testID?: string;
};

export function EmptyState({ title, body, icon = "lock-closed-outline", testID }: EmptyStateProps) {
  return (
    <View style={styles.root} testID={testID}>
      <Rise order={1}>
        <View style={styles.badge}>
          <Ionicons name={icon} size={26} color={colors.ink} />
        </View>
      </Rise>
      <Rise order={2}>
        <Text variant="title" style={styles.centered}>
          {title}
        </Text>
      </Rise>
      <Rise order={3}>
        <Text soft style={[styles.centered, styles.body]}>
          {body}
        </Text>
      </Rise>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", gap: space.sm + 4 },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.sm,
    backgroundColor: colors.white,
    boxShadow: shadows.card,
  },
  centered: { textAlign: "center" },
  body: { maxWidth: 300 },
});
