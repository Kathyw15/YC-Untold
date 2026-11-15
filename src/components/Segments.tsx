import { Pressable, StyleSheet, View } from "react-native";

import { colors, radius } from "@/theme";

import { Text } from "./Text";

type SegmentsProps<Value extends string> = {
  options: readonly { value: Value; label: string }[];
  value: Value;
  onChange: (value: Value) => void;
  testID: string;
};

export function Segments<Value extends string>({ options, value, onChange, testID }: SegmentsProps<Value>) {
  return (
    <View style={styles.track} accessibilityRole="tablist">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            testID={testID + "-" + option.value}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected && styles.selected]}>
            <Text
              numberOfLines={1}
              style={{ fontSize: 15, lineHeight: 20, fontWeight: selected ? "600" : "500", color: selected ? colors.ink : "#55555E" }}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    alignSelf: "stretch",
    backgroundColor: colors.track,
    borderRadius: radius.pill,
    padding: 3,
  },
  segment: { flex: 1, height: 40, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  selected: { backgroundColor: colors.white, boxShadow: "0 1px 4px rgba(0, 0, 0, 0.12)" },
});
