import { StyleSheet, View } from "react-native";

import { colors } from "@/theme";

import { Text } from "./Text";

const FILLS = {
  pink: { backgroundColor: colors.pink, color: colors.white },
  sun: { backgroundColor: colors.sun, color: colors.ink },
  lilac: { backgroundColor: colors.lilac, color: colors.white },
  white: { backgroundColor: colors.white, color: colors.ink },
} as const;

type LabelProps = {
  children: string;
  fill?: keyof typeof FILLS;
  testID?: string;
};

// A tilted, hand-lettered label sticker.
export function Label({ children, fill = "pink", testID }: LabelProps) {
  const { backgroundColor, color } = FILLS[fill];
  return (
    <View style={[styles.label, { backgroundColor }]}>
      <Text variant="brush" style={{ color }} testID={testID}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    alignSelf: "flex-start",
    paddingHorizontal: 13,
    paddingTop: 3,
    paddingBottom: 2,
    borderRadius: 6,
    transform: [{ rotate: "-4deg" }],
    boxShadow: "0 3px 0 rgba(0, 0, 0, 0.08)",
  },
});
