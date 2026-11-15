import { useAuth, useUser } from "@clerk/expo";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { QuietLink } from "@/components/QuietLink";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { formatE164 } from "@/lib/phone";
import { useProfile } from "@/lib/session";
import { space } from "@/theme";

export default function ProfileScreen() {
  const me = useProfile();
  const { signOut } = useAuth();
  const { user } = useUser();
  const [leaving, setLeaving] = useState(false);
  const phone = user?.primaryPhoneNumber?.phoneNumber;

  return (
    <Screen scene="dawn" aboveTabBar testID="profile-screen">
      <Rise>
        <Text variant="label" soft>
          Profile
        </Text>
      </Rise>
      <View style={styles.identity}>
        <Rise order={1}>
          <Avatar uri={me.avatarUrl} name={me.name} />
        </Rise>
        <Rise order={2}>
          <Text variant="display" style={styles.centered} testID="profile-name">
            {me.name}
          </Text>
        </Rise>
        {phone ? (
          <Rise order={3}>
            <Text variant="caption" soft style={styles.centered}>
              {formatE164(phone)} · only you can see this
            </Text>
          </Rise>
        ) : null}
      </View>
      <View style={styles.history}>
        <Rise order={4}>
          <Text variant="quote" style={styles.centered}>
            Nothing kept yet.
          </Text>
        </Rise>
        <Rise order={5}>
          <Text soft style={[styles.centered, styles.body]}>
            The questions you ask and the words you seal will rest here, for you alone.
          </Text>
        </Rise>
      </View>
      <QuietLink
        testID="sign-out"
        label={leaving ? "Signing out" : "Sign out"}
        disabled={leaving}
        onPress={() => {
          setLeaving(true);
          signOut().catch(() => setLeaving(false));
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: { alignItems: "center", gap: space.md, marginTop: space.xxl },
  history: { flex: 1, alignItems: "center", justifyContent: "center", gap: space.sm },
  centered: { textAlign: "center" },
  body: { maxWidth: 280 },
});
