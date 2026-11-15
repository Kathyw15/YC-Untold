import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { colors, fonts, layout, space, type } from "@/theme";

import { Text } from "./Text";

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

export function QuietTabBar({ state, descriptors, emitter, navigateToTab, insets }: TabBarProps) {
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom, height: layout.tabBarHeight + insets.bottom }]}>
      {state.routes.map((route, index) => {
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
            <Text
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
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    paddingHorizontal: space.md,
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", gap: space.sm - 2 },
  label: { fontFamily: fonts.sansLight, fontSize: 13, lineHeight: 18, letterSpacing: 0.6 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.moss },
});
