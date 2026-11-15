import { useSignIn, useSignUp } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { BreathingButton } from "@/components/BreathingButton";
import { LineField } from "@/components/LineField";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Wordmark } from "@/components/Wordmark";
import { authErrorCode, describeAuthError } from "@/lib/authErrors";
import { DIAL_PREFIX, formatNational, nationalToE164, nextNationalDigits } from "@/lib/phone";
import { space } from "@/theme";

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
    <Screen scene="blush" testID="phone-screen">
      <Rise>
        <Wordmark />
      </Rise>
      <View style={styles.middle}>
        <Rise order={1}>
          <Text variant="display">The things you never said finally have somewhere to go.</Text>
        </Rise>
      </View>
      <Rise order={2} style={styles.form}>
        <LineField
          testID="phone-input"
          label="Your phone number"
          prefix={<Text variant="input" soft>{DIAL_PREFIX}</Text>}
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
          message={message ?? "We'll text you a code. Your number is never shown to anyone."}
        />
        <BreathingButton
          testID="phone-continue"
          label={busy ? "Sending" : "Continue"}
          onPress={onContinue}
          disabled={!phone || busy}
        />
      </Rise>
    </Screen>
  );
}

const styles = StyleSheet.create({
  middle: { flex: 1, justifyContent: "center", paddingVertical: space.xl },
  form: { gap: space.lg },
});
