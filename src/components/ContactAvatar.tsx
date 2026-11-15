import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";

import { Avatar } from "./Avatar";
import { Text } from "./Text";

type ContactAvatarProps = {
  uri?: string | null;
  emoji?: string | null;
  name: string;
  size?: number;
};

export function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .map((word) => word.replace(/[^A-Za-z0-9]/g, "").charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ContactAvatar({ uri = null, emoji, name, size = 44 }: ContactAvatarProps) {
  if (uri || emoji) return <Avatar uri={uri} emoji={emoji} name={name} size={size} />;
  return (
    <LinearGradient
      colors={["#E6E9F2", "#D6DAE6"]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={[styles.frame, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={{ fontSize: Math.round(size * 0.36), lineHeight: Math.round(size * 0.46), fontWeight: "600", color: "#5D6273" }}>
        {initialsOf(name)}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  frame: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
});
