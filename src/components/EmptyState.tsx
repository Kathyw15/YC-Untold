import { StyleSheet, View } from "react-native";

import { space } from "@/theme";

import { Deco } from "./Deco";
import { Rise } from "./Rise";
import { Text } from "./Text";

type EmptyStateProps = {
  title: string;
  body: string;
  testID?: string;
};

export function EmptyState({ title, body, testID }: EmptyStateProps) {
  return (
    <View style={styles.root} testID={testID}>
      <Rise style={styles.stickers}>
        <Deco name="daisy" width={76} rotate={-10} />
        <Deco name="heart" width={70} rotate={12} style={styles.second} />
      </Rise>
      <Rise order={1}>
        <Text variant="title" style={styles.centered}>
          {title}
        </Text>
      </Rise>
      <Rise order={2}>
        <Text soft style={[styles.centered, styles.body]}>
          {body}
        </Text>
      </Rise>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", gap: space.sm },
  stickers: { flexDirection: "row", alignItems: "center", marginBottom: space.md },
  second: { marginLeft: space.md, marginTop: space.lg },
  centered: { textAlign: "center" },
  body: { maxWidth: 300 },
});
