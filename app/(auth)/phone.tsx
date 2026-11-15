import { useSignIn, useSignUp } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet } from "react-native";

import { AuthStep } from "@/components/AuthStep";
import { BoxField } from "@/components/BoxField";
import { BreathingButton } from "@/components/BreathingButton";
import { Rise } from "@/components/Rise";
import { Text } from "@/components/Text";
import { authErrorCode, describeAuthError } from "@/lib/authErrors";
import { DIAL_PREFIX, formatNational, nationalToE164, nextNationalDigits } from "@/lib/phone";

export default function PhoneScreen() {
  const router = useRouter();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const [digits, setDigits] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const phone = nationalToE164(digits);

  async function sendCode(phoneNumber: string): Promise<{ flow: "signIn" | "signUp" } | { error: { code: string } }> {
    const started = await signIn.create({ identifier: phoneNumber });
    if (!started.error) {
      const sent = await signIn.phoneCode.sendCode({ phoneNumber });
      return sent.error ? { error: sent.error } : { flow: "signIn" };
    }
    if (authErrorCode(started.error) !== "form_identifier_not_found") return { error: started.error };

    const created = await signUp.create({ phoneNumber });
    if (created.error) return { error: created.error };
    const sent = await signUp.verifications.sendPhoneCode();
    return sent.error ? { error: sent.error } : { flow: "signUp" };
  }

  async function onContinue() {
    if (!phone || busy) return;
    setBusy(true);
    setMessage(null);
    const result = await sendCode(phone);
    setBusy(false);
    if ("error" in result) {
      setMessage(describeAuthError(result.error));
      return;
    }
    router.push({ pathname: "/verify", params: { phone, flow: result.flow } });
  }

  return (
    <AuthStep
      testID="phone-screen"
      backTestID="phone-back"
      backDisabled={busy}
      onBack={() => (router.canGoBack() ? router.back() : router.replace("/welcome"))}
      footer={
        <BreathingButton
          testID="phone-continue"
          label={busy ? "Sending" : "Next"}
          onPress={onContinue}
          disabled={!phone || busy}
        />
      }>
      <Rise>
        <Text variant="display" style={styles.title}>
          {"What’s your\nnumber?"}
        </Text>
      </Rise>
      <Rise order={1}>
        <Text soft style={styles.lead}>
          We’ll text you a code. We never message your contacts.
        </Text>
      </Rise>
      <Rise order={2}>
        <BoxField
          testID="phone-input"
          label="Your phone number"
          prefix={
            <Text variant="input" style={styles.prefix}>
              {DIAL_PREFIX}
            </Text>
          }
          value={formatNational(digits)}
          onChangeText={(text) => {
            setDigits(nextNationalDigits(text, digits));
            setMessage(null);
          }}
          placeholder="(201) 555-0100"
          keyboardType="number-pad"
          textContentType="telephoneNumber"
          autoComplete="tel-national"
          returnKeyType="done"
          onSubmitEditing={onContinue}
          message={message}
        />
      </Rise>
    </AuthStep>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 20, marginBottom: 12 },
  lead: { marginBottom: 18 },
  prefix: { fontSize: 20, fontWeight: "700" },
});
