import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "convex/react";
import { BlurView } from "expo-blur";
import { Tabs, useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { api } from "@/convex/_generated/api";
import { colors, layout, radius, shadows } from "@/theme";

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];
type IconName = ComponentProps<typeof Ionicons>["name"];

const ICONS: Record<string, [IconName, IconName]> = {
  index: ["home-outline", "home"],
  people: ["people-outline", "people"],
  conversations: ["chatbubble-ellipses-outline", "chatbubble-ellipses"],
  profile: ["person-outline", "person"],
};

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
    const [outline, filled] = ICONS[route.name] ?? ICONS.index;
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
        style={[styles.tab, focused && styles.focused]}>
        <Ionicons name={focused ? filled : outline} size={24} color={focused ? colors.ink : "#6A6A74"} />
        {news[route.name] ? <View testID={"tab-" + title.toLowerCase() + "-news"} style={styles.news} /> : null}
      </Pressable>
    );
  });

  return (
    <View style={[styles.bar, { bottom: Math.max(insets.bottom, layout.tabBarInset) }]}>
      <BlurView intensity={40} tint="light" style={[StyleSheet.absoluteFill, styles.blur]} />
      {tabs.slice(0, centre)}
      <Pressable
        testID="tab-ask"
        accessibilityRole="button"
        accessibilityLabel="Ask a question"
        onPress={() => router.push("/compose/question")}
        style={({ pressed }) => [styles.tab, styles.ask, pressed && styles.pressed]}>
        <Ionicons name="add" size={28} color={colors.ink} />
      </Pressable>
      {tabs.slice(centre)}
    </View>
  );
}

const TAB = 54;

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: layout.tabBarInset,
    right: layout.tabBarInset,
    height: 68,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.95)",
    boxShadow: shadows.tabBar,
  },
  blur: { borderRadius: radius.pill, overflow: "hidden" },
  tab: { width: TAB, height: TAB, borderRadius: TAB / 2, alignItems: "center", justifyContent: "center" },
  focused: { backgroundColor: colors.white, boxShadow: "0 4px 14px rgba(20, 22, 40, 0.12)" },
  ask: { backgroundColor: colors.white, boxShadow: "0 6px 18px rgba(20, 22, 40, 0.2)" },
  news: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.red,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  pressed: { opacity: 0.7 },
});
