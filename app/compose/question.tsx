import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation } from "convex/react";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

import { AnswerComposer } from "@/components/AnswerComposer";
import { QuestionScene } from "@/components/QuestionBackground";
import { Screen } from "@/components/Screen";
import { Sealing } from "@/components/Sealing";
import { Text } from "@/components/Text";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { colors, radius, shadows, space } from "@/theme";

const AUDIENCES = { everyone: "Everyone", friends: "Friends only" } as const;

type Audience = keyof typeof AUDIENCES;

const TOPICS = ["Growing up", "Friendship", "Love", "Family", "Life", "Regrets", "Work"];

export default function ComposeQuestionScreen() {
  const router = useRouter();
  const create = useMutation(api.questions.create);
  const generateUploadUrl = useMutation(api.questions.generateUploadUrl);
  const [step, setStep] = useState<"question" | "answer">("question");
  const [text, setText] = useState("");
  const [audience, setAudience] = useState<Audience>("everyone");
  const [topic, setTopic] = useState<string | null>(null);
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [gradient] = useState(() => Math.floor(Math.random() * 5));
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [sealed, setSealed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const otherAudience: Audience = audience === "everyone" ? "friends" : "everyone";
  const ready = text.trim().length > 0;

  async function choosePhoto() {
    const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7 });
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
    if (!response.ok) throw new Error("Photo upload failed");
    return ((await response.json()) as { storageId: Id<"_storage"> }).storageId;
  }

  async function seal() {
    if (busy || answer.trim().length === 0) return;
    setBusy(true);
    setMessage(null);
    try {
      const imageId = photo ? await uploadPhoto(photo) : undefined;
      await create({ text, audience, answer, tags: topic ? [topic] : [], gradient, imageId });
      setSealed(true);
    } catch {
      setMessage("That didn't go through. Try once more.");
      setBusy(false);
    }
  }

  if (step === "answer") {
    return (
      <QuestionScene
        question={{ id: "", gradient, photo: null, imageUrl: photo?.uri ?? null }}
        variant="screen"
        testID="compose-question-screen">
        <Sealing
          sealed={sealed}
          title="Posted."
          body="Your question is out there now. Your answer is sealed where only you can read it."
          onDone={() => router.back()}>
          <AnswerComposer
            question={text.trim()}
            value={answer}
            onChangeText={setAnswer}
            inputTestID="own-answer-input"
            leaveIcon="chevron-back"
            leaveLabel="Back"
            leaveTestID="compose-back"
            onLeave={() => setStep("question")}
            submitLabel={busy ? "Posting" : "Seal & Post"}
            submitTestID="seal-question"
            submitDisabled={busy || answer.trim().length === 0}
            onSubmit={seal}
            message={message}
          />
        </Sealing>
      </QuestionScene>
    );
  }

  return (
    <Screen scene="base" testID="compose-question-screen" contentStyle={styles.screen}>
      <View style={styles.nav}>
        <Pressable
          testID="compose-close"
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          hitSlop={space.sm}
          onPress={() => router.back()}
          style={styles.navSide}>
          <Text style={styles.navLink}>Cancel</Text>
        </Pressable>
        <Text style={styles.navTitle}>New Question</Text>
        <Pressable
          testID="question-continue"
          accessibilityRole="button"
          accessibilityLabel="Next"
          accessibilityState={{ disabled: !ready }}
          disabled={!ready}
          hitSlop={space.sm}
          onPress={() => setStep("answer")}
          style={[styles.navSide, styles.navRight, !ready && styles.dim]}>
          <Text style={[styles.navLink, styles.bold]}>Next</Text>
        </Pressable>
      </View>
      <ScrollView
        style={styles.fill}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <TextInput
          testID="question-input"
          multiline
          autoFocus
          accessibilityLabel="Your question"
          placeholder="What do you wonder about?"
          placeholderTextColor={colors.ink3}
          selectionColor={colors.blue}
          maxLength={240}
          value={text}
          onChangeText={setText}
          style={styles.question}
        />
        <View style={photo ? styles.photoArea : styles.addArea}>
          {photo ? (
            <Pressable
              testID="question-photo"
              accessibilityRole="button"
              accessibilityLabel="Remove photo"
              onPress={() => setPhoto(null)}
              style={styles.polaroid}>
              <Image source={{ uri: photo.uri }} style={styles.polaroidImage} contentFit="cover" />
            </Pressable>
          ) : (
            <Pressable
              testID="question-add-photo"
              accessibilityRole="button"
              accessibilityLabel="Add photo, optional"
              onPress={choosePhoto}
              style={styles.addPhoto}>
              <Ionicons name="image-outline" size={19} color={colors.ink} />
              <Text style={styles.addPhotoText}>
                Add photo <Text style={styles.optional}>optional</Text>
              </Text>
            </Pressable>
          )}
        </View>
        <View style={styles.notice}>
          <View style={styles.lock}>
            <Ionicons name="lock-closed" size={19} color={colors.ink} />
          </View>
          <View style={styles.fill}>
            <Text style={styles.noticeTitle}>Your answer stays sealed.</Text>
            <Text variant="caption" soft style={styles.noticeBody}>
              Your question will be seen by your audience, but your answer is private until a match.
            </Text>
          </View>
          <Ionicons name="information-circle-outline" size={21} color={colors.ink2} />
        </View>
        <Pressable
          testID={"audience-" + otherAudience}
          accessibilityRole="button"
          accessibilityLabel={"Audience: " + AUDIENCES[audience]}
          onPress={() => setAudience(otherAudience)}
          style={styles.row}>
          <Ionicons name="people" size={22} color={colors.ink} />
          <Text style={styles.rowTitle}>Audience</Text>
          <Text style={styles.rowValue}>{AUDIENCES[audience]}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.ink3} />
        </Pressable>
        <View style={styles.row}>
          <Text style={styles.hash}>#</Text>
          <Text style={styles.rowTitle}>Topic</Text>
          {topic ? (
            <View style={[styles.topic, styles.topicOn]}>
              <Text style={[styles.topicText, styles.topicOnText]}>{topic}</Text>
            </View>
          ) : (
            <Text style={styles.rowValue}>None</Text>
          )}
          <Ionicons name="chevron-forward" size={16} color={colors.ink3} />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={styles.topicsScroll}
          contentContainerStyle={styles.topics}>
          {TOPICS.map((option) => {
            const selected = option === topic;
            return (
              <Pressable
                key={option}
                testID={"topic-" + option.toLowerCase().replace(" ", "-")}
                accessibilityRole="button"
                accessibilityLabel={option}
                accessibilityState={{ selected }}
                onPress={() => setTopic(selected ? null : option)}
                style={[styles.topic, selected && styles.topicOn]}>
                <Text style={[styles.topicText, selected && styles.topicOnText]}>{option}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0, paddingTop: space.md },
  fill: { flex: 1 },
  nav: { height: 52, flexDirection: "row", alignItems: "center", paddingHorizontal: 16 },
  navSide: { width: 90 },
  navRight: { alignItems: "flex-end" },
  navLink: { fontSize: 17, lineHeight: 22 },
  bold: { fontWeight: "700" },
  dim: { opacity: 0.35 },
  navTitle: { flex: 1, textAlign: "center", fontSize: 17, lineHeight: 22, fontWeight: "600" },
  body: { paddingHorizontal: 24, paddingBottom: 30 },
  question: {
    minHeight: 110,
    marginTop: 22,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "700",
    letterSpacing: -0.96,
    color: colors.ink,
    outlineStyle: "none",
  } as object,
  addArea: { height: 96, alignItems: "flex-end", justifyContent: "center" },
  photoArea: { height: 212, alignItems: "flex-end", paddingRight: 30, paddingTop: 18 },
  addPhoto: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
    backgroundColor: "rgba(255, 255, 255, 0.62)",
    boxShadow: shadows.card,
  },
  addPhotoText: { fontSize: 15, lineHeight: 20, fontWeight: "600" },
  optional: { fontSize: 15, lineHeight: 20, fontWeight: "400", color: colors.ink2 },
  polaroid: {
    width: 172,
    padding: 8,
    paddingBottom: 28,
    borderRadius: 6,
    backgroundColor: colors.white,
    transform: [{ rotate: "6deg" }],
    boxShadow: "0 14px 34px rgba(20, 20, 40, 0.18)",
  },
  polaroidImage: { width: "100%", height: 124, borderRadius: 2 },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.white,
    backgroundColor: "rgba(234, 236, 243, 0.72)",
    padding: 18,
    marginTop: 6,
    marginBottom: 10,
  },
  lock: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    boxShadow: shadows.card,
  },
  noticeTitle: { fontSize: 17, lineHeight: 22, fontWeight: "600" },
  noticeBody: { marginTop: 3 },
  row: {
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  rowTitle: { flex: 1, fontSize: 17, lineHeight: 22, fontWeight: "600" },
  rowValue: { fontSize: 16, lineHeight: 21, color: colors.ink2, marginRight: -6 },
  hash: { width: 22, textAlign: "center", fontSize: 22, lineHeight: 26, fontWeight: "700" },
  topicsScroll: { marginHorizontal: -24, marginTop: 18, flexGrow: 0 },
  topics: { gap: 8, paddingHorizontal: 24 },
  topic: {
    height: 36,
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: space.md,
  },
  topicOn: { backgroundColor: colors.blueSoft, borderColor: colors.blueSoft },
  topicText: { fontSize: 15, lineHeight: 20, fontWeight: "500", color: "#45454D" },
  topicOnText: { color: colors.blue, fontWeight: "600" },
});
