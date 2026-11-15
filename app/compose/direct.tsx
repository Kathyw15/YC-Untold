import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Keyboard, StyleSheet, View } from "react-native";

import { BreathingButton } from "@/components/BreathingButton";
import { LineField } from "@/components/LineField";
import { QuietLink } from "@/components/QuietLink";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { Sealing } from "@/components/Sealing";
import { Text } from "@/components/Text";
import { WritingField } from "@/components/WritingField";
import { api } from "@/convex/_generated/api";
import { DIAL_PREFIX, formatE164, formatNational, nationalToE164, nextNationalDigits } from "@/lib/phone";
import { useSession } from "@/lib/session";
import { space } from "@/theme";

export default function ComposeDirectScreen() {
  const { status } = useSession();
  if (status === "loading") return null;
  if (status !== "ready") return <Redirect href="/" />;
  return <ComposeDirect />;
}

function ComposeDirect() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string; name?: string; here?: "0" | "1" }>();
  const create = useMutation(api.direct.create);
  const [digits, setDigits] = useState("");
  const [body, setBody] = useState("");
  const [phase, setPhase] = useState<"writing" | "confirming" | "sealing" | "sealed">("writing");
  const [message, setMessage] = useState<string | null>(null);

  const phone = params.phone ?? nationalToE164(digits);
  const who = params.name ?? (phone ? formatE164(phone) : "them");
  const waiting = params.here === "0";

  async function seal() {
    if (phase !== "confirming" || !phone) return;
    setPhase("sealing");
    setMessage(null);
    try {
      await create({ phone, body });
      setPhase("sealed");
    } catch (error) {
      setPhase("writing");
      setMessage(
        error instanceof ConvexError && error.data?.code === "CANNOT_WRITE_TO_SELF"
          ? "That's your own number."
          : "That didn't go through. Try once more.",
      );
    }
  }

  return (
    <Screen scene="forest" testID="compose-direct-screen">
      <Sealing
        sealed={phase === "sealed"}
        title="Sealed."
        body={
          waiting
            ? `Your words are safe here. They will wait until ${who} arrives.`
            : `Your words are safe here. ${params.name ?? "They"} will only know that someone left a message.`
        }
        onDone={() => router.back()}>
        <View style={styles.close}>
          <QuietLink testID="compose-close" label="Close" onPress={() => router.back()} disabled={phase === "sealing"} />
        </View>
        {params.phone ? null : (
          <Rise style={styles.number}>
            <LineField
              testID="compose-phone-input"
              label="Their phone number"
              prefix={<Text variant="input" soft>{DIAL_PREFIX}</Text>}
              value={formatNational(digits)}
              onChangeText={(text) => setDigits(nextNationalDigits(text, digits))}
              placeholder="(201) 555-0101"
              keyboardType="number-pad"
              textContentType="telephoneNumber"
              editable={phase === "writing"}
              autoFocus
              message="Only used to find them. They won't see who wrote."
            />
          </Rise>
        )}
        <Rise order={1} style={styles.writing}>
          <WritingField
            testID="compose-body"
            label={params.phone ? "To " + who : "What you want to say"}
            placeholder="What have you never said?"
            value={body}
            onChangeText={setBody}
            maxLength={2000}
            editable={phase === "writing"}
            autoFocus={Boolean(params.phone)}
          />
        </Rise>
        {phase === "writing" ? (
          <Rise order={2} style={styles.action}>
            <Text variant="caption" soft style={styles.centered} accessibilityLiveRegion="polite" testID="compose-note">
              {message ??
                (waiting
                  ? `${who} isn't on Untold yet. Your words will wait for them.`
                  : "Only you can read this. They'll only know that someone left them something.")}
            </Text>
            <BreathingButton
              testID="compose-seal"
              label="Seal it"
              disabled={phone === null || body.trim().length === 0}
              onPress={() => {
                Keyboard.dismiss();
                setPhase("confirming");
              }}
            />
          </Rise>
        ) : (
          <Rise key="confirm" style={styles.action}>
            <Text variant="quote" style={styles.centered} testID="compose-confirm">
              Seal for {who}?
            </Text>
            <Text variant="caption" soft style={styles.centered}>
              Once sealed, it can't be changed or taken back.
            </Text>
            <BreathingButton
              testID="compose-confirm-seal"
              label={phase === "confirming" ? "Seal it" : "Sealing"}
              onPress={seal}
              disabled={phase !== "confirming"}
            />
            <QuietLink
              testID="compose-keep-writing"
              label="Keep writing"
              onPress={() => setPhase("writing")}
              disabled={phase !== "confirming"}
            />
          </Rise>
        )}
      </Sealing>
    </Screen>
  );
}

const styles = StyleSheet.create({
  close: { alignSelf: "flex-start" },
  number: { marginTop: space.lg },
  writing: { flex: 1, marginTop: space.lg },
  action: { gap: space.md, marginTop: space.md },
  centered: { textAlign: "center" },
});
