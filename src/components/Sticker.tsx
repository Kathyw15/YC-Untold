import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";

import { STICKER_IMAGES } from "@/lib/stickerImages";
import { space } from "@/theme";

import { BreathingButton } from "./BreathingButton";
import { Text } from "./Text";

export type StickerView = {
  id: string;
  key: string | null;
  title: string | null;
  imageUrl: string | null;
  collected: boolean;
};

type StickerArtProps = {
  sticker: Pick<StickerView, "key" | "title" | "imageUrl">;
  size?: number;
};

export function StickerArt({ sticker, size = 96 }: StickerArtProps) {
  const bundled = sticker.key && sticker.key in STICKER_IMAGES ? STICKER_IMAGES[sticker.key as keyof typeof STICKER_IMAGES] : null;
  return (
    <Image
      testID="sticker-image"
      source={bundled ?? (sticker.imageUrl ? { uri: sticker.imageUrl } : STICKER_IMAGES["we-talked"])}
      style={[{ width: size, height: size }, styles.art]}
      contentFit="contain"
      transition={300}
      accessibilityLabel={sticker.title ? "Sticker: " + sticker.title : "Sticker"}
    />
  );
}

type StickerKeepsakeProps = {
  sticker: StickerView;
  onCollect: () => void;
  onOpen?: () => void;
  size?: number;
};

export function StickerKeepsake({ sticker, onCollect, onOpen, size = 168 }: StickerKeepsakeProps) {
  return (
    <View style={styles.keepsake} testID="sticker-keepsake">
      <Pressable accessibilityRole="button" accessibilityLabel="Open sticker" disabled={!onOpen} onPress={onOpen}>
        <StickerArt sticker={sticker} size={size} />
      </Pressable>
      <Text variant="heading" style={styles.centered} testID="sticker-title">
        {sticker.title}
      </Text>
      {sticker.collected ? (
        <View style={styles.tag} testID="sticker-collected">
          <Text variant="label" style={styles.tagText}>
            Collected · in your Badges
          </Text>
        </View>
      ) : (
        <View style={styles.collect}>
          <BreathingButton testID="sticker-collect" label="Collect" onPress={onCollect} />
        </View>
      )}
    </View>
  );
}

type StickerGridProps = {
  stickers: StickerView[];
  onOpen: (id: string) => void;
};

const TILE = 100;

export function StickerGrid({ stickers, onOpen }: StickerGridProps) {
  return (
    <View style={styles.grid} testID="sticker-grid">
      {stickers.map((sticker) => (
        <Pressable
          key={sticker.id}
          testID="sticker-tile"
          accessibilityRole="button"
          accessibilityLabel={sticker.title ?? "Sticker"}
          onPress={() => onOpen(sticker.id)}
          style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
          <StickerArt sticker={sticker} size={TILE} />
          <Text variant="caption" numberOfLines={2} style={[styles.centered, styles.tileTitle]}>
            {sticker.title}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  art: { filter: "drop-shadow(0 3px 6px rgba(20, 20, 40, 0.16))" } as object,
  keepsake: { alignItems: "center", gap: space.sm },
  collect: { alignSelf: "stretch", marginTop: space.sm },
  tag: { height: 28, justifyContent: "center", paddingHorizontal: 12, borderRadius: 14, backgroundColor: "#E2F7A1" },
  tagText: { color: "#344407" },
  grid: { flexDirection: "row", flexWrap: "wrap", columnGap: 20, rowGap: space.md },
  tile: { width: TILE, gap: space.xs },
  tileTitle: { fontWeight: "600" },
  centered: { textAlign: "center" },
  pressed: { opacity: 0.6 },
});
