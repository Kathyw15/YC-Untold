import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { useRemaining } from "@/components/Countdown";
import { MysteryAvatar, Tag, timeLeft } from "@/components/MatchParts";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { StickerArt } from "@/components/Sticker";
import { Text } from "@/components/Text";
import { api } from "@/convex/_generated/api";
import { hasWitnessedReveal } from "@/lib/reveals";
import { colors, layout, radius, shadows, space } from "@/theme";

type Match = (typeof api.matches.list)["_returnType"][number];

function ago(time: number) {
  const minutes = Math.floor((Date.now() - time) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return minutes + " min ago";
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + (hours === 1 ? " hour ago" : " hours ago");
  const days = Math.floor(hours / 24);
  return days + (days === 1 ? " day ago" : " days ago");
}

function firstName(match: Match) {
  return match.other?.name?.trim().split(" ")[0] || "They";
}

export default function ConversationsScreen() {
  const matches = useQuery(api.matches.list);
  const router = useRouter();

  const invited = matches?.filter((match) => match.state === "invited") ?? [];
  const waiting = matches?.filter((match) => match.state === "waiting") ?? [];
  const open = matches?.filter((match) => match.state === "revealed" && !match.closed) ?? [];
  const closed = matches?.filter((match) => match.state === "revealed" && match.closed) ?? [];

  function enter(match: Match) {
    if (match.conversation && hasWitnessedReveal(match.id)) router.push(`/chat/${match.conversation.id}`);
    else router.push(`/match/${match.id}`);
  }

  return (
    <Screen scene="base" aboveTabBar testID="conversations-screen">
      <Rise>
        <Text variant="hero" style={styles.title}>
          Conversations
        </Text>
      </Rise>
      {matches?.length === 0 ? (
        <Rise order={1}>
          <View style={styles.empty} testID="conversations-empty">
            <View style={styles.emptyIcon}>
              <Ionicons name="chatbox-ellipses-outline" size={40} color={colors.ink2} />
            </View>
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text soft style={styles.emptyBody}>
              When someone’s words meet yours, you’ll find them here. Every conversation earns a sticker.
            </Text>
          </View>
        </Rise>
      ) : null}
      {matches?.length ? (
        <Rise order={1} style={styles.scroll}>
          <ScrollView contentContainerStyle={styles.sections} showsVerticalScrollIndicator={false}>
            {invited.length > 0 ? (
              <Section title="Invitations" hint="waiting for you">
                {invited.map((match, index) => (
                  <Row
                    key={match.id}
                    testID="conversation-invited"
                    first={index === 0}
                    onPress={() => enter(match)}
                    left={<MysteryAvatar />}
                    title={match.type === "social" ? "Someone’s answer resonated" : "It’s a Match"}
                    subtitle={
                      match.type === "social" && match.question
                        ? "“" + match.question + "”"
                        : "Someone who knows you left you a Seal too"
                    }
                    right={<Tag tone="pink" label="Decide" />}
                  />
                ))}
              </Section>
            ) : null}
            {waiting.length > 0 ? (
              <Section title="Waiting" hint="you said yes">
                {waiting.map((match, index) => (
                  <Row
                    key={match.id}
                    testID="conversation-waiting"
                    first={index === 0}
                    onPress={() => enter(match)}
                    left={<MysteryAvatar />}
                    title="Waiting for them"
                    subtitle={"You said yes · " + ago(match.createdAt)}
                    right={<Ionicons name="chevron-forward" size={18} color={colors.ink3} />}
                  />
                ))}
              </Section>
            ) : null}
            {open.length > 0 ? (
              <Section title="Open" hint="24 hours to talk">
                {open.map((match, index) =>
                  match.conversation ? (
                    <Row
                      key={match.id}
                      testID="conversation-open"
                      first={index === 0}
                      onPress={() => enter(match)}
                      left={<Badged match={match} />}
                      title={match.sticker?.title ?? match.other?.name ?? ""}
                      subtitle={(match.lastMessageMine ? "You" : firstName(match)) + ": " + (match.lastMessage ?? "Conversation open")}
                      subtitleTestID={match.lastMessage ? "conversation-last-message" : undefined}
                      right={<TimeLeft expiresAt={match.conversation.expiresAt} />}
                    />
                  ) : (
                    <Row
                      key={match.id}
                      testID="conversation-open"
                      bodyTestID="conversation-new"
                      first={index === 0}
                      onPress={() => enter(match)}
                      left={
                        <Avatar
                          uri={match.other?.avatarUrl ?? null}
                          emoji={match.other?.avatarEmoji}
                          name={match.other?.name ?? null}
                          size={50}
                        />
                      }
                      title={firstName(match) + " said yes too"}
                      subtitle="See who it is · collect your sticker"
                      right={<Tag tone="lime" label="New" />}
                    />
                  ),
                )}
              </Section>
            ) : null}
            {closed.length > 0 ? (
              <Section title="Closed" hint="read only">
                {closed.map((match, index) => (
                  <Row
                    key={match.id}
                    testID="conversation-closed"
                    first={index === 0}
                    onPress={() => enter(match)}
                    left={<Badged match={match} />}
                    title={match.sticker?.title ?? match.other?.name ?? ""}
                    subtitle={firstName(match) + " · ended, read only"}
                    right={<Ionicons name="chevron-forward" size={18} color={colors.ink3} />}
                  />
                ))}
              </Section>
            ) : null}
          </ScrollView>
        </Rise>
      ) : null}
    </Screen>
  );
}

function Section({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <View>
      <View style={styles.sectionHead}>
        <Text variant="heading">{title}</Text>
        <Text variant="caption" soft>
          {hint}
        </Text>
      </View>
      <View style={styles.list}>{children}</View>
    </View>
  );
}

type RowProps = {
  testID: string;
  bodyTestID?: string;
  subtitleTestID?: string;
  first: boolean;
  onPress: () => void;
  left: ReactNode;
  title: string;
  subtitle: string;
  right: ReactNode;
};

function Row({ testID, bodyTestID, subtitleTestID, first, onPress, left, title, subtitle, right }: RowProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      {first ? null : <View style={styles.separator} />}
      {left}
      <View style={styles.grow} testID={bodyTestID}>
        <Text variant="row" numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.subtitle} soft numberOfLines={1} testID={subtitleTestID}>
          {subtitle}
        </Text>
      </View>
      {right}
    </Pressable>
  );
}

function Badged({ match }: { match: Match }) {
  return (
    <View>
      <Avatar uri={match.other?.avatarUrl ?? null} emoji={match.other?.avatarEmoji} name={match.other?.name ?? null} size={50} />
      {match.sticker ? (
        <View style={styles.badge}>
          <StickerArt sticker={match.sticker} size={28} />
        </View>
      ) : null}
    </View>
  );
}

function TimeLeft({ expiresAt }: { expiresAt: number }) {
  const remaining = useRemaining(expiresAt) ?? 0;
  if (remaining === 0) return <Tag label="Ended" />;
  return <Tag tone="ink" icon="time-outline" label={timeLeft(remaining)} />;
}

const styles = StyleSheet.create({
  title: { fontSize: 40, lineHeight: 44, fontWeight: "900", fontStyle: "italic", letterSpacing: -1.6, paddingRight: 4 },
  scroll: { flex: 1, marginHorizontal: -6, marginBottom: -(layout.tabBarHeight + space.lg) },
  sections: { paddingHorizontal: 6, paddingBottom: layout.tabBarHeight + space.xxl },
  sectionHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: 26,
    marginBottom: 12,
    marginHorizontal: 2,
  },
  list: { backgroundColor: colors.white, borderRadius: radius.list, boxShadow: shadows.card },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 16 },
  pressed: { opacity: 0.6 },
  separator: { position: "absolute", left: 76, right: 0, top: 0, height: 1, backgroundColor: colors.line },
  grow: { flex: 1, minWidth: 0 },
  subtitle: { fontSize: 14, lineHeight: 19, marginTop: 1 },
  badge: { position: "absolute", right: -10, bottom: -8 },
  empty: { alignItems: "center", paddingTop: 64, paddingHorizontal: 16 },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    backgroundColor: colors.white,
    boxShadow: shadows.card,
  },
  emptyTitle: { fontSize: 24, lineHeight: 28, fontWeight: "700", letterSpacing: -0.48, textAlign: "center", marginBottom: 8 },
  emptyBody: { textAlign: "center" },
});
