import { StyleSheet, View } from "react-native";

import { space, tones } from "@/theme";

import { useTone } from "./Atmosphere";
import { Breathing } from "./Breathing";
import { Rise } from "./Rise";
import { Text } from "./Text";

type EmptyStateProps = {
  title: string;
  body: string;
  testID?: string;
};

export function EmptyState({ title, body, testID }: EmptyStateProps) {
  const tone = tones[useTone()];
  return (
    <View style={styles.root} testID={testID}>
      <Rise order={1}>
        <Breathing scale={0.08} dim={0.35} style={[styles.seal, { borderColor: tone.text }]}>
          <View style={[styles.core, { backgroundColor: tone.text }]} />
        </Breathing>
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
  root: { flex: 1, alignItems: "center", justifyContent: "center", gap: space.md },
  seal: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.md,
  },
  core: { width: 6, height: 6, borderRadius: 3, opacity: 0.7 },
  centered: { textAlign: "center" },
  body: { maxWidth: 280 },
});
