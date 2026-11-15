import Feather from "@expo/vector-icons/Feather";
import { BlurView } from "expo-blur";
import { Tabs, useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { colors, fonts, layout, shadows, space } from "@/theme";

import { tabBarBottom } from "./Screen";
import { Text } from "./Text";

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

const ICONS: Record<string, ComponentProps<typeof Feather>["name"]> = {
  index: "home",
  people: "users",
  conversations: "message-square",
  profile: "user",
};

export function QuietTabBar({ state, descriptors, emitter, navigateToTab, insets }: TabBarProps) {
  const router = useRouter();
  const centre = Math.ceil(state.routes.length / 2);

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
        <View style={[styles.bubble, focused && styles.bubbleOn]}>
          <Feather name={ICONS[route.name] ?? "circle"} size={20} color={focused ? colors.white : INACTIVE} />
        </View>
        <Text numberOfLines={1} style={[styles.label, { color: focused ? colors.ink : INACTIVE }]}>
          {title}
        </Text>
      </Pressable>
    );
  });

  return (
    <View style={[styles.bar, { bottom: tabBarBottom(insets.bottom) }]}>
      <BlurView intensity={20} tint="light" style={styles.blur} pointerEvents="none" />
      {tabs.slice(0, centre)}
      <Pressable
        testID="tab-ask"
        accessibilityRole="button"
        accessibilityLabel="Ask a question"
        hitSlop={space.sm}
        onPress={() => router.push("/compose/question")}
        style={({ pressed }) => [styles.ask, pressed && styles.pressed]}>
        <Feather name="plus" size={26} color={colors.white} />
      </Pressable>
      {tabs.slice(centre)}
    </View>
  );
}

const INACTIVE = "#9A9BAB";
const ASK_SIZE = 54;

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: layout.tabBarInset,
    right: layout.tabBarInset,
    height: layout.tabBarHeight,
    borderRadius: layout.tabBarHeight / 2,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    backgroundColor: "rgba(255, 255, 255, 0.74)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.85)",
    boxShadow: shadows.tabBar,
  },
  blur: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, borderRadius: layout.tabBarHeight / 2, overflow: "hidden" },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", gap: 2 },
  bubble: { width: 46, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  bubbleOn: { backgroundColor: colors.ink },
  label: { fontFamily: fonts.heavy, fontSize: 10, lineHeight: 13 },
  ask: {
    width: ASK_SIZE,
    height: ASK_SIZE,
    borderRadius: ASK_SIZE / 2,
    marginHorizontal: space.xs,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ink,
    boxShadow: "0 8px 18px rgba(20, 20, 28, 0.3)",
  },
  pressed: { opacity: 0.75 },
});
