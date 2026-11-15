import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { tones } from "@/theme";

import { useTone } from "./Atmosphere";
import { Text } from "./Text";

type AvatarProps = {
  uri: string | null;
  name: string | null;
  size?: number;
};

export function Avatar({ uri, name, size = 96 }: AvatarProps) {
  const tone = tones[useTone()];
  const shape = { width: size, height: size, borderRadius: size / 2 };
  return (
    <View style={[styles.frame, shape, { borderColor: tone.hairline, backgroundColor: tone.surface }]}>
      {uri ? (
        <Image source={{ uri }} style={shape} contentFit="cover" transition={400} accessibilityLabel="Profile photo" />
      ) : (
        <Text variant="title" soft style={{ fontSize: size * 0.4, lineHeight: size * 0.5 }}>
          {name?.trim().charAt(0).toUpperCase() ?? ""}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
});
