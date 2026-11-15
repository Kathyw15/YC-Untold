import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import type { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";

import { colors, shadows } from "@/theme";

import { AuthStepBody } from "./AuthStep";
import { BreathingButton } from "./BreathingButton";
import { QuietLink } from "./QuietLink";
import { Rise } from "./Rise";
import { Text } from "./Text";

type ContactsInvitationProps = {
  onContinue: () => void;
  onNotNow: () => void;
  onBack?: () => void;
  busy?: boolean;
};

const FACES = [
  { source: require("@/assets/demo/avatars/priya.jpg"), size: 76, left: -125, top: 26 },
  { source: require("@/assets/demo/avatars/maya.jpg"), size: 96, left: -43, top: 0 },
  { source: require("@/assets/demo/avatars/jordan.jpg"), size: 72, left: 47, top: 34 },
];

export function ContactsInvitation({ onContinue, onNotNow, onBack, busy = false }: ContactsInvitationProps) {
  return (
    <View style={styles.root} testID="contacts-invitation">
      <AuthStepBody
        onBack={onBack}
        backTestID="contacts-back"
        backDisabled={busy}
        footer={
          <>
            <BreathingButton
              testID="contacts-continue"
              label={busy ? "One moment" : "Allow"}
              onPress={onContinue}
              disabled={busy}
            />
            <QuietLink testID="contacts-not-now" label="Not now" onPress={onNotNow} disabled={busy} />
          </>
        }>
        <Rise>
          <View style={styles.faces}>
            {FACES.map((face, index) => (
              <View
                key={index}
                style={[
                  styles.face,
                  {
                    width: face.size + 6,
                    height: face.size + 6,
                    borderRadius: face.size / 2 + 3,
                    marginLeft: face.left,
                    top: face.top,
                  },
                ]}>
                <Image
                  source={face.source}
                  style={{ width: face.size, height: face.size, borderRadius: face.size / 2 }}
                  contentFit="cover"
                />
              </View>
            ))}
          </View>
        </Rise>
        <Rise order={1}>
          <Text variant="display" style={styles.title}>
            {"Find the people\nyou know"}
          </Text>
        </Rise>
        <Rise order={2}>
          <Text soft style={styles.lead}>
            Seal uses your contacts to show which of your friends are here, so you can write to them.
          </Text>
        </Rise>
        <Rise order={3}>
          <Fact
            icon="shield-checkmark-outline"
            color="#12A06A"
            title="We store"
            body="Phone numbers, scrambled (hashed), only to match friends."
          />
        </Rise>
        <Rise order={4}>
          <Fact
            icon="eye-off-outline"
            color="#E0457B"
            title="We never store"
            body="Names, photos or your address book. We never text anyone."
          />
        </Rise>
      </AuthStepBody>
    </View>
  );
}

type FactProps = {
  icon: ComponentProps<typeof Ionicons>["name"];
  color: string;
  title: string;
  body: string;
};

function Fact({ icon, color, title, body }: FactProps) {
  return (
    <View style={styles.fact}>
      <View style={styles.factIcon}>
        <Ionicons name={icon} size={21} color={color} />
      </View>
      <View style={styles.factText}>
        <Text variant="row">{title}</Text>
        <Text variant="caption" soft style={styles.factBody}>
          {body}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  faces: { height: 150, marginTop: 6 },
  face: {
    position: "absolute",
    left: "50%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    boxShadow: shadows.card,
  },
  title: { marginTop: 12, marginBottom: 12 },
  lead: { marginBottom: 14 },
  fact: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    padding: 16,
    marginVertical: 5,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
    backgroundColor: "rgba(255, 255, 255, 0.62)",
    boxShadow: shadows.card,
  },
  factIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    boxShadow: shadows.card,
  },
  factText: { flex: 1 },
  factBody: { marginTop: 2 },
});
