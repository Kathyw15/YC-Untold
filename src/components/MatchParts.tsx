import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import type { ComponentProps } from "react";
import { Pressable, type StyleProp, StyleSheet, Text as PlainText, View, type ViewStyle } from "react-native";

import { STICKER_IMAGES } from "@/lib/stickerImages";
import { colors, radius, shadows, type } from "@/theme";

import { type CloudFace, CloudFrame } from "./CloudFrame";
import { Text } from "./Text";

type IconName = ComponentProps<typeof Ionicons>["name"];

const STROKES = [
  { x: 14, y: 19, length: 16, rotate: "-30deg" },
  { x: 28, y: 13.5, length: 21, rotate: "0deg" },
  { x: 42, y: 16.5, length: 17, rotate: "28deg" },
] as const;

export function Burst({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.burst, style]} pointerEvents="none">
      {STROKES.map((stroke) => (
        <View
          key={stroke.x}
          style={[
            styles.stroke,
            {
              left: stroke.x - 1.8,
              top: stroke.y - stroke.length / 2,
              height: stroke.length,
              transform: [{ rotate: stroke.rotate }],
            },
          ]}
        />
      ))}
    </View>
  );
}

type CloudPairProps = {
  size: number;
  left: CloudFace;
  right: CloudFace;
  burstOpacity?: number;
  style?: StyleProp<ViewStyle>;
};

export function CloudPair({ size, left, right, burstOpacity = 1, style }: CloudPairProps) {
  return (
    <View style={[styles.pair, style]}>
      <Burst style={[styles.pairBurst, { opacity: burstOpacity }]} />
      <CloudFrame size={size} {...left} />
      <View style={styles.overlap}>
        <CloudFrame size={size} variant="b" {...right} />
      </View>
    </View>
  );
}

type MatchTitleProps = {
  text: string;
  size?: number;
  underline?: number;
  sparkle?: number;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function MatchTitle({ text, size = 52, underline = 210, sparkle = 46, testID, style }: MatchTitleProps) {
  return (
    <View style={[styles.title, style]}>
      <View>
        <Text
          testID={testID}
          variant="hero"
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{
            fontSize: size,
            lineHeight: size * 1.12,
            fontWeight: "900",
            fontStyle: "italic",
            letterSpacing: size * -0.04,
            paddingHorizontal: 6,
            transform: [{ rotate: "-4deg" }],
          }}>
          {text}
        </Text>
        <Image
          source={STICKER_IMAGES.sparkles}
          style={[styles.sparkle, { width: sparkle, height: sparkle, right: -sparkle * 0.5, top: -sparkle * 0.78 }]}
          contentFit="contain"
        />
      </View>
      <View style={{ width: underline, height: 18 }}>
        <View style={[styles.underline, { left: 6, right: 6, top: 3, height: 3.4, transform: [{ rotate: "-0.6deg" }] }]} />
        <View style={[styles.underline, { left: 18, right: 20, top: 11, height: 2.6, transform: [{ rotate: "-0.4deg" }] }]} />
      </View>
    </View>
  );
}

type SaidCardsProps = {
  mine: string;
  theirs: string;
  name: string;
  minHeight?: number;
  sparkle?: number;
  mineTestID?: string;
  theirsTestID?: string;
  style?: StyleProp<ViewStyle>;
};

export function SaidCards({ mine, theirs, name, minHeight = 112, sparkle = 38, mineTestID, theirsTestID, style }: SaidCardsProps) {
  return (
    <View style={[styles.said, style]}>
      <LinearGradient
        colors={["#FCF6C2", "#F4F0D9", "#ECE5FF"]}
        locations={[0, 0.45, 1]}
        start={{ x: 0.25, y: 0 }}
        end={{ x: 0.75, y: 1 }}
        style={[styles.saidCard, { minHeight }]}>
        <Text style={styles.saidLabel}>You said</Text>
        <Text style={styles.saidBody} testID={mineTestID}>
          {mine}
        </Text>
      </LinearGradient>
      <LinearGradient
        colors={["#FFDCEC", "#F6E3F4", "#E8E3FF"]}
        locations={[0, 0.45, 1]}
        start={{ x: 0.25, y: 0 }}
        end={{ x: 0.75, y: 1 }}
        style={[styles.saidCard, { minHeight }]}>
        <Text style={styles.saidLabel} numberOfLines={1}>
          {name} said
        </Text>
        <Text style={styles.saidBody} testID={theirsTestID}>
          {theirs}
        </Text>
      </LinearGradient>
      <Image
        source={STICKER_IMAGES.sparkles}
        style={[styles.saidSparkle, { width: sparkle, height: sparkle, marginLeft: -sparkle / 2, top: -sparkle * 0.55 }]}
        contentFit="contain"
      />
    </View>
  );
}

type PillProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
  icon?: IconName;
  arrow?: boolean;
  variant?: "black" | "white";
  small?: boolean;
};

export function Pill({ label, onPress, disabled = false, testID, icon, arrow = false, variant = "black", small = false }: PillProps) {
  const ink = variant === "black" ? colors.white : colors.ink;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        small && styles.pillSmall,
        variant === "black"
          ? { backgroundColor: colors.ink, boxShadow: shadows.blackPill }
          : { backgroundColor: colors.white, boxShadow: shadows.whitePill },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}>
      {icon ? <Ionicons name={icon} size={small ? 15 : 18} color={ink} /> : null}
      <Text variant="button" numberOfLines={1} style={[{ color: ink }, small && styles.pillSmallText]}>
        {label}
      </Text>
      {arrow ? <Ionicons name="arrow-up" size={18} color={ink} style={styles.arrow} /> : null}
    </Pressable>
  );
}

type TextLinkProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
  ghost?: boolean;
};

export function TextLink({ label, onPress, disabled = false, testID, ghost = false }: TextLinkProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.link, { opacity: disabled ? 0.45 : pressed ? 0.5 : 1 }]}>
      <Text variant="row" style={ghost ? styles.ghostText : styles.linkText}>
        {label}
      </Text>
    </Pressable>
  );
}

const TAGS = {
  plain: { backgroundColor: colors.fill, color: colors.ink2 },
  ink: { backgroundColor: colors.ink, color: colors.white },
  lime: { backgroundColor: colors.lime, color: colors.limeInk },
  pink: { backgroundColor: colors.pink, color: colors.pinkInk },
} as const;

type TagProps = {
  label: string;
  tone?: keyof typeof TAGS;
  icon?: IconName;
  large?: boolean;
  testID?: string;
};

export function Tag({ label, tone = "plain", icon, large = false, testID }: TagProps) {
  const { backgroundColor, color } = TAGS[tone];
  return (
    <View style={[styles.tag, large && styles.tagLarge, { backgroundColor }]} testID={testID}>
      {icon ? <Ionicons name={icon} size={large ? 13 : 12} color={color} /> : null}
      <Text variant="label" numberOfLines={1} style={{ color, fontSize: large ? 13 : 12, lineHeight: 16 }}>
        {label}
      </Text>
    </View>
  );
}

export function MysteryAvatar({ size = 50 }: { size?: number }) {
  return (
    <View style={[styles.mystery, { width: size, height: size, borderRadius: size / 2 }]}>
      <Image source={require("@/assets/photos/mystery.jpg")} style={StyleSheet.absoluteFill} contentFit="cover" />
      <PlainText style={[type.row, styles.mysteryMark, { fontSize: size * 0.42, lineHeight: size * 0.52 }]}>?</PlainText>
    </View>
  );
}

export function timeLeft(ms: number) {
  const minutes = Math.ceil(ms / 60000);
  return Math.floor(minutes / 60) + "h " + String(minutes % 60).padStart(2, "0") + "m";
}

const styles = StyleSheet.create({
  burst: { width: 56, height: 40 },
  stroke: { position: "absolute", width: 3.6, borderRadius: 1.8, backgroundColor: colors.ink },
  pair: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  pairBurst: { position: "absolute", left: "50%", marginLeft: -24, top: -46 },
  overlap: { marginLeft: -26 },
  title: { alignItems: "center" },
  sparkle: { position: "absolute", transform: [{ rotate: "8deg" }] },
  underline: { position: "absolute", borderRadius: 2, backgroundColor: colors.ink },
  said: { flexDirection: "row", gap: 10 },
  saidCard: {
    flex: 1,
    borderRadius: radius.reveal,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.7)",
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  saidLabel: { fontSize: 15, lineHeight: 20, fontWeight: "700", marginBottom: 10 },
  saidBody: { fontSize: 16, lineHeight: 22, letterSpacing: -0.16 },
  saidSparkle: { position: "absolute", left: "50%" },
  pill: {
    height: 56,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingHorizontal: 24,
  },
  pillSmall: { height: 38, alignSelf: "flex-start", paddingHorizontal: 18, gap: 6 },
  pillSmallText: { fontSize: 15, lineHeight: 20 },
  arrow: { transform: [{ rotate: "45deg" }] },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.985 }] },
  link: { paddingVertical: 14, alignItems: "center" },
  linkText: { color: colors.ink, textDecorationLine: "underline" },
  ghostText: { color: "rgba(255, 255, 255, 0.85)", fontWeight: "500" },
  tag: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  tagLarge: { height: 30, borderRadius: 15, paddingHorizontal: 12 },
  mystery: { overflow: "hidden", alignItems: "center", justifyContent: "center" },
  mysteryMark: {
    color: colors.white,
    fontWeight: "800",
    letterSpacing: 0,
    textShadowColor: "rgba(70, 70, 130, 0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
});
