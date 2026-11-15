import type { FunctionReturnType } from "convex/server";
import { Pressable, StyleSheet, View } from "react-native";

import type { api } from "@/convex/_generated/api";
import Feather from "@expo/vector-icons/Feather";

import { colors, fonts, radius, space } from "@/theme";

import { Avatar } from "./Avatar";
import { Deco } from "./Deco";
import { Glass } from "./Glass";
import { Label } from "./Label";
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
      style={({ pressed }) => pressed && styles.pressed}>
      <Glass solid={question.isMine} style={styles.card}>
        {question.isDaily ? (
          <>
            <Label fill="sun">{askedBy(question)}</Label>
            <Deco name="heart" width={46} rotate={12} style={styles.deco} />
          </>
        ) : (
          <View style={styles.row}>
            <Avatar uri={question.author?.avatarUrl ?? null} name={question.author?.name ?? null} size={32} />
            <Text variant="row" style={styles.author}>
              {askedBy(question)}
            </Text>
          </View>
        )}
        <Text variant={question.isDaily ? "title" : "row"} style={question.isDaily ? null : styles.question}>
          {question.text}
        </Text>
        {question.tags.length > 0 ? (
          <Text variant="caption" soft>
            {question.tags.join(" · ")}
          </Text>
        ) : null}
        <View style={styles.foot}>
          <Text variant="caption" soft style={styles.count}>
            {sealedNote ?? quietResponses(question.responseCount)}
          </Text>
          {sealedNote ? (
            <Feather name="chevron-right" size={18} color="#B5B6C4" />
          ) : (
            <View style={styles.pill}>
              <Feather name="lock" size={13} color={colors.white} />
              <Text style={styles.pillText}>Answer privately</Text>
            </View>
          )}
        </View>
      </Glass>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: space.md, gap: space.sm + 2 },
  pressed: { opacity: 0.8 },
  deco: { position: "absolute", top: -10, right: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: space.sm + 2 },
  author: { fontSize: 14, lineHeight: 19 },
  question: { fontSize: 18, lineHeight: 23 },
  foot: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: space.sm, minHeight: 36 },
  count: { flex: 1 },
  pill: {
    height: 36,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.ink,
  },
  pillText: { fontFamily: fonts.heavy, fontSize: 14, lineHeight: 18, color: colors.white },
});
