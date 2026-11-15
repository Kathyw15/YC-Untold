import { useQuery } from "convex/react";
import { Tabs, useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { api } from "@/convex/_generated/api";
import { colors, fonts, layout, space, type } from "@/theme";

import { Text } from "./Text";

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

export function QuietTabBar({ state, descriptors, emitter, navigateToTab, insets }: TabBarProps) {
  const router = useRouter();
  const centre = Math.ceil(state.routes.length / 2);
  const notices = useQuery(api.notices.list);
  const matches = useQuery(api.matches.list);
  const news: Record<string, boolean | undefined> = {
    people: notices?.some((notice) => notice.kind === "sealedReceived" && !notice.read),
    conversations: matches?.some(
      (match) => match.state === "invited" || (match.state === "revealed" && !match.closed && !match.conversation),
    ),
  };

  const tabs = state.routes.map((route, index) => {
    const focused = state.index === index;
    const title = descriptors[route.key].options.title ?? route.name;
    return (
      <Pressable
        key={route.key}
        testID={"tab-" + title.toLowerCase()}
        accessibilityRole="tab"
        accessibilityLabel={title}
        accessibilityState={{ selected: focused }}
        onPress={() => {
          const event = emitter.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigateToTab(route.key);
        }}
        style={styles.tab}>
        {news[route.name] ? <View testID={"tab-" + title.toLowerCase() + "-news"} style={styles.news} /> : null}
        <Text
          numberOfLines={1}
          style={[
            type.button,
            styles.label,
            { color: focused ? colors.forest : colors.inkSoft, opacity: focused ? 1 : 0.62 },
            focused && { fontFamily: fonts.sans },
          ]}>
          {title}
        </Text>
        <View style={[styles.dot, { opacity: focused ? 1 : 0 }]} />
      </Pressable>
    );
  });

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom, height: layout.tabBarHeight + insets.bottom }]}>
      <View style={styles.side}>{tabs.slice(0, centre)}</View>
      <Pressable
        testID="tab-ask"
        accessibilityRole="button"
        accessibilityLabel="Ask a question"
        hitSlop={space.sm}
        onPress={() => router.push("/compose/question")}
        style={({ pressed }) => [styles.ask, pressed && styles.pressed]}>
        <View style={[styles.stroke, styles.across]} />
        <View style={[styles.stroke, styles.down]} />
      </Pressable>
      <View style={styles.side}>{tabs.slice(centre)}</View>
    </View>
  );
}

const ASK_SIZE = 44;
const STROKE = 16;

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.xs,
    gap: space.xs,
  },
  side: { flex: 1, flexDirection: "row", alignSelf: "stretch" },
  tab: { flexGrow: 1, alignItems: "center", justifyContent: "center", gap: space.sm - 2 },
  label: { fontFamily: fonts.sansLight, fontSize: 12, lineHeight: 18, letterSpacing: 0.2 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.moss },
  news: {
    position: "absolute",
    top: space.md - 2,
    right: space.sm,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.wheat,
  },
  ask: {
    width: ASK_SIZE,
    height: ASK_SIZE,
    borderRadius: ASK_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.forest,
  },
  stroke: { position: "absolute", backgroundColor: colors.paper, borderRadius: 1 },
  across: { width: STROKE, height: 1.5 },
  down: { width: 1.5, height: STROKE },
  pressed: { opacity: 0.6 },
});
