import { useMutation, useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";

import { AnswerComposer } from "@/components/AnswerComposer";
import { QuestionScene } from "@/components/QuestionBackground";
import { Sealing } from "@/components/Sealing";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

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
    <QuestionScene question={question} variant="screen" testID="compose-answer-screen">
      <Sealing
        sealed={sealed}
        title="Sealed."
        body={
          question?.isDaily
            ? "Only you can read it. It rests in your own history."
            : "Only you can read it. If it resonates with theirs, you'll both be asked before anything is revealed."
        }
        onDone={() => router.back()}>
        <AnswerComposer
          question={question?.text ?? " "}
          questionTestID="compose-question-text"
          value={body}
          onChangeText={setBody}
          inputTestID="answer-input"
          leaveIcon="close"
          leaveLabel="Close"
          leaveTestID="compose-close"
          onLeave={() => router.back()}
          submitLabel={busy ? "Sealing" : "Seal answer"}
          submitTestID="seal-answer"
          submitDisabled={!question || busy || body.trim().length === 0}
          onSubmit={seal}
          message={message}
        />
      </Sealing>
    </QuestionScene>
  );
}
