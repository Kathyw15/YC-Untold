import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { colors, fonts, shadows } from "@/theme";

import { Text } from "./Text";

type AvatarProps = {
  uri: string | null;
  name: string | null;
  size?: number;
};

const FILLS = [colors.lilac, colors.pink, colors.sky, colors.tangerine] as const;

export function Avatar({ uri, name, size = 96 }: AvatarProps) {
  const border = size >= 80 ? 5 : 2;
  const shape = { width: size, height: size, borderRadius: size / 2, borderWidth: border };
  const initial = name?.trim().charAt(0).toUpperCase() ?? "";
  return (
    <View style={[styles.frame, shape, { backgroundColor: FILLS[(initial.charCodeAt(0) || 0) % FILLS.length] }]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size - border * 2, height: size - border * 2, borderRadius: size / 2 }}
          contentFit="cover"
          transition={300}
          accessibilityLabel="Profile photo"
        />
      ) : (
        <Text style={{ fontFamily: fonts.black, fontSize: size * 0.4, lineHeight: size * 0.5, color: colors.white }}>
          {initial}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.white,
    boxShadow: shadows.avatar,
  },
});
