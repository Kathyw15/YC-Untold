import { usePaginatedQuery, useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Breathing } from "@/components/Breathing";
import { EmptyState } from "@/components/EmptyState";
import { QuestionCard } from "@/components/QuestionCard";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { api } from "@/convex/_generated/api";
import { useProfile } from "@/lib/session";
import { layout, space } from "@/theme";

const PAGE_SIZE = 12;
const FLOOR = ["rgba(243, 239, 230, 0)", "rgba(243, 239, 230, 0.9)", "rgba(243, 239, 230, 0.9)"] as const;

function greeting(hour: number) {
  if (hour < 5) return "Still awake";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const me = useProfile();
  const router = useRouter();
  const tabBar = useSafeAreaInsets().bottom + layout.tabBarHeight;
  const today = useQuery(api.questions.today);
  const feed = usePaginatedQuery(api.questions.feed, {}, { initialNumItems: PAGE_SIZE });
  const now = new Date();
  const firstName = me.name?.split(" ")[0];

  function open(id: string) {
    router.push({ pathname: "/question/[id]", params: { id } });
  }

  return (
    <Screen scene="dawn" testID="home-screen" contentStyle={styles.screen}>
      <View style={[styles.feed, { marginBottom: tabBar }]}>
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
              {feed.results.length > 0 ? (
                <Rise order={2}>
                  <Text variant="label" soft style={styles.section}>
                    From friends & everyone
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
            <Rise order={Math.min(index, 5) + 3}>
              <QuestionCard testID={"question-" + index} question={item} onPress={() => open(item.id)} />
            </Rise>
          )}
        />
        <LinearGradient
          colors={FLOOR}
          locations={[0, space.xl / (space.xl + tabBar), 1]}
          style={[styles.floor, { bottom: -tabBar, height: space.xl + tabBar }]}
          pointerEvents="none"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0, paddingBottom: 0 },
  feed: { flex: 1 },
  floor: { position: "absolute", left: 0, right: 0 },
  list: { paddingHorizontal: layout.screenPadding, paddingBottom: space.xxl, gap: space.md },
  header: { gap: space.lg, marginBottom: space.sm },
  greeting: { gap: space.sm, marginBottom: space.sm },
  section: { marginTop: space.md },
  empty: { paddingVertical: space.xxl },
});
