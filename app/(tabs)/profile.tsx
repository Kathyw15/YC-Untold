import { useAuth, useUser } from "@clerk/expo";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { Card } from "@/components/Card";
import { QuietLink } from "@/components/QuietLink";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { Segments } from "@/components/Segments";
import { StickerGrid } from "@/components/Sticker";
import { Text } from "@/components/Text";
import { api } from "@/convex/_generated/api";
import { shortDate } from "@/lib/dates";
import { formatE164 } from "@/lib/phone";
import { useProfile } from "@/lib/session";
import { space } from "@/theme";

const TABS = [
  { value: "questions", label: "My questions" },
  { value: "sealed", label: "Sealed by me" },
  { value: "badges", label: "Badges" },
] as const;

export default function ProfileScreen() {
  const me = useProfile();
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const stickers = useQuery(api.stickers.mine);
  const questions = useQuery(api.questions.mine);
  const answers = useQuery(api.questions.myAnswers);
  const messages = useQuery(api.direct.listSent);
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("questions");
  const [leaving, setLeaving] = useState(false);
  const phone = user?.primaryPhoneNumber?.phoneNumber;

  const sealed =
    answers && messages
      ? [
          ...answers.map((entry) => ({ ...entry, about: entry.question.text, questionId: entry.question.id })),
          ...messages.map((entry) => ({ ...entry, about: "A message to someone you know", questionId: null })),
        ].sort((a, b) => b.createdAt - a.createdAt)
      : undefined;

  return (
    <Screen scene="base" aboveTabBar testID="profile-screen">
      <Rise>
        <Text variant="label" soft>
          Profile
        </Text>
      </Rise>
      <View style={styles.identity}>
        <Rise order={1}>
          <Avatar uri={me.avatarUrl} name={me.name} />
        </Rise>
        <Rise order={2}>
          <Text variant="display" style={styles.centered} testID="profile-name">
            {me.name}
          </Text>
        </Rise>
        <Rise order={3}>
          <Text variant="caption" soft style={styles.centered} testID="profile-badge-count">
            {phone ? formatE164(phone) + " · only you can see this\n" : ""}
            {stickers ? stickers.length + (stickers.length === 1 ? " badge" : " badges") : ""}
          </Text>
        </Rise>
        <Rise order={4} style={styles.stretch}>
          <Segments testID="profile-tab" options={TABS} value={tab} onChange={setTab} />
        </Rise>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === "questions" ? (
          questions?.length ? (
            questions.map((question) => (
              <Card
                key={question.id}
                testID="profile-question"
                onPress={() => router.push({ pathname: "/question/[id]", params: { id: question.id } })}>
                <Text variant="quote">{question.text}</Text>
                <Text variant="caption" soft>
                  {shortDate(question.createdAt)} ·{" "}
                  {question.responseCount === 1 ? "1 sealed answer" : question.responseCount + " sealed answers"}
                </Text>
              </Card>
            ))
          ) : questions ? (
            <Text soft style={styles.centered} testID="profile-questions-empty">
              You haven't asked anything yet. Tap + to ask a question.
            </Text>
          ) : null
        ) : null}
        {tab === "sealed" ? (
          sealed?.length ? (
            sealed.map((entry) => (
              <Card
                key={entry.id}
                testID="profile-sealed"
                onPress={
                  entry.questionId
                    ? () => router.push({ pathname: "/question/[id]", params: { id: entry.questionId } })
                    : undefined
                }>
                <Text variant="caption" soft numberOfLines={2}>
                  {entry.about}
                </Text>
                <Text numberOfLines={4}>{entry.body}</Text>
                <Text variant="caption" soft>
                  {shortDate(entry.createdAt)} · sealed
                </Text>
              </Card>
            ))
          ) : sealed ? (
            <Text soft style={styles.centered} testID="profile-sealed-empty">
              Nothing sealed yet. What you write stays here, where only you can read it.
            </Text>
          ) : null
        ) : null}
        {tab === "badges" ? (
          stickers?.length ? (
            <StickerGrid stickers={stickers} onOpen={(id) => router.push(`/sticker/${id}`)} />
          ) : stickers ? (
            <View style={styles.empty} testID="badges-empty">
              <Text variant="quote" style={styles.centered}>
                Nothing kept yet.
              </Text>
              <Text soft style={[styles.centered, styles.body]}>
                Every conversation that opens leaves a sticker behind. The ones you collect will rest here.
              </Text>
            </View>
          ) : null
        ) : null}
      </ScrollView>
      <QuietLink
        testID="sign-out"
        label={leaving ? "Signing out" : "Sign out"}
        disabled={leaving}
        onPress={() => {
          setLeaving(true);
          signOut().catch(() => setLeaving(false));
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: { alignItems: "center", gap: space.md, marginTop: space.lg },
  scroll: { flex: 1, marginTop: space.lg },
  content: { gap: space.md, paddingBottom: space.lg },
  empty: { alignItems: "center", gap: space.sm, paddingTop: space.xl },
  centered: { textAlign: "center" },
  stretch: { alignSelf: "stretch" },
  body: { maxWidth: 280 },
});
