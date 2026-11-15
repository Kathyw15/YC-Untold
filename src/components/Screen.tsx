import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { layout, type SceneName, scenes, space } from "@/theme";

import { Atmosphere } from "./Atmosphere";

export function tabBarBottom(bottomInset: number) {
  return Math.max(bottomInset - 10, layout.tabBarInset);
}

export function useTabBarClearance() {
  return tabBarBottom(useSafeAreaInsets().bottom) + layout.tabBarHeight + space.md;
}

type ScreenProps = {
  scene: SceneName;
  children: ReactNode;
  aboveTabBar?: boolean;
  testID?: string;
  contentStyle?: StyleProp<ViewStyle>;
};

export function Screen({ scene, children, aboveTabBar = false, testID, contentStyle }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const clearance = useTabBarClearance();
  return (
    <Atmosphere scene={scene}>
      <StatusBar style={scenes[scene].tone === "dark" ? "light" : "dark"} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.fill}>
        <View
          testID={testID}
          style={[
            styles.content,
            {
              paddingTop: insets.top + space.md,
              paddingBottom: aboveTabBar ? clearance : insets.bottom + space.lg,
            },
            contentStyle,
          ]}>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Atmosphere>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { flex: 1, paddingHorizontal: layout.screenPadding },
});
