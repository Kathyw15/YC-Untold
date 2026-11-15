import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "convex/react";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text as PlainText, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BreathingButton } from "@/components/BreathingButton";
import { initialsOf } from "@/components/ContactAvatar";
import { useRemaining } from "@/components/Countdown";
import { IconButton } from "@/components/IconButton";
import { Rise } from "@/components/Rise";
import { Segments } from "@/components/Segments";
import { StickerArt } from "@/components/Sticker";
import { Text } from "@/components/Text";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { shortDate } from "@/lib/dates";
import { hasWitnessedReveal } from "@/lib/reveals";
import { useSession } from "@/lib/session";
import { colors, questionGradients, radius, shadows } from "@/theme";

const TABS = [
  { value: "seals", label: "Seals" },
  { value: "conversations", label: "Conversations" },
  { value: "badges", label: "Badges" },
] as const;

const HERO_HEIGHT = 500;
const TILTS = [-6, 5, -3, 7, -5, 4, -7];

function dayLabel(time: number) {
  return new Date(time).toDateString() === new Date().toDateString() ? "Today" : shortDate(time);
}

function TimeLeft({ expiresAt }: { expiresAt: number }) {
  const remaining = useRemaining(expiresAt) ?? 0;
  if (remaining === 0) {
    return (
      <View style={styles.tag}>
        <Text style={styles.tagText}>Ended</Text>
      </View>
    );
  }
  const minutes = Math.ceil(remaining / 60000);
  return (
    <View style={[styles.tag, styles.tagInk]}>
      <Text style={[styles.tagText, styles.tagInkText]}>
        {Math.floor(minutes / 60)}h {minutes % 60}m left
      </Text>
    </View>
  );
}

export default function PersonScreen() {
  const { status } = useSession();
  if (status === "loading") return null;
  if (status !== "ready") return <Redirect href="/" />;
  return <Person />;
}

function Person() {
  const { id, name, phone } = useLocalSearchParams<{ id: Id<"users">; name: string; phone: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("seals");
  const person = useQuery(api.contacts.listMatched)?.find((match) => match.userId === id);
  const sent = useQuery(api.direct.listSent);
  const matches = useQuery(api.matches.list);
  const stickers = useQuery(api.stickers.withPerson, { userId: id });
  const firstName = name.split(" ")[0];

  const seals = person && sent ? sent.filter((entry) => entry.contactId === person.contactId) : undefined;
  const conversations = matches?.filter((match) => match.state === "revealed" && match.other?.id === id);
  const stats = [
    [seals?.length ?? 0, "Your Seals"],
    [conversations?.length ?? 0, "Conversations"],
    [stickers?.length ?? 0, "Badges"],
  ] as const;

  return (
    <View style={styles.root} testID="person-screen">
      <View style={styles.hero}>
        {person?.avatarUrl ? (
          <Image
            source={{ uri: person.avatarUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            contentPosition={{ left: "50%", top: "30%" }}
            transition={300}
            accessibilityLabel={name}
          />
        ) : (
          <LinearGradient
            colors={questionGradients[1]}
            start={{ x: 0.3, y: 0 }}
            end={{ x: 0.7, y: 1 }}
            style={[StyleSheet.absoluteFill, styles.heroPlain]}>
            <View style={styles.heroMonogram}>
              {person?.avatarEmoji ? (
                <PlainText style={styles.heroEmoji}>{person.avatarEmoji}</PlainText>
              ) : (
                <Text style={styles.heroInitials}>{initialsOf(name)}</Text>
              )}
            </View>
          </LinearGradient>
        )}
        <LinearGradient
          colors={["rgba(255, 255, 255, 0.35)", "rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.85)", "#FFFFFF"]}
          locations={[0, 0.18, 0.66, 0.92, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      </View>
      <ScrollView
        style={styles.fill}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 130 }]}
        showsVerticalScrollIndicator={false}>
        <View style={{ height: Math.max(insets.top, 47) + 300 }} />
        <Rise>
          <View style={styles.panel}>
            <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.5)", "rgba(255, 255, 255, 0.84)", "#FFFFFF", "#FFFFFF"]}
              locations={[0, 0.3, 0.52, 1]}
              style={styles.panelFill}
              pointerEvents="none"
            />
            <Text variant="display" testID="person-name">
              {name}
            </Text>
            <Text soft style={styles.handle}>
              {person === undefined ? " " : "On Seal · in your contacts"}
            </Text>
            <View style={styles.stats}>
              {stats.map(([count, label], index) => (
                <View key={label} style={[styles.stat, index > 0 && styles.statDivider]}>
                  <Text style={styles.statCount}>{count}</Text>
                  <Text soft style={styles.statLabel}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>
            <Segments testID="person-tab" options={TABS} value={tab} onChange={setTab} />
            {tab === "seals" ? (
              <View testID="person-seals">
                {seals?.length ? (
                  <View style={styles.list}>
                    {seals.map((entry, index) => (
                      <View key={entry.id} style={styles.row} testID="person-seal">
                        {index > 0 ? <View style={styles.rowLine} /> : null}
                        <View style={styles.lock}>
                          <Ionicons name="lock-closed" size={16} color={colors.white} />
                        </View>
                        <View style={styles.fill}>
                          <Text numberOfLines={4} style={styles.sealText}>
                            “{entry.body}”
                          </Text>
                          <Text soft style={styles.rowSub}>
                            {dayLabel(entry.createdAt)} · sealed
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : null}
                {seals?.length === 0 ? (
                  <Text soft style={styles.empty} testID="person-seals-empty">
                    You haven’t left {firstName} a Seal yet.
                  </Text>
                ) : null}
                {seals?.length ? (
                  <Text variant="caption" soft style={styles.footnote}>
                    Only you can see these. {firstName} only knows someone left them a Seal.
                  </Text>
                ) : null}
              </View>
            ) : null}
            {tab === "conversations" ? (
              <View testID="person-conversations">
                {conversations?.length ? (
                  <View style={styles.list}>
                    {conversations.map((match, index) => (
                      <Pressable
                        key={match.id}
                        testID="person-conversation"
                        accessibilityRole="button"
                        onPress={() =>
                          router.push(
                            match.conversation && hasWitnessedReveal(match.id)
                              ? `/chat/${match.conversation.id}`
                              : `/match/${match.id}`,
                          )
                        }
                        style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                        {index > 0 ? <View style={styles.rowLine} /> : null}
                        {match.sticker ? <StickerArt sticker={match.sticker} size={50} /> : null}
                        <View style={styles.fill}>
                          <Text variant="row" numberOfLines={2}>
                            {match.sticker?.title ?? "A conversation"}
                          </Text>
                          <Text soft numberOfLines={1} style={styles.rowSub}>
                            Started {dayLabel(match.createdAt) === "Today" ? "today" : dayLabel(match.createdAt)}
                          </Text>
                        </View>
                        {match.closed ? (
                          <View style={styles.tag}>
                            <Text style={styles.tagText}>Ended</Text>
                          </View>
                        ) : match.conversation ? (
                          <TimeLeft expiresAt={match.conversation.expiresAt} />
                        ) : (
                          <View style={[styles.tag, styles.tagLime]}>
                            <Text style={[styles.tagText, styles.tagLimeText]}>New</Text>
                          </View>
                        )}
                      </Pressable>
                    ))}
                  </View>
                ) : null}
                {conversations?.length === 0 ? (
                  <Text soft style={styles.empty} testID="person-conversations-empty">
                    When your words meet {firstName}’s, your conversations live here.
                  </Text>
                ) : null}
              </View>
            ) : null}
            {tab === "badges" ? (
              <View testID="person-badges">
                {stickers?.length ? (
                  <View style={styles.wall} testID="sticker-grid">
                    {stickers.map((sticker, index) => (
                      <Pressable
                        key={sticker.id}
                        testID="sticker-tile"
                        accessibilityRole="button"
                        accessibilityLabel={sticker.title ?? "Sticker"}
                        onPress={() => router.push(`/sticker/${sticker.id}`)}
                        style={({ pressed }) => [styles.wallTile, pressed && styles.pressed]}>
                        <View style={{ transform: [{ rotate: TILTS[index % TILTS.length] + "deg" }] }}>
                          <StickerArt sticker={sticker} size={88} />
                        </View>
                        <Text numberOfLines={2} style={styles.wallName}>
                          {sticker.title}
                        </Text>
                        <Text soft style={styles.wallDate}>
                          {dayLabel(sticker.createdAt)}
                        </Text>
                      </Pressable>
                    ))}
                    <View style={styles.wallTile}>
                      <View style={[styles.next, styles.nextInWall]}>
                        <Ionicons name="add" size={18} color={colors.ink2} />
                        <Text style={styles.nextText}>Your next one with {firstName}</Text>
                      </View>
                    </View>
                  </View>
                ) : stickers ? (
                  <View style={styles.badgesEmpty} testID="person-badges-empty">
                    <View style={[styles.next, styles.nextAlone]}>
                      <Ionicons name="add" size={18} color={colors.ink2} />
                      <Text style={styles.nextText}>First sticker</Text>
                    </View>
                    <Text soft style={styles.centered}>
                      Your first sticker with {firstName} shows up here when a conversation opens up.
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        </Rise>
      </ScrollView>
      <View style={[styles.topBar, { top: insets.top + 11 }]} pointerEvents="box-none">
        <IconButton icon="chevron-back" label="Back" onPress={() => router.back()} testID="person-back" />
        <IconButton icon="ellipsis-horizontal" label="More" onPress={() => {}} />
      </View>
      <LinearGradient
        colors={["rgba(255, 255, 255, 0)", "#FFFFFF"]}
        locations={[0, 0.4]}
        style={[styles.foot, { paddingBottom: Math.max(insets.bottom, 16) + 24 }]}
        pointerEvents="box-none">
        <BreathingButton
          testID="person-write"
          icon="add"
          label="Leave a new Seal"
          onPress={() => router.push({ pathname: "/compose/direct", params: { phone, name, here: "1", userId: id } })}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  fill: { flex: 1 },
  pressed: { opacity: 0.6 },
  centered: { textAlign: "center" },
  hero: { position: "absolute", left: 0, right: 0, top: 0, height: HERO_HEIGHT, overflow: "hidden" },
  heroPlain: { alignItems: "center", paddingTop: 120 },
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
  heroEmoji: { fontSize: 62, lineHeight: 78 },
  heroInitials: { fontSize: 48, lineHeight: 58, fontWeight: "800", letterSpacing: -1.5, color: colors.ink },
  topBar: {
    position: "absolute",
    left: 18,
    right: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  content: { paddingHorizontal: 12 },
  panel: {
    borderRadius: 34,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
    paddingTop: 22,
    paddingHorizontal: 18,
    paddingBottom: 10,
    overflow: "hidden",
    minHeight: 420,
    boxShadow: "0 -6px 30px rgba(0, 0, 0, 0.06)",
  },
  panelFill: { position: "absolute", left: 0, right: 0, top: 0, height: 500 },
  handle: { fontSize: 15, lineHeight: 20, marginTop: 6 },
  stats: { flexDirection: "row", marginTop: 20, marginBottom: 18 },
  stat: { flex: 1, alignItems: "center" },
  statDivider: { borderLeftWidth: 1, borderLeftColor: colors.line },
  statCount: { fontSize: 22, lineHeight: 27, fontWeight: "700", letterSpacing: -0.44 },
  statLabel: { fontSize: 14, lineHeight: 19 },
  list: { marginTop: 20, borderRadius: radius.list, backgroundColor: colors.white, boxShadow: shadows.card },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 16 },
  rowLine: { position: "absolute", left: 76, right: 0, top: 0, height: StyleSheet.hairlineWidth, backgroundColor: colors.line },
  rowSub: { fontSize: 14, lineHeight: 19, marginTop: 2 },
  lock: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ink,
  },
  sealText: { fontSize: 16, lineHeight: 21, fontWeight: "500", letterSpacing: -0.24 },
  footnote: { textAlign: "center", marginTop: 12, paddingHorizontal: 8 },
  empty: { textAlign: "center", paddingVertical: 40, paddingHorizontal: 16 },
  tag: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.fill,
  },
  tagText: { fontSize: 12, lineHeight: 16, fontWeight: "600", color: colors.ink2, fontVariant: ["tabular-nums"] },
  tagInk: { backgroundColor: colors.ink },
  tagInkText: { color: colors.white },
  tagLime: { backgroundColor: colors.lime },
  tagLimeText: { color: colors.limeInk },
  wall: { flexDirection: "row", flexWrap: "wrap", rowGap: 16, marginTop: 22 },
  wallTile: { width: "33.33%", alignItems: "center", paddingHorizontal: 3 },
  wallName: { fontSize: 13, lineHeight: 17, fontWeight: "600", letterSpacing: -0.13, textAlign: "center", marginTop: 4 },
  wallDate: { fontSize: 11, lineHeight: 15, marginTop: 2 },
  next: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 10,
    borderRadius: 22,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#CFD0D8",
  },
  nextInWall: { alignSelf: "stretch", height: 124 },
  nextAlone: { width: 120, height: 110, marginTop: 6, marginBottom: 14 },
  nextText: { fontSize: 12, lineHeight: 16, fontWeight: "600", color: colors.ink2, textAlign: "center" },
  badgesEmpty: { alignItems: "center", paddingVertical: 26, paddingHorizontal: 16 },
  foot: { position: "absolute", left: 0, right: 0, bottom: 0, paddingTop: 30, paddingHorizontal: 20 },
});
