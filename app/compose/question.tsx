import { useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { BreathingButton } from "@/components/BreathingButton";
import { IconButton } from "@/components/IconButton";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { Sealing } from "@/components/Sealing";
import { Text } from "@/components/Text";
import { WritingField } from "@/components/WritingField";
import { api } from "@/convex/_generated/api";
import { colors, radius, space } from "@/theme";

const AUDIENCES = [
  { value: "everyone", label: "Everyone" },
  { value: "friends", label: "People I know" },
] as const;

type Audience = (typeof AUDIENCES)[number]["value"];

const TOPICS = ["Family", "Growing up", "Love", "Work", "Friendship"];

export default function ComposeQuestionScreen() {
  const router = useRouter();
  const create = useMutation(api.questions.create);
  const [step, setStep] = useState<"question" | "answer">("question");
  const [text, setText] = useState("");
  const [audience, setAudience] = useState<Audience>("everyone");
  const [topic, setTopic] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [sealed, setSealed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function seal() {
    if (busy || answer.trim().length === 0) return;
    setBusy(true);
    setMessage(null);
    try {
      await create({ text, audience, answer, tags: topic ? [topic] : [] });
      setSealed(true);
    } catch {
      setMessage("That didn't go through. Try once more.");
      setBusy(false);
    }
  }

  return (
    <Screen scene="base" testID="compose-question-screen">
      <Sealing
        sealed={sealed}
        title="Posted."
        body="Your question is out there now. Your answer is sealed where only you can read it."
        onDone={() => router.back()}>
        <View style={styles.close}>
          {step === "question" ? (
            <IconButton icon="close" testID="compose-close" label="Close" onPress={() => router.back()} />
          ) : (
            <IconButton icon="chevron-back" testID="compose-back" label="Back" onPress={() => setStep("question")} />
          )}
        </View>
        {step === "question" ? (
          <>
            <Rise key="question" order={1} style={styles.writing}>
              <WritingField
                testID="question-input"
                label="Your question"
                placeholder="What do you wonder about?"
                value={text}
                onChangeText={setText}
                maxLength={240}
                autoFocus
              />
            </Rise>
            <Rise order={2} style={styles.action}>
              <View style={styles.topics}>
                <Text variant="caption" soft>
                  Topic (optional)
                </Text>
                {TOPICS.map((option) => {
                  const selected = option === topic;
                  return (
                    <Pressable
                      key={option}
                      testID={"topic-" + option.toLowerCase().replace(" ", "-")}
                      accessibilityRole="button"
                      accessibilityLabel={option}
                      accessibilityState={{ selected }}
                      onPress={() => setTopic(selected ? null : option)}
                      style={[styles.topic, selected && styles.topicOn]}>
                      <Text style={[styles.chipText, selected && styles.topicOnText]}>{option}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.audiences}>
                {AUDIENCES.map((option) => {
                  const selected = option.value === audience;
                  return (
                    <Pressable
                      key={option.value}
                      testID={"audience-" + option.value}
                      accessibilityRole="radio"
                      accessibilityLabel={option.label}
                      accessibilityState={{ selected }}
                      hitSlop={space.sm}
                      onPress={() => setAudience(option.value)}
                      style={[styles.audience, selected && styles.audienceOn]}>
                      <Text style={[styles.chipText, selected && styles.audienceOnText]}>{option.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <BreathingButton
                testID="question-continue"
                label="Next: seal your answer"
                onPress={() => setStep("answer")}
                disabled={text.trim().length === 0}
              />
            </Rise>
          </>
        ) : (
          <>
            <Rise key="asked" style={styles.question}>
              <Text variant="quote" soft numberOfLines={4}>
                {text.trim()}
              </Text>
            </Rise>
            <Rise key="answer" order={1} style={styles.writing}>
              <WritingField
                testID="own-answer-input"
                label="Your own answer, sealed"
                placeholder="Answer it yourself first."
                value={answer}
                onChangeText={setAnswer}
                maxLength={2000}
                autoFocus
              />
            </Rise>
            <Rise order={2} style={styles.action}>
              <Text variant="caption" soft style={styles.centered}>
                {message ?? "People see the question. No one sees your answer unless you both choose to."}
              </Text>
              <BreathingButton
                testID="seal-question"
                label={busy ? "Posting" : "Post question"}
                onPress={seal}
                disabled={busy || answer.trim().length === 0}
              />
            </Rise>
          </>
        )}
      </Sealing>
    </Screen>
  );
}

const styles = StyleSheet.create({
  close: { alignSelf: "flex-start" },
  question: { marginTop: space.lg, marginBottom: space.lg },
  writing: { flex: 1, marginTop: space.lg },
  action: { gap: space.md, marginTop: space.md },
  topics: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: space.sm },
  topic: {
    height: 36,
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: space.md,
  },
  topicOn: { backgroundColor: colors.blueSoft, borderColor: colors.blueSoft },
  topicOnText: { color: colors.blue, fontWeight: "600" },
  chipText: { fontSize: 15, lineHeight: 20, fontWeight: "500", color: "#45454D" },
  audiences: { flexDirection: "row", justifyContent: "center", gap: 10 },
  audience: {
    height: 40,
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 20,
  },
  audienceOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  audienceOnText: { color: colors.white, fontWeight: "600" },
  centered: { textAlign: "center" },
});
