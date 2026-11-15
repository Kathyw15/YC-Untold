import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";
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
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.fill}>
        <View
          testID={testID}
          style={[
            styles.content,
            {
              paddingTop: insets.top + space.lg,
              paddingBottom: insets.bottom + space.lg + (aboveTabBar ? layout.tabBarHeight : 0),
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
