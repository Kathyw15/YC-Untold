import { usePaginatedQuery, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { FlatList, StyleSheet, View } from "react-native";

import { Breathing } from "@/components/Breathing";
import { BreathingButton } from "@/components/BreathingButton";
import { EmptyState } from "@/components/EmptyState";
import { QuestionCard } from "@/components/QuestionCard";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { api } from "@/convex/_generated/api";
import { useProfile } from "@/lib/session";
import { layout, space } from "@/theme";

const PAGE_SIZE = 12;

function greeting(hour: number) {
  if (hour < 5) return "Still awake";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const me = useProfile();
  const router = useRouter();
  const today = useQuery(api.questions.today);
  const feed = usePaginatedQuery(api.questions.feed, {}, { initialNumItems: PAGE_SIZE });
  const now = new Date();
  const firstName = me.name?.split(" ")[0];

  function open(id: string) {
    router.push({ pathname: "/question/[id]", params: { id } });
  }

  return (
    <Screen scene="dawn" aboveTabBar testID="home-screen" contentStyle={styles.screen}>
      <FlatList
        testID="home-feed"
        data={feed.results}
        keyExtractor={(question) => question.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        onEndReachedThreshold={0.6}
        onEndReached={() => {
          if (feed.status === "CanLoadMore") feed.loadMore(PAGE_SIZE);
        }}
        ListHeaderComponent={
          <View style={styles.header}>
            <Rise>
              <View style={styles.greeting}>
                <Text variant="label" soft>
                  {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </Text>
                <Text variant="display" testID="home-greeting">
                  {greeting(now.getHours())},{"\n"}
                  {firstName}.
                </Text>
              </View>
            </Rise>
            {today ? (
              <Rise order={1}>
                <Breathing scale={0.012} dim={0.1} active={!today.hasAnswered}>
                  <QuestionCard testID="daily-question" question={today} onPress={() => open(today.id)} />
                </Breathing>
              </Rise>
            ) : null}
            <Rise order={2}>
              <BreathingButton
                testID="ask-question"
                label="Ask a question"
                onPress={() => router.push("/compose/question")}
              />
            </Rise>
            {feed.results.length > 0 ? (
              <Rise order={3}>
                <Text variant="label" soft style={styles.section}>
                  Others are wondering
                </Text>
              </Rise>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          feed.status === "LoadingFirstPage" ? undefined : (
            <View style={styles.empty}>
              <EmptyState
                testID="home-empty"
                title="It's quiet here."
                body="Questions from the people you know will gather here, and wait until you're ready."
              />
            </View>
          )
        }
        renderItem={({ item, index }) => (
          <Rise order={Math.min(index, 5) + 4}>
            <QuestionCard testID={"question-" + index} question={item} onPress={() => open(item.id)} />
          </Rise>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  list: { paddingHorizontal: layout.screenPadding, paddingBottom: space.xl, gap: space.md },
  header: { gap: space.lg, marginBottom: space.sm },
  greeting: { gap: space.sm, marginBottom: space.sm },
  section: { marginTop: space.md },
  empty: { paddingVertical: space.xxl },
});
