import { useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { BreathingButton } from "@/components/BreathingButton";
import { askedBy, quietResponses } from "@/components/QuestionCard";
import { QuietLink } from "@/components/QuietLink";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { colors, space } from "@/theme";

export default function QuestionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const question = useQuery(api.questions.get, { questionId: id as Id<"questions"> });

  return (
    <Screen scene="sky" testID="question-screen">
      <View style={styles.back}>
        <QuietLink testID="question-back" label="Back" onPress={() => router.back()} />
      </View>
      {question === null ? (
        <View style={styles.missing}>
          <Text variant="title" style={styles.centered}>
            This question isn't here anymore.
          </Text>
        </View>
      ) : question ? (
        <>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Rise>
              {question.isDaily ? (
                <Text variant="label" soft>
                  {askedBy(question)}
                </Text>
              ) : (
                <View style={styles.row}>
                  <Avatar uri={question.author?.avatarUrl ?? null} name={question.author?.name ?? null} size={36} />
                  <Text variant="caption" soft>
                    {askedBy(question)}
                  </Text>
                </View>
              )}
            </Rise>
            <Rise order={1}>
              <Text variant="display" testID="question-text">
                {question.text}
              </Text>
            </Rise>
            <Rise order={2}>
              <View style={styles.meta}>
                {question.tags.length > 0 ? (
                  <Text variant="caption" soft>
                    {question.tags.join(" · ")}
                  </Text>
                ) : null}
                <Text variant="caption" soft testID="question-responses">
                  {quietResponses(question.responseCount)}
                </Text>
              </View>
            </Rise>
            {question.myAnswer ? (
              <Rise order={3} style={styles.sealed}>
                <View style={styles.row}>
                  <View style={styles.dot} />
                  <Text variant="label" soft>
                    Your sealed answer
                  </Text>
                </View>
                <Text variant="quote" testID="my-answer">
                  {question.myAnswer.body}
                </Text>
                <Text variant="caption" soft>
                  {question.isDaily
                    ? "Only you can read this. It rests in your own history."
                    : "Only you can read this. If it resonates, you'll both be asked before anything is revealed."}
                </Text>
              </Rise>
            ) : null}
          </ScrollView>
          {question.myAnswer ? null : (
            <Rise order={3} style={styles.action}>
              <Text variant="caption" soft style={styles.centered}>
                {question.isDaily
                  ? "Your answer is kept for you alone."
                  : "Your answer stays sealed. Theirs does too, unless you both choose otherwise."}
              </Text>
              <BreathingButton
                testID="answer-privately"
                label="Answer privately"
                onPress={() =>
                  router.push({ pathname: "/compose/answer/[questionId]", params: { questionId: question.id } })
                }
              />
            </Rise>
          )}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: "flex-start" },
  missing: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { flex: 1 },
  content: { gap: space.lg, paddingTop: space.xl, paddingBottom: space.xl },
  row: { flexDirection: "row", alignItems: "center", gap: space.sm },
  meta: { gap: space.xs },
  sealed: { gap: space.md, marginTop: space.lg },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.pink },
  action: { gap: space.md },
  centered: { textAlign: "center" },
});
