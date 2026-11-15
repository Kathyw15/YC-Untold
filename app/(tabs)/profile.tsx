import { useUser } from "@clerk/expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "convex/react";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BreathingButton } from "@/components/BreathingButton";
import { IconButton } from "@/components/IconButton";
import { QuestionBackground } from "@/components/QuestionBackground";
import { Segments } from "@/components/Segments";
import { StickerArt } from "@/components/Sticker";
import { Text } from "@/components/Text";
import { api } from "@/convex/_generated/api";
import { firstName, personName } from "@/lib/names";
import { useProfile } from "@/lib/session";
import { colors, layout, questionGradients, radius, shadows } from "@/theme";

const TABS = [
  { value: "questions", label: "Questions" },
  { value: "badges", label: "Badges" },
] as const;

const HERO_HEIGHT = 500;
const TILTS = ["-6deg", "5deg", "-3deg", "7deg", "-5deg", "4deg", "-7deg"];

function collectedOn(time: number) {
  const then = new Date(time);
  if (then.toDateString() === new Date().toDateString()) return "Today";
  return then.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ProfileScreen() {
  const me = useProfile();
  const { user } = useUser();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const stickers = useQuery(api.stickers.mine);
  const questions = useQuery(api.questions.mine);
  const matches = useQuery(api.matches.list);
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("questions");
  const conversations = matches?.filter((match) => match.state === "revealed").length;
  const joined = user?.createdAt
    ? "joined " + user.createdAt.toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;

  return (
    <View style={styles.root} testID="profile-screen">
      <View style={styles.hero}>
        {me.avatarUrl ? (
          <Image
            source={{ uri: me.avatarUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            contentPosition={{ top: "30%", left: "50%" }}
            transition={400}
            accessibilityLabel="Profile photo"
          />
        ) : (
          <LinearGradient
            colors={questionGradients[4]}
            start={{ x: 0.35, y: 0 }}
            end={{ x: 0.65, y: 1 }}
            style={[StyleSheet.absoluteFill, styles.heroBlank]}>
            <View style={styles.heroMonogram}>
              {me.name ? (
                <Text style={styles.heroInitial}>{me.name.trim().charAt(0).toUpperCase()}</Text>
              ) : (
                <Ionicons name="person" size={52} color={colors.ink2} />
              )}
            </View>
          </LinearGradient>
        )}
        <LinearGradient
          colors={[
            "rgba(255, 255, 255, 0.35)",
            "rgba(255, 255, 255, 0)",
            "rgba(255, 255, 255, 0)",
            "rgba(255, 255, 255, 0.85)",
            colors.white,
          ]}
          locations={[0, 0.18, 0.66, 0.92, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + layout.tabBarHeight + 54 }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.spacer} />
        <View style={styles.panel}>
          <View style={styles.glass}>
            <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.5)", "rgba(255, 255, 255, 0.84)", colors.white]}
              locations={[0, 0.58, 1]}
              style={styles.glassFade}
            />
            <View style={styles.glassSolid} />
          </View>
          {me.name ? (
            <Text style={styles.name} testID="profile-name">
              {me.name}
            </Text>
          ) : (
            <Pressable accessibilityRole="button" onPress={() => router.push("/profile-setup")}>
              <Text style={styles.name} testID="profile-name">
                Add your name
              </Text>
            </Pressable>
          )}
          {joined ? (
            <Text soft style={styles.handle}>
              {joined}
            </Text>
          ) : null}
          <View style={styles.stats}>
            <Stat value={questions?.length} label="Questions" />
            <Stat value={conversations} label="Conversations" divided />
            <Stat value={stickers?.length} label="Badges" divided testID="profile-badge-count" />
          </View>
          <Segments testID="profile-tab" options={TABS} value={tab} onChange={setTab} />
          <View style={styles.items}>
            {tab === "questions" ? (
              questions?.length ? (
                questions.map((question, index) => (
                  <Pressable
                    key={question.id}
                    testID="profile-question"
                    accessibilityRole="button"
                    onPress={() => router.push({ pathname: "/question/[id]", params: { id: question.id } })}
                    style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                    {index > 0 ? <View style={styles.rule} /> : null}
                    <View style={styles.thumb}>
                      <QuestionBackground question={question} style={styles.thumbFill} />
                    </View>
                    <View style={styles.rowText}>
                      <Text numberOfLines={3} style={styles.rowTitle}>
                        {question.text}
                      </Text>
                      <View style={styles.rowMeta}>
                        <Ionicons name="people" size={16} color={colors.ink2} />
                        <Text soft style={styles.meta}>
                          {question.responseCount === 0 ? "No answers yet" : question.responseCount + " answered"}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="bookmark-outline" size={21} color={colors.ink2} style={styles.bookmark} />
                  </Pressable>
                ))
              ) : questions ? (
                <View style={styles.empty}>
                  <Text soft style={styles.emptyText} testID="profile-questions-empty">
                    You haven’t asked anything yet.
                  </Text>
                  <BreathingButton
                    testID="profile-ask"
                    icon="add"
                    label="Ask a question"
                    onPress={() => router.push("/compose/question")}
                  />
                </View>
              ) : null
            ) : null}
            {tab === "badges" && stickers ? (
              <View style={styles.wall} testID="sticker-grid">
                {stickers.map((sticker, index) => (
                  <Pressable
                    key={sticker.id}
                    testID="sticker-tile"
                    accessibilityRole="button"
                    accessibilityLabel={sticker.title ?? "Sticker"}
                    onPress={() => router.push(`/sticker/${sticker.id}`)}
                    style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
                    <View style={{ transform: [{ rotate: TILTS[index % TILTS.length] }] }}>
                      <StickerArt sticker={sticker} size={88} />
                    </View>
                    <Text numberOfLines={2} style={styles.tileTitle}>
                      {sticker.title}
                    </Text>
                    <Text soft numberOfLines={2} style={styles.tileMeta}>
                      {"with " + firstName(personName(sticker.other.name)) + " · " + collectedOn(sticker.createdAt)}
                    </Text>
                  </Pressable>
                ))}
                <View style={styles.tile} testID={stickers.length === 0 ? "badges-empty" : undefined}>
                  <View style={styles.next}>
                    <Ionicons name="add" size={18} color={colors.ink2} />
                    <Text soft style={styles.nextLabel}>
                      Your next conversation
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
      <View style={[styles.gear, { top: insets.top + 14 }]}>
        <IconButton
          testID="profile-settings"
          icon="settings-outline"
          label="Settings"
          onPress={() => router.push("/settings")}
        />
      </View>
    </View>
  );
}

function Stat({ value, label, divided, testID }: { value?: number; label: string; divided?: boolean; testID?: string }) {
  return (
    <View style={[styles.stat, divided && styles.statDivided]} testID={testID}>
      <Text style={styles.statValue}>{value ?? " "}</Text>
      <Text soft style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  hero: { position: "absolute", top: 0, left: 0, right: 0, height: HERO_HEIGHT, pointerEvents: "none" },
  heroBlank: { alignItems: "center", paddingTop: 120 },
  heroMonogram: {
    width: 124,
    height: 124,
    borderRadius: 62,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
    backgroundColor: "rgba(255, 255, 255, 0.55)",
    boxShadow: shadows.card,
  },
  heroInitial: { fontSize: 54, lineHeight: 62, fontWeight: "800", letterSpacing: -1.5, color: colors.ink },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 12 },
  spacer: { height: 300 },
  panel: { paddingTop: 22, paddingHorizontal: 18, paddingBottom: 10 },
  gear: { position: "absolute", right: 18 },
  glass: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
    overflow: "hidden",
    boxShadow: "0 -6px 30px rgba(0, 0, 0, 0.06)",
  },
  glassFade: { position: "absolute", top: 0, left: 0, right: 0, height: 260 },
  glassSolid: { position: "absolute", top: 260, left: 0, right: 0, bottom: 0, backgroundColor: colors.white },
  name: { fontSize: 34, lineHeight: 36, fontWeight: "800", letterSpacing: -1.2 },
  handle: { fontSize: 15, lineHeight: 20, marginTop: 6 },
  stats: { flexDirection: "row", marginTop: 20, marginBottom: 18 },
  stat: { flex: 1, alignItems: "center" },
  statDivided: { borderLeftWidth: 1, borderLeftColor: colors.line },
  statValue: { fontSize: 22, lineHeight: 28, fontWeight: "700", letterSpacing: -0.44 },
  statLabel: { fontSize: 14, lineHeight: 19, letterSpacing: 0 },
  items: { marginTop: 8, minHeight: 180 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12, paddingHorizontal: 2 },
  rule: { position: "absolute", top: 0, left: 92, right: 0, height: 1, backgroundColor: colors.line },
  thumb: { width: 76, height: 76, borderRadius: radius.thumb, boxShadow: shadows.card },
  thumbFill: { borderRadius: radius.thumb },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 16, lineHeight: 21, fontWeight: "600", letterSpacing: -0.16 },
  rowMeta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  meta: { fontSize: 14, lineHeight: 19, letterSpacing: 0 },
  bookmark: { alignSelf: "flex-start", marginTop: 4 },
  empty: { paddingVertical: 26, paddingHorizontal: 16 },
  emptyText: { textAlign: "center", marginBottom: 14 },
  wall: { flexDirection: "row", flexWrap: "wrap", rowGap: 16, marginTop: 6 },
  tile: { width: "33.33%", alignItems: "center", paddingHorizontal: 3 },
  tileTitle: { fontSize: 13, lineHeight: 17, fontWeight: "600", letterSpacing: -0.13, textAlign: "center", marginTop: 4 },
  tileMeta: { fontSize: 11, lineHeight: 14, letterSpacing: 0, textAlign: "center", marginTop: 2 },
  next: {
    alignSelf: "stretch",
    minHeight: 128,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 10,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#CFD0D8",
    borderRadius: 22,
  },
  nextLabel: { fontSize: 12, lineHeight: 16, fontWeight: "600", letterSpacing: 0, textAlign: "center" },
  pressed: { opacity: 0.6 },
});
