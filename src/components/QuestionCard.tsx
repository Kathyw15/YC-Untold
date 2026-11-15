import Ionicons from "@expo/vector-icons/Ionicons";
import type { FunctionReturnType } from "convex/server";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, View } from "react-native";

import type { api } from "@/convex/_generated/api";
import { colors, questionGradients, radius, shadows, space } from "@/theme";

import { Avatar } from "./Avatar";
import { Text } from "./Text";

export type QuestionSummary = NonNullable<FunctionReturnType<typeof api.questions.today>>;

export function quietResponses(count: number) {
  if (count <= 0) return "No answers yet";
  return count === 1 ? "1 answered" : count + " answered";
}

export function askedBy(question: QuestionSummary) {
  if (question.isDaily) return "Today's question";
  if (question.isMine) return "by you";
  return "by " + (question.author?.name?.split(" ")[0] ?? "someone");
}

export function gradientFor(id: string) {
  let sum = 0;
  for (let index = 0; index < id.length; index++) sum += id.charCodeAt(index);
  return questionGradients[sum % questionGradients.length];
}

type QuestionCardProps = {
  question: QuestionSummary;
  onPress: () => void;
  testID?: string;
};

export function QuestionCard({ question, onPress, testID }: QuestionCardProps) {
  const sealed = question.isMine || question.hasAnswered;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={question.text}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <LinearGradient
        colors={gradientFor(question.id)}
        start={{ x: 0.35, y: 0 }}
        end={{ x: 0.65, y: 1 }}
        style={[StyleSheet.absoluteFill, styles.fill]}
      />
      {question.isDaily ? (
        <View style={styles.label}>
          <Ionicons name="sparkles-outline" size={13} color={colors.blue} />
          <Text variant="label" style={{ color: colors.blue }}>
            Today's question
          </Text>
        </View>
      ) : null}
      <View style={styles.inner}>
        <Text style={styles.question}>{question.text}</Text>
        {question.tags.length > 0 ? (
          <Text variant="caption" soft style={styles.tags}>
            {question.tags.map((tag) => "# " + tag).join("   ")}
          </Text>
        ) : null}
        <View style={styles.meta}>
          <View style={styles.row}>
            {question.isDaily ? null : (
              <Avatar uri={question.author?.avatarUrl ?? null} name={question.author?.name ?? null} size={24} />
            )}
            <Text style={styles.metaText}>{question.isDaily ? "From Seal" : askedBy(question)}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="people" size={16} color={colors.ink} />
            <Text style={styles.metaText}>{quietResponses(question.responseCount)}</Text>
          </View>
        </View>
        <View style={[styles.pill, sealed ? styles.passive : styles.primary]}>
          <Ionicons name="lock-closed" size={16} color={sealed ? colors.ink : colors.white} />
          <Text variant="button" style={{ color: sealed ? colors.ink : colors.white }}>
            {sealed ? "Your answer is sealed" : "Answer privately"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 340,
    borderRadius: radius.feed,
    justifyContent: "flex-end",
    boxShadow: shadows.feed,
  },
  fill: { borderRadius: radius.feed },
  pressed: { opacity: 0.85 },
  label: {
    position: "absolute",
    top: 18,
    left: 18,
    height: 32,
    paddingHorizontal: 13,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  inner: { paddingTop: 70, paddingHorizontal: space.md, paddingBottom: space.md },
  question: { fontSize: 31, lineHeight: 34, fontWeight: "700", letterSpacing: -0.9, color: colors.ink, marginHorizontal: 6 },
  tags: { marginHorizontal: 6, marginTop: space.sm },
  meta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", margin: 6, marginVertical: space.md },
  row: { flexDirection: "row", alignItems: "center", gap: space.sm },
  metaText: { fontSize: 15, lineHeight: 20, fontWeight: "500", color: colors.ink },
  pill: {
    height: 56,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
  },
  primary: { backgroundColor: colors.ink, boxShadow: shadows.blackPill },
  passive: { backgroundColor: "rgba(255, 255, 255, 0.6)", borderWidth: 1, borderColor: colors.white },
});
