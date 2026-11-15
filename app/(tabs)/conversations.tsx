import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { Breathing } from "@/components/Breathing";
import { Card } from "@/components/Card";
import { Countdown } from "@/components/Countdown";
import { EmptyState } from "@/components/EmptyState";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { StickerArt } from "@/components/Sticker";
import { Text } from "@/components/Text";
import { api } from "@/convex/_generated/api";
import { hasWitnessedReveal } from "@/lib/reveals";
import { space } from "@/theme";

type Match = (typeof api.matches.list)["_returnType"][number];

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
        <Text variant="label" soft>
          Conversations
        </Text>
      </Rise>
      {matches?.length === 0 ? (
        <EmptyState
          testID="conversations-empty"
          title="Nothing has surfaced yet."
          body="When your words and someone else's find each other, you'll both be asked before anything is revealed."
        />
      ) : null}
      {matches?.length ? (
        <Rise order={1} style={styles.scroll}>
          <ScrollView contentContainerStyle={styles.sections} showsVerticalScrollIndicator={false}>
            {invited.length > 0 ? (
              <Section title="Invitations" hint="waiting for you">
                {invited.map((match) => (
                  <Breathing key={match.id} scale={0.012} dim={0.12}>
                    <Card testID="conversation-invited" onPress={() => enter(match)}>
                      <Text variant="quote">
                        {match.type === "social" ? "Someone's answer resonated" : "Someone feels the same way"}
                      </Text>
                      <Text variant="caption" soft>
                        {match.question ?? "Two sealed messages seem to reach for each other. One of them is yours."}
                      </Text>
                      <Text variant="caption">Decide</Text>
                    </Card>
                  </Breathing>
                ))}
              </Section>
            ) : null}
            {waiting.length > 0 ? (
              <Section title="Waiting" hint="you said yes">
                {waiting.map((match) => (
                  <Breathing key={match.id} scale={0.012} dim={0.3}>
                    <Card testID="conversation-waiting" onPress={() => enter(match)}>
                      <Text variant="quote">Waiting for them</Text>
                      <Text variant="caption" soft>
                        Nothing is shown unless they say yes too.
                      </Text>
                    </Card>
                  </Breathing>
                ))}
              </Section>
            ) : null}
            {open.length > 0 ? (
              <Section title="Open" hint="24 hours to talk">
                {open.map((match) => (
                  <Card key={match.id} testID="conversation-open" onPress={() => enter(match)} horizontal>
                    <Avatar uri={match.other?.avatarUrl ?? null} name={match.other?.name ?? null} size={48} />
                    {match.conversation ? (
                      <View style={styles.person}>
                        <Text variant="quote">{match.other?.name}</Text>
                        {match.lastMessage ? (
                          <Text variant="caption" soft numberOfLines={1} testID="conversation-last-message">
                            {match.lastMessage}
                          </Text>
                        ) : null}
                        <Countdown
                          expiresAt={match.conversation.expiresAt}
                          suffix=" left to talk"
                          closedLabel="Closed. The words stay."
                        />
                      </View>
                    ) : (
                      <View style={styles.person} testID="conversation-new">
                        <Text variant="quote">{match.other?.name?.split(" ")[0]} agreed too</Text>
                        <Text variant="caption" soft>
                          See who it is · collect your sticker
                        </Text>
                        <Text variant="caption">New</Text>
                      </View>
                    )}
                    {match.sticker ? <StickerArt sticker={match.sticker} size={44} /> : null}
                  </Card>
                ))}
              </Section>
            ) : null}
            {closed.length > 0 ? (
              <Section title="Closed" hint="read only">
                {closed.map((match) => (
                  <Card key={match.id} testID="conversation-closed" onPress={() => enter(match)} horizontal>
                    <Avatar uri={match.other?.avatarUrl ?? null} name={match.other?.name ?? null} size={48} />
                    <View style={styles.person}>
                      <Text variant="quote">{match.other?.name}</Text>
                      <Text variant="caption" soft numberOfLines={1}>
                        {(match.sticker?.title ? match.sticker.title + " · " : "") + "ended, read only"}
                      </Text>
                    </View>
                    {match.sticker ? <StickerArt sticker={match.sticker} size={44} /> : null}
                  </Card>
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
    <View style={styles.section}>
      <Text variant="caption" soft>
        {title} · {hint}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, marginTop: space.lg },
  sections: { gap: space.xl, paddingBottom: space.xl },
  section: { gap: space.md },
  person: { flex: 1, gap: space.xs },
});
