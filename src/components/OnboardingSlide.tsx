import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, View } from "react-native";

import { colors, radius, shadows, space } from "@/theme";

import { Rise } from "./Rise";
import { Text } from "./Text";

type OnboardingSlideProps = {
  headline: string;
  index: number;
  count: number;
  nextLabel?: string;
  onNext: () => void;
  disabled?: boolean;
};

export function OnboardingSlide({ headline, index, count, nextLabel, onNext, disabled = false }: OnboardingSlideProps) {
  return (
    <View style={styles.root} testID={"onboarding-page-" + (index + 1)}>
      <Rise key={"headline-" + index} order={1}>
        <Text variant="hero" testID="onboarding-headline" style={styles.headline}>
          {headline}
        </Text>
      </Rise>
      <View style={styles.footer}>
        <View style={styles.dots} accessibilityLabel={"Page " + (index + 1) + " of " + count}>
          {Array.from({ length: count }, (_, dot) => (
            <View key={dot} style={[styles.dot, dot === index && styles.current]} />
          ))}
        </View>
        <Pressable
          testID="onboarding-next"
          accessibilityRole="button"
          accessibilityLabel={nextLabel ?? "Next"}
          accessibilityState={{ disabled }}
          disabled={disabled}
          hitSlop={space.sm}
          onPress={onNext}
          style={({ pressed }) => [styles.next, nextLabel ? styles.labelled : styles.arrow, (pressed || disabled) && styles.pressed]}>
          {nextLabel ? (
            <Text variant="button" style={styles.nextLabel}>
              {nextLabel}
            </Text>
          ) : null}
          <Ionicons name="arrow-forward" size={nextLabel ? 18 : 22} color={colors.ink} />
        </Pressable>
      </View>
    </View>
  );
}

const NEXT_SIZE = 56;

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end", gap: space.xl },
  headline: { maxWidth: 320, textShadowColor: "rgba(0, 0, 0, 0.18)", textShadowRadius: 16, textShadowOffset: { width: 0, height: 1 } },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: NEXT_SIZE },
  dots: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255, 255, 255, 0.5)" },
  current: { width: 20, backgroundColor: colors.white },
  next: {
    height: NEXT_SIZE,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    backgroundColor: colors.white,
    boxShadow: shadows.whitePill,
  },
  arrow: { width: NEXT_SIZE },
  labelled: { paddingHorizontal: space.lg },
  nextLabel: { color: colors.ink },
  pressed: { opacity: 0.7 },
});
