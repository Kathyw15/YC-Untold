import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Keyboard, StyleSheet, TextInput, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { BreathingButton } from "@/components/BreathingButton";
import { LineField } from "@/components/LineField";
import { QuietLink } from "@/components/QuietLink";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { api } from "@/convex/_generated/api";
import { DIAL_PREFIX, formatE164, formatNational, nationalToE164, nextNationalDigits } from "@/lib/phone";
import { space, tones, type } from "@/theme";

const SEAL_MS = 2800;
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function ComposeDirectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string; name?: string; here?: "0" | "1" }>();
  const create = useMutation(api.direct.create);
  const [digits, setDigits] = useState("");
  const [body, setBody] = useState("");
  const [phase, setPhase] = useState<"writing" | "confirming" | "sealing" | "sealed">("writing");
  const [message, setMessage] = useState<string | null>(null);
  const sinking = useSharedValue(0);

  const phone = params.phone ?? nationalToE164(digits);
  const who = params.name ?? (phone ? formatE164(phone) : "them");
  const canSeal = phone !== null && body.trim().length > 0;
  const waiting = params.here === "0";

  const wordsStyle = useAnimatedStyle(() => ({
    opacity: interpolate(sinking.get(), [0, 0.3, 1], [1, 0.9, 0]),
    transform: [{ translateY: 56 * sinking.get() }, { scale: 1 - 0.05 * sinking.get() }],
  }));
  const chromeStyle = useAnimatedStyle(() => ({ opacity: interpolate(sinking.get(), [0, 0.25], [1, 0], "clamp") }));
  const blurProps = useAnimatedProps(() => ({ intensity: 20 * sinking.get() }));

  async function seal() {
    if (phase !== "confirming" || !phone) return;
    setMessage(null);
    setPhase("sealing");
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sinking.set(withTiming(1, { duration: SEAL_MS, easing: Easing.inOut(Easing.cubic) }));
    const [failure] = await Promise.all([
      create({ phone, body }).then(
        () => null,
        (error: unknown) => error ?? new Error("Sealing failed"),
      ),
      new Promise((resolve) => setTimeout(resolve, SEAL_MS)),
    ]);
    if (!failure) {
      setPhase("sealed");
      return;
    }
    sinking.set(withTiming(0, { duration: 600 }));
    setPhase("writing");
    setMessage(
      failure instanceof ConvexError && failure.data?.code === "CANNOT_WRITE_TO_SELF"
        ? "That's your own number."
        : "We couldn't seal that. Please try again.",
    );
  }

  return (
    <Screen scene="forest" testID="compose-direct-screen">
      {phase !== "sealed" ? (
        <>
          <Animated.View style={[styles.top, chromeStyle]}>
            <QuietLink testID="compose-close" label="Close" onPress={() => router.back()} disabled={phase !== "writing"} />
          </Animated.View>
          {params.phone ? (
            <Animated.View style={[styles.recipient, chromeStyle]}>
              <Text variant="label" soft testID="compose-recipient">
                To {who}
              </Text>
              {waiting ? (
                <Text variant="caption" soft testID="compose-not-here">
                  {who} isn't on Untold yet. Your words will wait for them.
                </Text>
              ) : null}
            </Animated.View>
          ) : (
            <Animated.View style={chromeStyle}>
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
            </Animated.View>
          )}
          <Animated.View style={[styles.words, wordsStyle]}>
            <TextInput
              testID="compose-body"
              accessibilityLabel="What you want to say"
              value={body}
              onChangeText={setBody}
              placeholder="What have you never said?"
              placeholderTextColor={tones.dark.hairline}
              selectionColor={tones.dark.text}
              keyboardAppearance="dark"
              multiline
              maxLength={2000}
              autoFocus={Boolean(params.phone)}
              editable={phase === "writing"}
              style={[type.quote, styles.input]}
            />
          </Animated.View>
          {phase === "writing" ? (
            <View style={styles.actions}>
              <Text variant="caption" soft style={styles.centered} accessibilityLiveRegion="polite">
                {message ?? "Only you can read this. They'll only know that someone left them something."}
              </Text>
              <BreathingButton
                testID="compose-seal"
                label="Seal it"
                disabled={!canSeal}
                onPress={() => {
                  Keyboard.dismiss();
                  setPhase("confirming");
                }}
              />
            </View>
          ) : (
            <Animated.View style={[styles.actions, chromeStyle]}>
              <Text variant="quote" style={styles.centered} testID="compose-confirm">
                Seal for {who}?
              </Text>
              <Text variant="caption" soft style={styles.centered}>
                Once sealed, it can't be changed or taken back.
              </Text>
              <BreathingButton
                testID="compose-confirm-seal"
                label="Seal it"
                onPress={seal}
                disabled={phase !== "confirming"}
              />
              <QuietLink
                testID="compose-keep-writing"
                label="Keep writing"
                onPress={() => setPhase("writing")}
                disabled={phase !== "confirming"}
              />
            </Animated.View>
          )}
        </>
      ) : null}
      <AnimatedBlurView tint="dark" animatedProps={blurProps} style={StyleSheet.absoluteFill} pointerEvents="none" />
      {phase === "sealed" ? (
        <View style={styles.sealed} testID="compose-sealed">
          <Rise order={1}>
            <Text variant="display" style={styles.centered}>
              Sealed.
            </Text>
          </Rise>
          <Rise order={3}>
            <Text soft style={[styles.centered, styles.sealedBody]}>
              {waiting
                ? `Your words are safe here. They will wait until ${who} arrives.`
                : `Your words are safe here. ${params.name ?? "They"} will only know that someone left a message.`}
            </Text>
          </Rise>
          <Rise order={6}>
            <QuietLink testID="compose-done" label="Done" onPress={() => router.back()} />
          </Rise>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: "flex-start", marginBottom: space.lg },
  recipient: { gap: space.xs },
  words: { flex: 1, paddingTop: space.lg },
  input: { flex: 1, color: tones.dark.text, textAlignVertical: "top" },
  actions: { gap: space.md },
  centered: { textAlign: "center" },
  sealed: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center", gap: space.md, padding: space.xl },
  sealedBody: { maxWidth: 280 },
});
