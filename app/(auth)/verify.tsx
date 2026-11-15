import { useSignIn, useSignUp } from "@clerk/expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { type ComponentRef, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { useTone } from "@/components/Atmosphere";
import { QuietLink } from "@/components/QuietLink";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Wordmark } from "@/components/Wordmark";
import { describeAuthError } from "@/lib/authErrors";
import { formatE164 } from "@/lib/phone";
import { space, tones } from "@/theme";

const CODE_LENGTH = 6;
const RESEND_AFTER_SECONDS = 30;

export default function VerifyScreen() {
  const router = useRouter();
  const { phone, flow } = useLocalSearchParams<{ phone: string; flow: "signIn" | "signUp" }>();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_AFTER_SECONDS);

  useEffect(() => {
    if (secondsLeft === 0) return;
    const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  async function verify(value: string) {
    setBusy(true);
    setMessage(null);
    const checked =
      flow === "signUp"
        ? await signUp.verifications.verifyPhoneCode({ code: value })
        : await signIn.phoneCode.verifyCode({ code: value });
    const attempt = flow === "signUp" ? signUp : signIn;
    const finished =
      !checked.error && attempt.status === "complete" ? await attempt.finalize() : { error: checked.error };
    if (!finished.error && attempt.status === "complete") return;
    setBusy(false);
    setCode("");
    setMessage(finished.error ? describeAuthError(finished.error) : "We couldn't finish signing you in.");
    input.current?.focus();
  }

  function onChangeCode(text: string) {
    const value = text.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(value);
    if (value.length === CODE_LENGTH && !busy) void verify(value);
  }

  async function resend() {
    setSecondsLeft(RESEND_AFTER_SECONDS);
    setMessage(null);
    const sent =
      flow === "signUp"
        ? await signUp.verifications.sendPhoneCode()
        : await signIn.phoneCode.sendCode({ phoneNumber: phone });
    setMessage(sent.error ? describeAuthError(sent.error) : "A new code is on its way.");
  }

  return (
    <Screen scene="forest" testID="verify-screen">
      <Rise>
        <Wordmark />
      </Rise>
      <View style={styles.middle}>
        <Rise order={1}>
          <Text variant="title">Enter the code we sent you.</Text>
        </Rise>
        <Rise order={2}>
          <Text soft>{formatE164(phone)}</Text>
        </Rise>
        <Rise order={3}>
          <Pressable onPress={() => input.current?.focus()} accessible={false}>
            <CodeCells code={code} />
            <TextInput
              ref={input}
              testID="code-input"
              accessibilityLabel="Verification code"
              value={code}
              onChangeText={onChangeCode}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              autoFocus
              editable={!busy}
              caretHidden
              maxLength={CODE_LENGTH}
              style={styles.hiddenInput}
            />
          </Pressable>
        </Rise>
        <Text variant="caption" soft accessibilityLiveRegion="polite">
          {busy ? "Checking" : (message ?? " ")}
        </Text>
      </View>
      <Rise order={4} style={styles.links}>
        <QuietLink
          testID="code-resend"
          label={secondsLeft > 0 ? "You can ask for a new code in " + secondsLeft + "s" : "Send a new code"}
          onPress={resend}
          disabled={secondsLeft > 0 || busy}
        />
        <QuietLink testID="code-back" label="Use a different number" onPress={() => router.back()} disabled={busy} />
      </Rise>
    </Screen>
  );
}

function CodeCells({ code }: { code: string }) {
  const tone = tones[useTone()];
  return (
    <View style={styles.cells}>
      {Array.from({ length: CODE_LENGTH }, (_, index) => (
        <View
          key={index}
          style={[styles.cell, { borderBottomColor: index === code.length ? tone.text : tone.hairline }]}>
          <Text variant="input">{code[index] ?? ""}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  middle: { flex: 1, justifyContent: "center", gap: space.md },
  cells: { flexDirection: "row", gap: space.sm + space.xs, marginTop: space.lg },
  cell: {
    flex: 1,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: StyleSheet.hairlineWidth * 2,
  },
  hiddenInput: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, opacity: 0.02 },
  links: { gap: space.xs },
});
