import { useAuth } from "@clerk/expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { IconButton } from "@/components/IconButton";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { type ContactsAccess, getContactsAccess } from "@/lib/contacts";
import { useSession } from "@/lib/session";
import { colors, radius, shadows } from "@/theme";

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { status } = useSession();
  const [access, setAccess] = useState<ContactsAccess | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    getContactsAccess()
      .then(setAccess)
      .catch(() => setAccess("denied"));
  }, []);

  if (status === "loading") return null;
  if (status !== "ready") return <Redirect href="/" />;

  const rows = [
    { label: "Edit profile", value: "", testID: "settings-edit-profile", onPress: () => router.push("/profile-setup") },
    { label: "Contacts access", value: access === null ? "" : access === "granted" ? "Allowed" : "Off" },
    { label: "Notifications", value: "On" },
    { label: "Privacy", value: "" },
  ];

  return (
    <Screen scene="base" testID="settings-screen">
      <View style={styles.nav}>
        <View style={styles.side}>
          <IconButton
            icon="chevron-back"
            label="Back"
            testID="settings-back"
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/profile"))}
          />
        </View>
        <Text style={styles.title} accessibilityRole="header">
          Settings
        </Text>
        <View style={styles.side} />
      </View>
      <View style={styles.list}>
        {rows.map((row, index) => (
          <Pressable
            key={row.label}
            testID={row.testID}
            accessibilityRole={row.onPress ? "button" : undefined}
            accessibilityLabel={row.label}
            disabled={!row.onPress}
            onPress={row.onPress}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            {index > 0 ? <View style={styles.rule} /> : null}
            <Text variant="row" style={styles.label}>
              {row.label}
            </Text>
            <Text variant="caption" soft>
              {row.value}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.ink3} />
          </Pressable>
        ))}
      </View>
      <View style={[styles.list, styles.logout]}>
        <Pressable
          testID="sign-out"
          accessibilityRole="button"
          accessibilityLabel="Log out"
          accessibilityState={{ disabled: leaving }}
          disabled={leaving}
          onPress={() => {
            setLeaving(true);
            signOut().catch(() => setLeaving(false));
          }}
          style={({ pressed }) => [styles.row, styles.centered, (pressed || leaving) && styles.pressed]}>
          <Text variant="row" style={styles.logoutLabel}>
            Log out
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  nav: { height: 52, flexDirection: "row", alignItems: "center", marginHorizontal: -4 },
  side: { width: 72 },
  title: { flex: 1, textAlign: "center", fontSize: 17, lineHeight: 22, fontWeight: "600" },
  list: {
    marginTop: 14,
    borderRadius: radius.list,
    backgroundColor: colors.white,
    boxShadow: shadows.card,
    overflow: "hidden",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 46, paddingVertical: 12, paddingHorizontal: 16 },
  rule: { position: "absolute", top: 0, left: 76, right: 0, height: 1, backgroundColor: colors.line },
  label: { flex: 1, fontWeight: "500" },
  logout: { marginTop: 22 },
  centered: { justifyContent: "center" },
  logoutLabel: { color: colors.red, fontWeight: "600" },
  pressed: { opacity: 0.6 },
});
