import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BreathingButton } from "@/components/BreathingButton";
import { ContactAvatar } from "@/components/ContactAvatar";
import { IconButton } from "@/components/IconButton";
import { LineField } from "@/components/LineField";
import { Rise } from "@/components/Rise";
import { Sealing } from "@/components/Sealing";
import { Text } from "@/components/Text";
import { api } from "@/convex/_generated/api";
import { DIAL_PREFIX, formatE164, formatNational, nationalToE164, nextNationalDigits } from "@/lib/phone";
import { useSession } from "@/lib/session";
import { colors, layout, questionGradients, radius, shadows, type } from "@/theme";

export default function ComposeDirectScreen() {
  const { status } = useSession();
  if (status === "loading") return null;
  if (status !== "ready") return <Redirect href="/" />;
  return <ComposeDirect />;
}

function ComposeDirect() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    phone?: string;
    name?: string;
    here?: "0" | "1";
    userId?: string;
    emoji?: string;
  }>();
  const create = useMutation(api.direct.create);
  const matched = useQuery(api.contacts.listMatched);
  const [digits, setDigits] = useState("");
  const [body, setBody] = useState("");
  const [phase, setPhase] = useState<"writing" | "confirming" | "sealing" | "sealed">("writing");
  const [message, setMessage] = useState<string | null>(null);

  const phone = params.phone ?? nationalToE164(digits);
  const who = params.name ?? (phone ? formatE164(phone) : "them");
  const first = params.name ? params.name.split(" ")[0] : who;
  const waiting = params.here === "0";
  const person = params.userId ? matched?.find((match) => match.userId === params.userId) : undefined;

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
    <View style={styles.backdrop}>
      <View style={[styles.behind, { top: Math.max(insets.top, 8) + 3 }]} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[styles.sheet, { marginTop: Math.max(insets.top, 8) + 13 }]}>
        <LinearGradient
          colors={questionGradients[2]}
          start={{ x: 0.35, y: 0 }}
          end={{ x: 0.65, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View testID="compose-direct-screen" style={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.grab} />
          <Sealing
            sealed={phase === "sealed"}
            title="Sealed."
            body={waiting ? "Your words will wait until they join Seal." : "They’ll only know someone left them a Seal."}
            onDone={() => router.back()}>
            <View style={styles.nav}>
              <View style={styles.navSide}>
                <IconButton
                  icon="close"
                  testID="compose-close"
                  label="Close"
                  onPress={() => router.back()}
                  disabled={phase === "sealing"}
                />
              </View>
              <View style={styles.chip}>
                {phone ? <ContactAvatar uri={person?.avatarUrl} emoji={person?.avatarEmoji ?? params.emoji} name={who} size={30} /> : null}
                <Text numberOfLines={1} style={[styles.chipText, !phone && styles.chipTextAlone]}>
                  {phone ? "To " + first : "To a phone number"}
                </Text>
              </View>
              <View style={styles.navSide} />
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
            {waiting ? (
              <Rise>
                <View style={styles.card}>
                  <Text style={styles.cardText}>
                    <Text style={[styles.cardText, styles.cardStrong]}>{first} isn’t on Seal yet.</Text> Your words will
                    wait for them. We won’t text them.
                  </Text>
                </View>
              </Rise>
            ) : null}
            <Rise order={1} style={[styles.writing, waiting && styles.writingAfterCard]}>
              <View style={styles.composer}>
                <TextInput
                  multiline
                  testID="compose-body"
                  accessibilityLabel={params.phone ? "To " + who : "What you want to say"}
                  placeholder="Leave a Seal…"
                  placeholderTextColor="rgba(11, 11, 15, 0.4)"
                  selectionColor={colors.blue}
                  keyboardAppearance="light"
                  textAlignVertical="top"
                  value={body}
                  onChangeText={setBody}
                  maxLength={2000}
                  editable={phase === "writing"}
                  autoFocus={Boolean(params.phone)}
                  style={[type.composer, styles.input]}
                />
              </View>
            </Rise>
            <View style={styles.action}>
              <BreathingButton
                testID="compose-seal"
                icon="lock-closed"
                label="Seal it"
                disabled={phone === null || body.trim().length === 0}
                onPress={() => {
                  if (phase !== "writing") return;
                  Keyboard.dismiss();
                  setPhase("confirming");
                }}
              />
              <Text variant="caption" soft style={styles.centered} accessibilityLiveRegion="polite" testID="compose-note">
                {message ??
                  (waiting
                    ? "If they join and write to you too, you’ll both be asked to reveal."
                    : "They’ll only know that someone left them a Seal.")}
              </Text>
            </View>
          </Sealing>
        </View>
        {phase === "confirming" || phase === "sealing" ? (
          <View style={[StyleSheet.absoluteFill, styles.overlay]}>
            <Rise key="confirm" style={styles.alert}>
              <Text style={styles.alertTitle} testID="compose-confirm">
                Seal this for {first}?
              </Text>
              <Text style={styles.alertBody}>Once sealed, you can’t edit it or take it back.</Text>
              <View style={styles.alertButtons}>
                <Pressable
                  testID="compose-keep-writing"
                  accessibilityRole="button"
                  accessibilityLabel="Cancel"
                  disabled={phase !== "confirming"}
                  onPress={() => setPhase("writing")}
                  style={({ pressed }) => [styles.alertButton, (pressed || phase !== "confirming") && styles.pressed]}>
                  <Text style={styles.alertCancel}>Cancel</Text>
                </Pressable>
                <Pressable
                  testID="compose-confirm-seal"
                  accessibilityRole="button"
                  accessibilityLabel="Seal"
                  disabled={phase !== "confirming"}
                  onPress={seal}
                  style={({ pressed }) => [styles.alertButton, styles.alertPrimary, (pressed || phase !== "confirming") && styles.pressed]}>
                  <Text style={styles.alertSeal}>Seal</Text>
                </Pressable>
              </View>
            </Rise>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "#101014" },
  behind: {
    position: "absolute",
    left: 16,
    right: 16,
    height: 40,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
  },
  sheet: {
    flex: 1,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    overflow: "hidden",
    backgroundColor: colors.base,
  },
  content: { flex: 1, paddingHorizontal: layout.screenPadding },
  grab: {
    alignSelf: "center",
    width: 38,
    height: 5,
    borderRadius: 3,
    marginTop: 8,
    zIndex: 2,
    backgroundColor: "rgba(11, 11, 15, 0.18)",
  },
  nav: { height: 52, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: -4 },
  navSide: { width: 72, alignItems: "flex-start" },
  chip: {
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
    paddingLeft: 4,
    paddingRight: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
    backgroundColor: "rgba(255, 255, 255, 0.62)",
    boxShadow: shadows.card,
  },
  chipText: { fontSize: 15, lineHeight: 20, fontWeight: "600" },
  chipTextAlone: { paddingLeft: 10, paddingVertical: 5 },
  number: { marginTop: 16 },
  card: {
    marginTop: 6,
    marginBottom: 12,
    padding: 18,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
    backgroundColor: "rgba(255, 255, 255, 0.62)",
    boxShadow: shadows.card,
  },
  cardText: { fontSize: 15, lineHeight: 21, fontWeight: "400" },
  cardStrong: { fontWeight: "700" },
  writing: { flex: 1, marginTop: 22 },
  writingAfterCard: { marginTop: 6 },
  composer: {
    flex: 1,
    maxHeight: 320,
    minHeight: 160,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.85)",
    backgroundColor: "rgba(255, 255, 255, 0.58)",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 26,
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12)",
  },
  input: { flex: 1, color: colors.ink, outlineStyle: "none" } as object,
  action: { gap: 12, marginTop: 16 },
  centered: { textAlign: "center" },
  overlay: { alignItems: "center", justifyContent: "center", backgroundColor: "rgba(10, 10, 20, 0.3)" },
  alert: {
    width: 286,
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "rgba(246, 246, 250, 0.94)",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.25)",
  },
  alertTitle: { fontSize: 17, lineHeight: 22, fontWeight: "600", textAlign: "center", paddingTop: 22, paddingHorizontal: 18, paddingBottom: 6 },
  alertBody: { fontSize: 13, lineHeight: 18, textAlign: "center", color: "#3C3C43", paddingHorizontal: 18, paddingBottom: 18 },
  alertButtons: { flexDirection: "row", gap: 8, paddingHorizontal: 12, paddingBottom: 12 },
  alertButton: {
    flex: 1,
    height: 46,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(120, 120, 128, 0.14)",
  },
  alertPrimary: { backgroundColor: colors.blue },
  alertCancel: { fontSize: 17, lineHeight: 22, fontWeight: "500" },
  alertSeal: { fontSize: 17, lineHeight: 22, fontWeight: "600", color: colors.white },
  pressed: { opacity: 0.6 },
});
