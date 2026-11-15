import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";

import { radius, space } from "@/theme";

import { Breathing } from "./Breathing";
import { BreathingButton } from "./BreathingButton";
import { stickerShadow } from "./Deco";
import { Text } from "./Text";

export type StickerView = {
  id: string;
  status: "pending" | "ready" | "failed";
  title: string | null;
  imageUrl: string | null;
  collected: boolean;
};

const STAR = require("@/assets/deco/star.png") as number;
const HEART = require("@/assets/deco/heart.png") as number;

type StickerArtProps = {
  sticker: Pick<StickerView, "status" | "title" | "imageUrl">;
  size?: number;
};

export function StickerArt({ sticker, size = 96 }: StickerArtProps) {
  if (sticker.status === "ready" && sticker.imageUrl) {
    return (
      <View style={stickerShadow}>
        <Image
          testID="sticker-image"
          source={{ uri: sticker.imageUrl }}
          style={{ width: size, height: size }}
          contentFit="contain"
          transition={400}
          accessibilityLabel={sticker.title ? "Sticker: " + sticker.title : "Sticker"}
        />
      </View>
    );
  }

  const pending = sticker.status === "pending";
  return (
    <Breathing
      active={pending}
      period={1600}
      scale={0.05}
      dim={0.3}
      style={[styles.blank, { width: size, height: size, borderRadius: Math.min(radius.tile, size / 4) }]}>
      <View testID={pending ? "sticker-pending" : "sticker-fallback"}>
        <Image
          source={pending ? STAR : HEART}
          style={{ width: size * 0.5, height: size * 0.5 }}
          contentFit="contain"
        />
      </View>
    </Breathing>
  );
}

type StickerKeepsakeProps = {
  sticker: StickerView;
  onCollect: () => void;
  onOpen?: () => void;
  size?: number;
};

export function StickerKeepsake({ sticker, onCollect, onOpen, size = 168 }: StickerKeepsakeProps) {
  const pending = sticker.status === "pending";
  return (
    <View style={styles.keepsake} testID="sticker-keepsake">
      <Pressable accessibilityRole="button" accessibilityLabel="Open sticker" disabled={!onOpen || pending} onPress={onOpen}>
        <StickerArt sticker={sticker} size={size} />
      </Pressable>
      <Text variant="title" style={styles.centered} testID="sticker-title">
        {pending ? "Your sticker is on its way." : sticker.title}
      </Text>
      {pending ? (
        <Text variant="caption" soft style={styles.centered}>
          Every conversation that opens leaves one behind.
        </Text>
      ) : sticker.collected ? (
        <Text variant="caption" soft style={styles.centered} testID="sticker-collected">
          Collected. It's in your Badges.
        </Text>
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

const TILE = 96;

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
          <Text variant="label" numberOfLines={2} style={styles.centered}>
            {sticker.title}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  blank: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(20, 20, 28, 0.15)",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  keepsake: { alignItems: "center", gap: space.sm },
  collect: { alignSelf: "stretch", marginTop: space.sm },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  tile: { width: TILE, gap: space.xs },
  centered: { textAlign: "center" },
  pressed: { opacity: 0.6 },
});
