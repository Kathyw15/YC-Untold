import { useMutation } from "convex/react";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { BreathingButton } from "@/components/BreathingButton";
import { LineField } from "@/components/LineField";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Wordmark } from "@/components/Wordmark";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { space } from "@/theme";

export default function ProfileSetupScreen() {
  const generateUploadUrl = useMutation(api.users.generateAvatarUploadUrl);
  const updateProfile = useMutation(api.users.updateProfile);
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const trimmedName = name.trim();

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
    } catch {
      setBusy(false);
      setMessage("We couldn't save that. Please try again.");
    }
  }

  return (
    <Screen scene="blush" testID="profile-setup-screen">
      <Rise>
        <Wordmark />
      </Rise>
      <View style={styles.middle}>
        <Rise order={1}>
          <Text variant="title">What should people call you?</Text>
        </Rise>
        <Rise order={2}>
          <Pressable
            testID="profile-photo"
            accessibilityRole="button"
            accessibilityLabel={photo ? "Change photo" : "Add a photo"}
            onPress={choosePhoto}
            disabled={busy}
            style={styles.photo}>
            <Avatar uri={photo?.uri ?? null} name={trimmedName || null} size={72} />
            <Text variant="caption" soft>
              {photo ? "Change photo" : "Add a photo, if you'd like"}
            </Text>
          </Pressable>
        </Rise>
      </View>
      <Rise order={3} style={styles.form}>
        <LineField
          testID="name-input"
          label="Your name"
          value={name}
          onChangeText={setName}
          placeholder="Alex"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          maxLength={40}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={onBegin}
          message={message ?? "This is how you'll appear to the people you know."}
        />
        <BreathingButton
          testID="profile-begin"
          label={busy ? "Saving" : "Begin"}
          onPress={onBegin}
          disabled={!trimmedName || busy}
        />
      </Rise>
    </Screen>
  );
}

const styles = StyleSheet.create({
  middle: { flex: 1, justifyContent: "center", gap: space.lg },
  photo: { flexDirection: "row", alignItems: "center", gap: space.md },
  form: { gap: space.lg },
});
