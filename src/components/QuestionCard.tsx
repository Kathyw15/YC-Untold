import Ionicons from "@expo/vector-icons/Ionicons";
import type { FunctionReturnType } from "convex/server";
import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";

import type { api } from "@/convex/_generated/api";
import { colors, radius, shadows, space } from "@/theme";

import { Avatar } from "./Avatar";
import { QuestionBackground, questionPhoto } from "./QuestionBackground";
import { Text } from "./Text";

export { gradientFor } from "./QuestionBackground";

export type QuestionSummary = NonNullable<FunctionReturnType<typeof api.questions.today>>;

export function quietResponses(count: number) {
  if (count <= 0) return "No answers yet";
  return count === 1 ? "1 answered" : count + " answered";
}

export function askedBy(question: QuestionSummary) {
  if (question.isDaily) return "Daily question";
  if (question.isMine) return "by you";
  return "by " + (question.author?.name?.split(" ")[0] ?? "someone");
}

export function MascotAvatar({ size }: { size: number }) {
  return (
    <View style={[styles.mascot, { width: size, height: size, borderRadius: size / 2 }]}>
      <Image
        source={require("@/assets/brand/seal-mascot.png")}
        style={{ width: size * 0.78, height: size * 0.78 }}
        contentFit="contain"
      />
    </View>
  );
}

type QuestionCardProps = {
  question: QuestionSummary;
  onPress: () => void;
  testID?: string;
};

export function QuestionCard({ question, onPress, testID }: QuestionCardProps) {
  const sealed = question.isMine || question.hasAnswered;
  const onPhoto = questionPhoto(question) !== null;
  const ink = onPhoto ? colors.white : colors.ink;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={question.text}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <QuestionBackground question={question} style={styles.fill} />
      {question.isDaily ? (
        <View style={[styles.label, onPhoto ? styles.photoGlass : styles.glass]}>
          <Ionicons name="sparkles" size={13} color={ink} />
          <Text style={[styles.labelText, { color: ink }]}>Today’s question</Text>
        </View>
      ) : null}
      <View style={[styles.bookmark, onPhoto ? styles.photoGlass : styles.glass]}>
        <Ionicons name="bookmark-outline" size={19} color={ink} />
      </View>
      <View style={styles.inner}>
        <Text style={[styles.question, { color: ink }, onPhoto && styles.onPhoto]}>{question.text}</Text>
        <View style={styles.meta}>
          <View style={styles.row}>
            {question.isDaily ? (
              <MascotAvatar size={28} />
            ) : (
              <Avatar
                uri={question.author?.avatarUrl ?? null}
                emoji={question.author?.avatarEmoji}
                name={question.author?.name ?? null}
                size={28}
              />
            )}
            <Text style={[styles.metaText, { color: ink }]}>{askedBy(question)}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="people" size={18} color={ink} />
            <Text style={[styles.metaText, { color: ink }]}>{quietResponses(question.responseCount)}</Text>
          </View>
        </View>
        <View
          style={[
            styles.pill,
            sealed
              ? onPhoto
                ? styles.sealedOnPhoto
                : styles.sealedOnGradient
              : onPhoto
                ? styles.white
                : styles.black,
          ]}>
          <Ionicons name="lock-closed" size={17} color={sealed ? ink : onPhoto ? colors.ink : colors.white} />
          <Text variant="button" style={{ color: sealed ? ink : onPhoto ? colors.ink : colors.white }}>
            {sealed ? "Your answer is sealed" : "Answer privately"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { height: 520, borderRadius: radius.feed, boxShadow: shadows.feed },
  fill: { borderRadius: radius.feed },
  pressed: { opacity: 0.9 },
  mascot: { alignItems: "center", justifyContent: "center", backgroundColor: colors.white },
  glass: { backgroundColor: "rgba(255, 255, 255, 0.62)", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.9)" },
  photoGlass: { backgroundColor: "rgba(255, 255, 255, 0.18)", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.42)" },
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
  },
  labelText: { fontSize: 13, lineHeight: 16, fontWeight: "600" },
  bookmark: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  inner: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: space.md, paddingBottom: space.md },
  question: { fontSize: 31, lineHeight: 34, fontWeight: "700", letterSpacing: -0.93, marginHorizontal: 6, marginBottom: 16 },
  onPhoto: { textShadowColor: "rgba(0, 0, 0, 0.18)", textShadowRadius: 16, textShadowOffset: { width: 0, height: 1 } },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 6,
    marginBottom: 16,
  },
  row: { flexDirection: "row", alignItems: "center", gap: space.sm },
  metaText: { fontSize: 15, lineHeight: 20, fontWeight: "500" },
  pill: {
    height: 56,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  black: { backgroundColor: colors.ink, boxShadow: shadows.blackPill },
  white: { backgroundColor: colors.white, boxShadow: shadows.whitePill },
  sealedOnPhoto: { backgroundColor: "rgba(255, 255, 255, 0.22)", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.5)" },
  sealedOnGradient: { backgroundColor: "rgba(255, 255, 255, 0.6)", borderWidth: 1, borderColor: colors.white },
});
