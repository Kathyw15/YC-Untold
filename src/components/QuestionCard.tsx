import type { FunctionReturnType } from "convex/server";
import { Pressable, StyleSheet, View } from "react-native";

import type { api } from "@/convex/_generated/api";
import { colors, radius, space, tones } from "@/theme";

import { useTone } from "./Atmosphere";
import { Avatar } from "./Avatar";
import { Text } from "./Text";

export type QuestionSummary = NonNullable<FunctionReturnType<typeof api.questions.today>>;

const SMALL_COUNTS = ["Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];

export function quietResponses(count: number) {
  if (count <= 0) return "No one has answered yet.";
  if (count === 1) return "One person has quietly answered.";
  return (SMALL_COUNTS[count - 2] ?? "Many") + " people have quietly answered.";
}

export function askedBy(question: QuestionSummary) {
  if (question.isDaily) return "Today's question";
  if (question.isMine) return "You asked";
  return (question.author?.name ?? "Someone") + " asks";
}

type QuestionCardProps = {
  question: QuestionSummary;
  onPress: () => void;
  testID?: string;
};

export function QuestionCard({ question, onPress, testID }: QuestionCardProps) {
  const tone = tones[useTone()];
  const sealedNote = question.isMine
    ? "Your answer is sealed inside."
    : question.hasAnswered
      ? "You answered. It stays sealed."
      : null;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={question.text}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { borderColor: tone.hairline, backgroundColor: tone.surface },
        pressed && styles.pressed,
      ]}>
      {question.isDaily ? (
        <Text variant="label" soft>
          {askedBy(question)}
        </Text>
      ) : (
        <View style={styles.row}>
          <Avatar uri={question.author?.avatarUrl ?? null} name={question.author?.name ?? null} size={28} />
          <Text variant="caption" soft>
            {askedBy(question)}
          </Text>
        </View>
      )}
      <Text variant={question.isDaily ? "title" : "quote"}>{question.text}</Text>
      {question.tags.length > 0 ? (
        <Text variant="caption" soft>
          {question.tags.join(" · ")}
        </Text>
      ) : null}
      <View style={styles.foot}>
        <Text variant="caption" soft>
          {quietResponses(question.responseCount)}
        </Text>
        {sealedNote ? (
          <View style={styles.row}>
            <View style={styles.dot} />
            <Text variant="caption" soft>
              {sealedNote}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth * 2,
    padding: space.lg,
    gap: space.md,
  },
  pressed: { opacity: 0.7 },
  row: { flexDirection: "row", alignItems: "center", gap: space.sm },
  foot: { gap: space.xs },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.moss },
});
