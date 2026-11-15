import { useSignIn, useSignUp } from "@clerk/expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { type ComponentRef, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { AuthStep } from "@/components/AuthStep";
import { BreathingButton } from "@/components/BreathingButton";
import { Rise } from "@/components/Rise";
import { Text } from "@/components/Text";
import { describeAuthError } from "@/lib/authErrors";
import { DIAL_PREFIX, formatE164, formatNational } from "@/lib/phone";
import { colors, shadows } from "@/theme";

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
    <AuthStep
      testID="verify-screen"
      backTestID="code-back"
      backDisabled={busy}
      onBack={() => router.back()}
      footer={
        <BreathingButton
          testID="code-next"
          label={busy ? "Checking" : "Next"}
          onPress={() => void verify(code)}
          disabled={code.length !== CODE_LENGTH || busy}
        />
      }>
      <Rise>
        <Text variant="display" style={styles.title}>
          Enter the code
        </Text>
      </Rise>
      <Rise order={1}>
        <Text soft>
          Sent to {phone.startsWith(DIAL_PREFIX) ? DIAL_PREFIX + " " + formatNational(phone.slice(DIAL_PREFIX.length)) : formatE164(phone)}
        </Text>
      </Rise>
      <Rise order={2}>
        <Pressable onPress={() => input.current?.focus()} accessible={false}>
          <View style={styles.cells}>
            {Array.from({ length: CODE_LENGTH }, (_, index) => (
              <View key={index} style={styles.cell}>
                <Text style={styles.digit}>{code[index] ?? ""}</Text>
              </View>
            ))}
          </View>
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
      <Rise order={3}>
        <View style={styles.resend}>
          <Pressable
            testID="code-resend"
            accessibilityRole="button"
            accessibilityLabel="Resend code"
            accessibilityState={{ disabled: secondsLeft > 0 || busy }}
            disabled={secondsLeft > 0 || busy}
            hitSlop={12}
            onPress={resend}>
            <Text variant="label">Resend code</Text>
          </Pressable>
          {secondsLeft > 0 ? (
            <Text variant="caption" soft>
              {" · available in 0:" + String(secondsLeft).padStart(2, "0")}
            </Text>
          ) : null}
        </View>
      </Rise>
      <Text variant="caption" soft style={styles.message} accessibilityLiveRegion="polite">
        {busy ? "Checking" : (message ?? " ")}
      </Text>
    </AuthStep>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 20, marginBottom: 12 },
  cells: { flexDirection: "row", gap: 8, marginTop: 22, marginBottom: 14 },
  cell: {
    flex: 1,
    height: 60,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    boxShadow: shadows.card,
  },
  digit: { fontSize: 26, lineHeight: 32, fontWeight: "600" },
  hiddenInput: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.02,
    color: "transparent",
    backgroundColor: "transparent",
    borderWidth: 0,
    outlineStyle: "none",
  } as object,
  resend: { flexDirection: "row", alignItems: "center" },
  message: { marginTop: 10 },
});
