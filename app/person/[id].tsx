import { useQuery } from "convex/react";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { BreathingButton } from "@/components/BreathingButton";
import { Card } from "@/components/Card";
import { Countdown } from "@/components/Countdown";
import { QuietLink } from "@/components/QuietLink";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { Segments } from "@/components/Segments";
import { StickerArt, StickerGrid } from "@/components/Sticker";
import { Text } from "@/components/Text";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { shortDate } from "@/lib/dates";
import { hasWitnessedReveal } from "@/lib/reveals";
import { useProfile, useSession } from "@/lib/session";
import { space } from "@/theme";

const TABS = [
  { value: "seals", label: "Seals" },
  { value: "conversations", label: "Conversations" },
  { value: "badges", label: "Badges" },
] as const;

export default function PersonScreen() {
  const { status } = useSession();
  if (status === "loading") return null;
  if (status !== "ready") return <Redirect href="/" />;
  return <Person />;
}

function Person() {
  const { id, name, phone } = useLocalSearchParams<{ id: Id<"users">; name: string; phone: string }>();
  const router = useRouter();
  const me = useProfile();
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("seals");
  const person = useQuery(api.contacts.listMatched)?.find((match) => match.userId === id);
  const sent = useQuery(api.direct.listSent);
  const matches = useQuery(api.matches.list);
  const stickers = useQuery(api.stickers.withPerson, { userId: id });
  const firstName = name.split(" ")[0];

  const seals = person && sent ? sent.filter((entry) => entry.contactId === person.contactId) : undefined;
  const conversations = matches?.filter((match) => match.state === "revealed" && match.other?.id === id);

  return (
    <Screen scene="mist" testID="person-screen">
      <View style={styles.back}>
        <QuietLink label="Back" onPress={() => router.back()} testID="person-back" />
      </View>
      <Rise style={styles.identity}>
        <Avatar uri={person?.avatarUrl ?? null} emoji={person?.avatarEmoji} name={name} />
        <Text variant="display" style={styles.centered} testID="person-name">
          {name}
        </Text>
        <Segments testID="person-tab" options={TABS} value={tab} onChange={setTab} />
      </Rise>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === "seals" ? (
          <View style={styles.section} testID="person-seals">
            <Text variant="label" soft>
              Your Seals to {firstName}
            </Text>
            {seals?.map((entry) => (
              <Card key={entry.id} testID="person-seal">
                <Text numberOfLines={4}>{entry.body}</Text>
                <Text variant="caption" soft>
                  {shortDate(entry.createdAt)} · sealed
                </Text>
              </Card>
            ))}
            {seals?.length === 0 ? (
              <Text soft testID="person-seals-empty">
                Nothing sealed for {firstName} yet.
              </Text>
            ) : null}
            {seals ? (
              <Text variant="caption" soft>
                Only you can see these. {firstName} only knows someone left them a Seal.
              </Text>
            ) : null}
          </View>
        ) : null}
        {tab === "conversations" ? (
          <View style={styles.section} testID="person-conversations">
            <Text variant="label" soft>
              Conversations with {firstName}
            </Text>
            {conversations?.map((match) => (
              <Card
                key={match.id}
                horizontal
                testID="person-conversation"
                onPress={() =>
                  router.push(
                    match.conversation && hasWitnessedReveal(match.id)
                      ? `/chat/${match.conversation.id}`
                      : `/match/${match.id}`,
                  )
                }>
                {match.sticker ? <StickerArt sticker={match.sticker} size={48} /> : null}
                <View style={styles.words}>
                  <Text numberOfLines={2}>{match.sticker?.title ?? "A conversation"}</Text>
                  <Text variant="caption" soft>
                    {shortDate(match.createdAt)}
                  </Text>
                </View>
                {match.closed ? (
                  <Text variant="caption" soft>
                    Ended
                  </Text>
                ) : match.conversation ? (
                  <Countdown expiresAt={match.conversation.expiresAt} suffix=" left" closedLabel="Ended" />
                ) : (
                  <Text variant="caption">New</Text>
                )}
              </Card>
            ))}
            {conversations?.length === 0 ? (
              <Text soft testID="person-conversations-empty">
                When your words meet {firstName}'s, your conversations live here.
              </Text>
            ) : null}
          </View>
        ) : null}
        {tab === "badges" ? (
          <View style={styles.section} testID="person-badges">
            <Text variant="label" soft>
              {me.name?.split(" ")[0]} & {firstName}
            </Text>
            {stickers?.length ? (
              <StickerGrid stickers={stickers} onOpen={(stickerId) => router.push(`/sticker/${stickerId}`)} />
            ) : stickers ? (
              <Text soft testID="person-badges-empty">
                No badges with {firstName} yet. When a conversation opens between you, its sticker can be kept here.
              </Text>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
      <BreathingButton
        testID="person-write"
        label="Leave a new Seal"
        onPress={() => router.push({ pathname: "/compose/direct", params: { phone, name, here: "1" } })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { alignItems: "flex-start" },
  identity: { alignItems: "center", gap: space.md, paddingTop: space.md },
  scroll: { flex: 1, marginTop: space.lg, marginBottom: space.md },
  content: { paddingBottom: space.lg },
  section: { gap: space.md },
  words: { flex: 1 },
  centered: { textAlign: "center" },
});
