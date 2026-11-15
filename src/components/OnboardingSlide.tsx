import { Pressable, StyleSheet, View } from "react-native";

import { radius, space, tones } from "@/theme";

import { useTone } from "./Atmosphere";
import { Breathing } from "./Breathing";
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
  const tone = tones[useTone()];
  return (
    <View style={styles.root} testID={"onboarding-page-" + (index + 1)}>
      <Rise key={"art-" + index} style={styles.art}>
        <Breathing
          scale={0.012}
          dim={0.12}
          style={[styles.illustration, { borderColor: tone.hairline, backgroundColor: tone.surface }]}>
          <Text variant="label" soft>
            Illustration {index + 1}
          </Text>
        </Breathing>
      </Rise>
      <Rise key={"headline-" + index} order={1}>
        <Text variant="display" testID="onboarding-headline">
          {headline}
        </Text>
      </Rise>
      <View style={styles.footer}>
        <View style={styles.dots} accessibilityLabel={"Page " + (index + 1) + " of " + count}>
          {Array.from({ length: count }, (_, dot) => (
            <View key={dot} style={[styles.dot, { backgroundColor: tone.text, opacity: dot === index ? 1 : 0.3 }]} />
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
            { borderColor: tone.text, backgroundColor: tone.surface },
            (pressed || disabled) && styles.pressed,
          ]}>
          {nextLabel ? (
            <Text variant="button">{nextLabel}</Text>
          ) : (
            <View style={[styles.chevron, { borderColor: tone.text }]} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const NEXT_SIZE = 56;

const styles = StyleSheet.create({
  root: { flex: 1, gap: space.xl },
  art: { flex: 1 },
  illustration: {
    flex: 1,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: NEXT_SIZE },
  dots: { flexDirection: "row", gap: space.sm },
  dot: { width: 6, height: 6, borderRadius: 3 },
  next: {
    height: NEXT_SIZE,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: { width: NEXT_SIZE },
  labelled: { paddingHorizontal: space.xl },
  chevron: {
    width: 10,
    height: 10,
    marginRight: 4,
    borderTopWidth: 1.5,
    borderRightWidth: 1.5,
    transform: [{ rotate: "45deg" }],
  },
  pressed: { opacity: 0.6 },
});
