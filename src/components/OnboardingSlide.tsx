import Feather from "@expo/vector-icons/Feather";
import { Pressable, StyleSheet, View } from "react-native";

import { colors, radius, shadows, space } from "@/theme";

import { Glass } from "./Glass";
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
      <Rise key={"headline-" + index}>
        <Text variant="hero" testID="onboarding-headline" style={styles.headline}>
          {headline}
        </Text>
      </Rise>
      <Rise key={"art-" + index} order={1} style={styles.art}>
        <Glass style={styles.illustration}>
          <Text variant="label" soft>
            Illustration {index + 1}
          </Text>
        </Glass>
      </Rise>
      <View style={styles.footer}>
        <View style={styles.dots} accessibilityLabel={"Page " + (index + 1) + " of " + count}>
          {Array.from({ length: count }, (_, dot) => (
            <View key={dot} style={[styles.dot, dot === index && styles.dotOn]} />
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
          style={({ pressed }) => [
            styles.next,
            nextLabel ? styles.labelled : styles.arrow,
            (pressed || disabled) && styles.pressed,
          ]}>
          {nextLabel ? (
            <Text variant="button" style={styles.nextText}>
              {nextLabel}
            </Text>
          ) : null}
          <Feather name="arrow-right" size={nextLabel ? 18 : 24} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

const NEXT_SIZE = 62;

const styles = StyleSheet.create({
  root: { flex: 1, gap: space.lg, paddingHorizontal: space.sm },
  headline: { marginTop: space.lg, maxWidth: 300 },
  art: { flex: 1 },
  illustration: { flex: 1, alignItems: "center", justifyContent: "center" },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: NEXT_SIZE },
  dots: { flexDirection: "row", gap: 7 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#D4D1E3" },
  dotOn: { width: 24, backgroundColor: colors.ink },
  next: {
    height: NEXT_SIZE,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    backgroundColor: colors.ink,
    boxShadow: shadows.button,
  },
  arrow: { width: NEXT_SIZE },
  labelled: { height: 56, paddingHorizontal: space.lg },
  nextText: { color: colors.white },
  pressed: { opacity: 0.7 },
});
