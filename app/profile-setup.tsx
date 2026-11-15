import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation } from "convex/react";
import * as ImagePicker from "expo-image-picker";
import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AuthStep } from "@/components/AuthStep";
import { Avatar } from "@/components/Avatar";
import { BoxField } from "@/components/BoxField";
import { BreathingButton } from "@/components/BreathingButton";
import { Rise } from "@/components/Rise";
import { Text } from "@/components/Text";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useProfile, useSession } from "@/lib/session";
import { colors, shadows } from "@/theme";

export default function ProfileSetupScreen() {
  const { status } = useSession();
  if (status === "loading") return null;
  if (status !== "ready") return <Redirect href="/" />;
  return <ProfileEditor />;
}

function ProfileEditor() {
  const me = useProfile();
  const router = useRouter();
  const generateUploadUrl = useMutation(api.users.generateAvatarUploadUrl);
  const updateProfile = useMutation(api.users.updateProfile);
  const [name, setName] = useState(me.name ?? "");
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const trimmedName = name.trim();
  const photoUri = photo?.uri ?? me.avatarUrl;

  function leave() {
    if (router.canGoBack()) router.back();
    else router.replace("/profile");
  }

  async function choosePhoto() {
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!picked.canceled) setPhoto(picked.assets[0]);
  }

  async function uploadPhoto(asset: ImagePicker.ImagePickerAsset): Promise<Id<"_storage">> {
    const uploadUrl = await generateUploadUrl();
    const file = await (await fetch(asset.uri)).blob();
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": asset.mimeType ?? "image/jpeg" },
      body: file,
    });
    if (!response.ok) throw new Error("Avatar upload failed");
    return ((await response.json()) as { storageId: Id<"_storage"> }).storageId;
  }

  async function onBegin() {
    if (!trimmedName || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const avatarId = photo ? await uploadPhoto(photo) : undefined;
      await updateProfile({ name: trimmedName, avatarId });
      leave();
    } catch {
      setBusy(false);
      setMessage("We couldn’t save that. Please try again.");
    }
  }

  return (
    <AuthStep
      testID="profile-setup-screen"
      backTestID="profile-setup-back"
      backDisabled={busy}
      onBack={leave}
      footer={
        <BreathingButton
          testID="profile-begin"
          label={busy ? "Saving" : "Continue"}
          onPress={onBegin}
          disabled={!trimmedName || busy}
        />
      }>
      <Rise>
        <Text variant="display" style={styles.title}>
          {"What should\nfriends call you?"}
        </Text>
      </Rise>
      <Rise order={1}>
        <Pressable
          testID="profile-photo"
          accessibilityRole="button"
          accessibilityLabel={photoUri ? "Change photo" : "Add a photo"}
          onPress={choosePhoto}
          disabled={busy}
          style={styles.photo}>
          <View style={styles.ring}>
            {photoUri || trimmedName ? (
              <Avatar uri={photoUri} name={trimmedName || null} size={132} />
            ) : (
              <View style={styles.blank}>
                <Ionicons name="person" size={56} color={colors.ink3} />
              </View>
            )}
            <View style={styles.camera}>
              <Ionicons name="camera-outline" size={18} color={colors.white} />
            </View>
          </View>
          <Text variant="caption" soft style={styles.centered}>
            Add a photo (optional)
          </Text>
        </Pressable>
      </Rise>
      <Rise order={2} style={styles.field}>
        <BoxField
          testID="name-input"
          label="Your name"
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          maxLength={40}
          returnKeyType="done"
          onSubmitEditing={onBegin}
          message={message}
        />
      </Rise>
    </AuthStep>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 20, marginBottom: 12 },
  photo: { alignItems: "center", gap: 8, marginTop: 14 },
  ring: {
    width: 138,
    height: 138,
    borderRadius: 69,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    boxShadow: shadows.card,
  },
  blank: {
    width: 132,
    height: 132,
    borderRadius: 66,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.fill,
  },
  camera: {
    position: "absolute",
    right: -2,
    bottom: 4,
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ink,
  },
  centered: { textAlign: "center" },
  field: { marginTop: 22 },
});
