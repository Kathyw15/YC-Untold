import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import { colors, radius, space, tones, type } from "@/theme";

import { useTone } from "./Atmosphere";
import { BreathingButton } from "./BreathingButton";
import { IconButton } from "./IconButton";
import { Text } from "./Text";

type AnswerComposerProps = {
  question: string;
  questionTestID?: string;
  value: string;
  onChangeText: (text: string) => void;
  inputTestID: string;
  leaveIcon: ComponentProps<typeof Ionicons>["name"];
  leaveLabel: string;
  leaveTestID: string;
  onLeave: () => void;
  submitLabel: string;
  submitTestID: string;
  submitDisabled: boolean;
  onSubmit: () => void;
  message: string | null;
};

export function AnswerComposer(props: AnswerComposerProps) {
  const tone = tones[useTone()];
  return (
    <>
      <View style={styles.nav}>
        <IconButton icon={props.leaveIcon} testID={props.leaveTestID} label={props.leaveLabel} onPress={props.onLeave} />
        <View style={styles.title}>
          <View style={styles.titleRow}>
            <Ionicons name="lock-closed" size={15} color={tone.text} />
            <Text style={styles.titleText}>Your Answer</Text>
          </View>
          <Text style={styles.subtitle}>Private · Sealed</Text>
        </View>
        <IconButton icon="ellipsis-horizontal" label="More" onPress={() => {}} />
      </View>
      <Text style={styles.question} numberOfLines={4} testID={props.questionTestID}>
        {props.question}
      </Text>
      <View style={styles.composer}>
        <TextInput
          testID={props.inputTestID}
          multiline
          autoFocus
          accessibilityLabel="Your private answer"
          placeholder="Write what you really think…"
          placeholderTextColor="rgba(11, 11, 15, 0.4)"
          selectionColor={colors.blue}
          textAlignVertical="top"
          maxLength={2000}
          value={props.value}
          onChangeText={props.onChangeText}
          style={[type.composer, styles.input]}
        />
      </View>
      <View style={styles.foot}>
        <BreathingButton
          testID={props.submitTestID}
          label={props.submitLabel}
          icon="lock-closed"
          onPress={props.onSubmit}
          disabled={props.submitDisabled}
        />
        <Text variant="caption" style={styles.caption}>
          {props.message ?? "Only you can see this until a mutual match."}
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  nav: { height: 52, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { alignItems: "center" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  titleText: { fontSize: 17, lineHeight: 21, fontWeight: "600" },
  subtitle: { fontSize: 13, lineHeight: 16, fontWeight: "500", opacity: 0.8 },
  question: { fontSize: 16, lineHeight: 22, fontWeight: "600", opacity: 0.9, marginTop: 12, marginBottom: 14, marginHorizontal: 4 },
  composer: {
    flex: 1,
    minHeight: 180,
    maxHeight: 300,
    borderRadius: radius.feed,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.85)",
    backgroundColor: "rgba(255, 255, 255, 0.58)",
    paddingHorizontal: space.lg,
    paddingVertical: space.lg,
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12)",
  },
  input: { flex: 1, color: colors.ink, outlineStyle: "none" } as object,
  foot: { flex: 1, justifyContent: "flex-end", gap: 12, paddingTop: space.md },
  caption: { textAlign: "center", opacity: 0.85 },
});
