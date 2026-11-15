import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";

// An in-app copy of the iOS contacts permission alert, for demo mode and the web, where the real one
// cannot appear. The wording matches the system alert; the body is the sentence from app.json.
const BODY =
  "Seal checks your contacts to find the people you know who are already here. Names never leave your phone.";

type ContactsPermissionAlertProps = {
  visible: boolean;
  onAllow: () => void;
  onDeny: () => void;
};

export function ContactsPermissionAlert({ visible, onAllow, onDeny }: ContactsPermissionAlertProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onDeny}>
      <View style={styles.backdrop} testID="contacts-alert">
        <View style={styles.card} accessibilityRole="alert">
          <Text style={styles.title}>Allow \u201CSeal\u201D to access your contacts?</Text>
          <Text style={styles.body}>{BODY}</Text>
          <View style={styles.buttons}>
            <Pressable
              testID="contacts-alert-deny"
              accessibilityRole="button"
              onPress={onDeny}
              style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
              <Text style={styles.label}>Don\u2019t Allow</Text>
            </Pressable>
            <Pressable
              testID="contacts-alert-allow"
              accessibilityRole="button"
              onPress={onAllow}
              style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
              <Text style={[styles.label, styles.primary]}>Continue</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const system = Platform.OS === "web" ? { fontFamily: "system-ui, -apple-system, 'Helvetica Neue', sans-serif" } : null;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "rgba(0, 0, 0, 0.28)",
  },
  card: {
    width: "100%",
    maxWidth: 320,
    gap: 6,
    padding: 22,
    paddingTop: 26,
    borderRadius: 34,
    backgroundColor: "rgba(240, 239, 236, 0.96)",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
  },
  title: { ...system, fontSize: 17, lineHeight: 22, fontWeight: "600", color: "#000" },
  body: { ...system, fontSize: 15, lineHeight: 20, color: "rgba(60, 60, 67, 0.62)" },
  buttons: { flexDirection: "row", gap: 8, marginTop: 16 },
  button: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: "rgba(120, 120, 128, 0.2)",
  },
  pressed: { opacity: 0.6 },
  label: { ...system, fontSize: 17, fontWeight: "500", color: "#000" },
  primary: { fontWeight: "600" },
});
