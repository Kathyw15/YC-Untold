import { useMutation, useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { BreathingButton } from "@/components/BreathingButton";
import { QuietLink } from "@/components/QuietLink";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { Sealing } from "@/components/Sealing";
import { Text } from "@/components/Text";
import { WritingField } from "@/components/WritingField";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { space } from "@/theme";

export default function ComposeAnswerScreen() {
  const router = useRouter();
  const { questionId } = useLocalSearchParams<{ questionId: string }>();
  const question = useQuery(api.questions.get, { questionId: questionId as Id<"questions"> });
  const answer = useMutation(api.questions.answer);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [sealed, setSealed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function seal() {
    if (!question || busy || body.trim().length === 0) return;
    setBusy(true);
    setMessage(null);
    try {
      await answer({ questionId: question.id, body });
      setSealed(true);
    } catch {
      setMessage("That didn't go through. Try once more.");
      setBusy(false);
    }
  }

  return (
    <Screen scene="forest" testID="compose-answer-screen">
      <Sealing
        sealed={sealed}
        title="Sealed."
        body={
          question?.isDaily
            ? "Only you can read it. It rests in your own history."
            : "Only you can read it. If it resonates with theirs, you'll both be asked before anything is revealed."
        }
        onDone={() => router.back()}>
        <View style={styles.close}>
          <QuietLink testID="compose-close" label="Close" onPress={() => router.back()} />
        </View>
        <Rise style={styles.question}>
          <Text variant="quote" soft numberOfLines={4} testID="compose-question-text">
            {question?.text ?? " "}
          </Text>
        </Rise>
        <Rise order={1} style={styles.writing}>
          <WritingField
            testID="answer-input"
            label="Your private answer"
            placeholder="Say it the way you would if no one were listening."
            value={body}
            onChangeText={setBody}
            maxLength={2000}
            autoFocus
          />
        </Rise>
        <Rise order={2} style={styles.action}>
          <Text variant="caption" soft style={styles.centered}>
            {message ?? "No one sees this unless you both choose to."}
          </Text>
          <BreathingButton
            testID="seal-answer"
            label={busy ? "Sealing" : "Seal it"}
            onPress={seal}
            disabled={!question || busy || body.trim().length === 0}
          />
        </Rise>
      </Sealing>
    </Screen>
  );
}

const styles = StyleSheet.create({
  close: { alignSelf: "flex-start" },
  question: { marginTop: space.lg, marginBottom: space.lg },
  writing: { flex: 1 },
  action: { gap: space.md, marginTop: space.md },
  centered: { textAlign: "center" },
});
