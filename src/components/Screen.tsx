import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, type StyleProp, StyleSheet, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { layout, type SceneName, space } from "@/theme";

import { Atmosphere } from "./Atmosphere";

type ScreenProps = {
  scene: SceneName;
  children: ReactNode;
  aboveTabBar?: boolean;
  testID?: string;
  contentStyle?: StyleProp<ViewStyle>;
};

export function Screen({ scene, children, aboveTabBar = false, testID, contentStyle }: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <Atmosphere scene={scene}>
      <KeyboardAvoidingView
        testID={testID}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[
          styles.content,
          {
            paddingTop: insets.top + space.lg,
            paddingBottom: insets.bottom + space.lg + (aboveTabBar ? layout.tabBarHeight : 0),
          },
          contentStyle,
        ]}>
        {children}
      </KeyboardAvoidingView>
    </Atmosphere>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: layout.screenPadding },
});
