import { useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { BreathingButton } from "@/components/BreathingButton";
import { QuietLink } from "@/components/QuietLink";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { Sealing } from "@/components/Sealing";
import { Text } from "@/components/Text";
import { WritingField } from "@/components/WritingField";
import { api } from "@/convex/_generated/api";
import { colors, space } from "@/theme";

const AUDIENCES = [
  { value: "everyone", label: "Everyone" },
  { value: "friends", label: "People I know" },
] as const;

type Audience = (typeof AUDIENCES)[number]["value"];

export default function ComposeQuestionScreen() {
  const router = useRouter();
  const create = useMutation(api.questions.create);
  const [step, setStep] = useState<"question" | "answer">("question");
  const [text, setText] = useState("");
  const [audience, setAudience] = useState<Audience>("everyone");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [sealed, setSealed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function seal() {
    if (busy || answer.trim().length === 0) return;
    setBusy(true);
    setMessage(null);
    try {
      await create({ text, audience, answer });
      setSealed(true);
    } catch {
      setMessage("That didn't go through. Try once more.");
      setBusy(false);
    }
  }

  return (
    <Screen scene="dusk" testID="compose-question-screen">
      <Sealing
        sealed={sealed}
        title="Sealed."
        body="Your question is out there now. Your answer waits where only you can read it."
        onDone={() => router.back()}>
        <View style={styles.close}>
          {step === "question" ? (
            <QuietLink testID="compose-close" label="Close" onPress={() => router.back()} />
          ) : (
            <QuietLink testID="compose-back" label="Back" onPress={() => setStep("question")} />
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
                      style={styles.audience}>
                      <View style={[styles.dot, { opacity: selected ? 1 : 0 }]} />
                      <Text variant="caption" soft={!selected}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <BreathingButton
                testID="question-continue"
                label="Continue"
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
                label={busy ? "Sealing" : "Seal and ask"}
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
  audiences: { flexDirection: "row", justifyContent: "center", gap: space.xl },
  audience: { flexDirection: "row", alignItems: "center", gap: space.sm, paddingVertical: space.sm },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.pink },
  centered: { textAlign: "center" },
});
