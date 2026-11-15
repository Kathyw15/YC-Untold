import Ionicons from "@expo/vector-icons/Ionicons";
import { usePaginatedQuery, useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/Avatar";
import { EmptyState } from "@/components/EmptyState";
import { QuestionBackground, questionPhoto } from "@/components/QuestionBackground";
import { QuestionCard } from "@/components/QuestionCard";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { api } from "@/convex/_generated/api";
import { useProfile } from "@/lib/session";
import { colors, layout, radius, shadows, space } from "@/theme";

const PAGE_SIZE = 12;
const FLOOR = ["rgba(247, 247, 250, 0)", "rgba(247, 247, 250, 0.9)", "rgba(247, 247, 250, 0.9)"] as const;
const FILTERS = ["For You", "Friends", "Following"] as const;
const PIN_AFTER = 96;

export default function HomeScreen() {
  const me = useProfile();
  const router = useRouter();
  const tabBar = useSafeAreaInsets().bottom + layout.tabBarHeight;
  const today = useQuery(api.questions.today);
  const feed = usePaginatedQuery(api.questions.feed, {}, { initialNumItems: PAGE_SIZE });
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("For You");
  const [pinned, setPinned] = useState(false);

  const daily = filter === "For You" ? today : null;
  const questions =
    filter === "For You"
      ? feed.results
      : filter === "Friends"
        ? feed.results.filter((question) => question.audience === "friends")
        : [];
  const pinnedOnPhoto = daily ? questionPhoto(daily) !== null : false;
  const pinnedInk = pinnedOnPhoto ? colors.white : colors.ink;

  function open(id: string) {
    router.push({ pathname: "/question/[id]", params: { id } });
  }

  return (
    <Screen scene="base" testID="home-screen" contentStyle={styles.screen}>
      <View style={styles.head}>
        <Text style={styles.title} testID="home-greeting">
          Seal
        </Text>
        <View style={styles.icons}>
          <View>
            <Ionicons name="notifications-outline" size={26} color={colors.ink} />
            <View style={styles.dot} />
          </View>
          <View style={styles.ring}>
            <Avatar uri={me.avatarUrl} name={me.name} size={40} />
          </View>
        </View>
      </View>
      <View style={[styles.feed, { marginBottom: tabBar }]}>
        <FlatList
          testID="home-feed"
          data={questions}
          keyExtractor={(question) => question.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          scrollEventThrottle={32}
          onScroll={(event) => setPinned(event.nativeEvent.contentOffset.y > PIN_AFTER)}
          onEndReachedThreshold={0.6}
          onEndReached={() => {
            if (feed.status === "CanLoadMore") feed.loadMore(PAGE_SIZE);
          }}
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.chips}>
                {FILTERS.map((option) => {
                  const selected = option === filter;
                  return (
                    <Pressable
                      key={option}
                      testID={"home-filter-" + option.toLowerCase().replace(" ", "-")}
                      accessibilityRole="button"
                      accessibilityLabel={option}
                      accessibilityState={{ selected }}
                      onPress={() => setFilter(option)}
                      style={[styles.chip, selected && styles.chipOn]}>
                      <Text style={[styles.chipText, selected && styles.chipOnText]}>{option}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {daily ? (
                <Rise>
                  <QuestionCard testID="daily-question" question={daily} onPress={() => open(daily.id)} />
                </Rise>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            feed.status === "LoadingFirstPage" ? undefined : (
              <View style={styles.empty}>
                <EmptyState
                  testID="home-empty"
                  title={filter === "Following" ? "No one yet." : "It's quiet here."}
                  body={
                    filter === "Following"
                      ? "Questions from people you follow will gather here."
                      : filter === "Friends"
                        ? "Questions your friends ask only their friends will gather here."
                        : "Questions from the people you know will gather here, and wait until you're ready."
                  }
                />
              </View>
            )
          }
          renderItem={({ item, index }) => (
            <Rise order={Math.min(index, 3) + 1}>
              <QuestionCard testID={"question-" + index} question={item} onPress={() => open(item.id)} />
            </Rise>
          )}
        />
        {daily && pinned ? (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.pinned}>
            <Pressable
              testID="daily-pinned"
              accessibilityRole="button"
              accessibilityLabel={"Today's question. " + daily.text}
              onPress={() => open(daily.id)}
              style={({ pressed }) => [styles.bar, pressed && styles.pressed]}>
              <QuestionBackground question={daily} style={styles.barFill} />
              <View style={styles.barText}>
                <View style={styles.barLabel}>
                  <Ionicons name="sparkles" size={12} color={pinnedInk} />
                  <Text style={[styles.barLabelText, { color: pinnedInk }]}>Today’s question</Text>
                </View>
                <Text numberOfLines={2} style={[styles.barQuestion, { color: pinnedInk }]}>
                  {daily.text}
                </Text>
              </View>
              <View style={[styles.barLock, pinnedOnPhoto ? styles.barLockOnPhoto : null]}>
                <Ionicons
                  name={daily.hasAnswered ? "lock-closed" : "chevron-forward"}
                  size={17}
                  color={pinnedOnPhoto ? colors.ink : colors.white}
                />
              </View>
            </Pressable>
          </Animated.View>
        ) : null}
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
  screen: { paddingHorizontal: 0, paddingBottom: 0, paddingTop: 0 },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: layout.screenPadding,
    paddingTop: space.md,
    paddingBottom: 14,
  },
  title: { fontSize: 40, lineHeight: 44, fontWeight: "900", fontStyle: "italic", letterSpacing: -1.6, paddingRight: 4 },
  icons: { flexDirection: "row", alignItems: "center", gap: 16 },
  dot: {
    position: "absolute",
    top: 1,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.base,
    backgroundColor: colors.red,
  },
  ring: { borderRadius: 22, borderWidth: 2, borderColor: colors.white, boxShadow: shadows.card },
  feed: { flex: 1 },
  floor: { position: "absolute", left: 0, right: 0 },
  list: { paddingHorizontal: layout.screenPadding, paddingBottom: space.xxl, gap: space.md },
  header: { gap: space.md },
  chips: { flexDirection: "row", gap: 10 },
  chip: {
    height: 40,
    paddingHorizontal: 20,
    borderRadius: radius.pill,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontSize: 15, lineHeight: 20, fontWeight: "500", color: "#45454D" },
  chipOnText: { color: colors.white, fontWeight: "600" },
  empty: { paddingVertical: space.xxl },
  pinned: { position: "absolute", top: 0, left: layout.screenPadding, right: layout.screenPadding },
  bar: {
    minHeight: 72,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingVertical: 12,
    paddingLeft: 18,
    paddingRight: 14,
    boxShadow: shadows.feed,
  },
  barFill: { borderRadius: 24 },
  pressed: { opacity: 0.9 },
  barText: { flex: 1, gap: 3 },
  barLabel: { flexDirection: "row", alignItems: "center", gap: 5 },
  barLabelText: { fontSize: 12, lineHeight: 15, fontWeight: "600", opacity: 0.8 },
  barQuestion: { fontSize: 16, lineHeight: 20, fontWeight: "700", letterSpacing: -0.3 },
  barLock: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ink,
  },
  barLockOnPhoto: { backgroundColor: colors.white },
});
