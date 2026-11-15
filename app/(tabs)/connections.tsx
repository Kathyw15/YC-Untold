import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { useTone } from "@/components/Atmosphere";
import { Avatar } from "@/components/Avatar";
import { Breathing } from "@/components/Breathing";
import { Countdown } from "@/components/Countdown";
import { EmptyState } from "@/components/EmptyState";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { api } from "@/convex/_generated/api";
import { hasWitnessedReveal } from "@/lib/reveals";
import { radius, space, tones } from "@/theme";

type Match = (typeof api.matches.list)["_returnType"][number];

export default function ConnectionsScreen() {
  const matches = useQuery(api.matches.list);
  const router = useRouter();

  const invited = matches?.filter((match) => match.state === "invited") ?? [];
  const waiting = matches?.filter((match) => match.state === "waiting") ?? [];
  const revealed = matches?.filter((match) => match.state === "revealed") ?? [];

  function open(match: Match) {
    if (match.conversation && hasWitnessedReveal(match.id)) router.push(`/chat/${match.conversation.id}`);
    else router.push(`/match/${match.id}`);
  }

  return (
    <Screen scene="mist" aboveTabBar testID="connections-screen">
      <Rise>
        <Text variant="label" soft>
          Connections
        </Text>
      </Rise>
      {matches?.length === 0 ? (
        <EmptyState
          testID="connections-empty"
          title="Nothing has surfaced yet."
          body="When your words and someone else's find each other, you'll both be asked before anything is revealed."
        />
      ) : null}
      {matches?.length ? (
        <Rise order={1} style={styles.scroll}>
          <ScrollView contentContainerStyle={styles.sections} showsVerticalScrollIndicator={false}>
            {invited.length > 0 ? (
              <Section title="Possible connections">
                {invited.map((match) => (
                  <Breathing key={match.id} scale={0.012} dim={0.12}>
                    <Row testID="connection-invited" onPress={() => open(match)}>
                      <Text variant="quote">
                        {match.question ?? "Two sealed messages seem to reach for each other."}
                      </Text>
                      <Text variant="caption" soft>
                        {match.type === "social"
                          ? "Your answer and someone else's seem to resonate. Open the invitation."
                          : "One of them is yours. Open the invitation."}
                      </Text>
                    </Row>
                  </Breathing>
                ))}
              </Section>
            ) : null}
            {waiting.length > 0 ? (
              <Section title="Waiting">
                {waiting.map((match) => (
                  <Breathing key={match.id} scale={0.012} dim={0.3}>
                    <Row testID="connection-waiting" onPress={() => open(match)}>
                      <Text variant="quote">You said yes.</Text>
                      <Text variant="caption" soft>
                        Nothing is shown unless they say yes too.
                      </Text>
                    </Row>
                  </Breathing>
                ))}
              </Section>
            ) : null}
            {revealed.length > 0 ? (
              <Section title="Conversations">
                {revealed.map((match) => (
                  <Row key={match.id} testID="connection-revealed" onPress={() => open(match)} horizontal>
                    <Avatar uri={match.other?.avatarUrl ?? null} name={match.other?.name ?? null} size={48} />
                    <View style={styles.person}>
                      <Text variant="quote">{match.other?.name}</Text>
                      {match.conversation ? (
                        <Countdown
                          expiresAt={match.conversation.expiresAt}
                          suffix=" left to talk"
                          closedLabel="Closed. The words stay."
                        />
                      ) : null}
                    </View>
                  </Row>
                ))}
              </Section>
            ) : null}
          </ScrollView>
        </Rise>
      ) : null}
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="caption" soft>
        {title}
      </Text>
      {children}
    </View>
  );
}

type RowProps = {
  children: ReactNode;
  onPress: () => void;
  horizontal?: boolean;
  testID?: string;
};

function Row({ children, onPress, horizontal = false, testID }: RowProps) {
  const tone = tones[useTone()];
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        horizontal && styles.horizontal,
        { borderColor: tone.hairline, backgroundColor: tone.surface },
        pressed && styles.pressed,
      ]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, marginTop: space.lg },
  sections: { gap: space.xl, paddingBottom: space.xl },
  section: { gap: space.md },
  row: {
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth * 2,
    padding: space.lg,
    gap: space.sm,
  },
  horizontal: { flexDirection: "row", alignItems: "center", gap: space.md },
  person: { flex: 1, gap: space.xs },
  pressed: { opacity: 0.6 },
});
