import { useAuth, useUser } from "@clerk/expo";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { QuietLink } from "@/components/QuietLink";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { StickerGrid } from "@/components/Sticker";
import { Text } from "@/components/Text";
import { api } from "@/convex/_generated/api";
import { formatE164 } from "@/lib/phone";
import { useProfile } from "@/lib/session";
import { space } from "@/theme";

export default function ProfileScreen() {
  const me = useProfile();
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const stickers = useQuery(api.stickers.mine);
  const [leaving, setLeaving] = useState(false);
  const phone = user?.primaryPhoneNumber?.phoneNumber;

  return (
    <Screen scene="soft" aboveTabBar testID="profile-screen">
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
      <Rise order={4} style={styles.badges}>
        <Text variant="label" soft>
          Badges
        </Text>
        {stickers?.length ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            <StickerGrid stickers={stickers} onOpen={(id) => router.push(`/sticker/${id}`)} />
          </ScrollView>
        ) : stickers ? (
          <View style={styles.empty} testID="badges-empty">
            <Text variant="quote" style={styles.centered}>
              Nothing kept yet.
            </Text>
            <Text soft style={[styles.centered, styles.body]}>
              Every conversation that opens leaves a sticker behind. The ones you collect will rest here.
            </Text>
          </View>
        ) : null}
      </Rise>
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
  badges: { flex: 1, gap: space.md, marginTop: space.xl },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: space.sm },
  centered: { textAlign: "center" },
  body: { maxWidth: 280 },
});
