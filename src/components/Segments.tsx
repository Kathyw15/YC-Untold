import { Pressable, StyleSheet, View } from "react-native";

import { colors, space } from "@/theme";

import { Text } from "./Text";

type SegmentsProps<Value extends string> = {
  options: readonly { value: Value; label: string }[];
  value: Value;
  onChange: (value: Value) => void;
  testID: string;
};

export function Segments<Value extends string>({ options, value, onChange, testID }: SegmentsProps<Value>) {
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            testID={testID + "-" + option.value}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            hitSlop={space.sm}
            onPress={() => onChange(option.value)}
            style={styles.segment}>
            <Text variant="caption" soft={!selected} numberOfLines={1}>
              {option.label}
            </Text>
            <View style={[styles.dot, { opacity: selected ? 1 : 0 }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: space.lg },
  segment: { alignItems: "center", gap: space.xs, paddingVertical: space.xs },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.moss },
});
