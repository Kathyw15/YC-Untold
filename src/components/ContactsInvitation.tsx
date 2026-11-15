import { StyleSheet, View } from "react-native";

import { space } from "@/theme";

import { BreathingButton } from "./BreathingButton";
import { QuietLink } from "./QuietLink";
import { Rise } from "./Rise";
import { Text } from "./Text";

type ContactsInvitationProps = {
  onContinue: () => void;
  onNotNow: () => void;
  busy?: boolean;
};

export function ContactsInvitation({ onContinue, onNotNow, busy = false }: ContactsInvitationProps) {
  return (
    <View style={styles.root} testID="contacts-invitation">
      <View style={styles.middle}>
        <Rise order={1}>
          <Text variant="title">Who have you been meaning to talk to?</Text>
        </Rise>
        <Rise order={2}>
          <Text soft>
            Seal can look through your contacts to find the people you know who are already here.
          </Text>
        </Rise>
        <Rise order={3}>
          <Text soft>
            Names stay on this phone. Numbers are kept only as a one-way code, never shown to anyone, and no one is told
            you looked.
          </Text>
        </Rise>
      </View>
      <Rise order={4} style={styles.actions}>
        <BreathingButton
          testID="contacts-continue"
          label={busy ? "One moment" : "Allow"}
          onPress={onContinue}
          disabled={busy}
        />
        <QuietLink testID="contacts-not-now" label="Not now" onPress={onNotNow} disabled={busy} />
      </Rise>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  middle: { flex: 1, justifyContent: "center", gap: space.md },
  actions: { gap: space.sm },
});
