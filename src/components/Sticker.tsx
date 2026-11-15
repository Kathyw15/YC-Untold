import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";

import { colors, radius, space, tones } from "@/theme";

import { useTone } from "./Atmosphere";
import { Breathing } from "./Breathing";
import { BreathingButton } from "./BreathingButton";
import { Text } from "./Text";

export type StickerView = {
  id: string;
  status: "pending" | "ready" | "failed";
  title: string | null;
  imageUrl: string | null;
  collected: boolean;
};

type StickerArtProps = {
  sticker: Pick<StickerView, "status" | "title" | "imageUrl">;
  size?: number;
};

export function StickerArt({ sticker, size = 96 }: StickerArtProps) {
  const tone = tones[useTone()];
  const frame = { width: size, height: size, borderRadius: Math.min(radius.card, size / 4) };

  if (sticker.status === "ready" && sticker.imageUrl) {
    return (
      <Image
        testID="sticker-image"
        source={{ uri: sticker.imageUrl }}
        style={{ width: size, height: size }}
        contentFit="contain"
        transition={600}
        accessibilityLabel={sticker.title ? "Sticker: " + sticker.title : "Sticker"}
      />
    );
  }

  const pending = sticker.status === "pending";
  return (
    <View
      testID={pending ? "sticker-pending" : "sticker-fallback"}
      style={[styles.blank, frame, { borderColor: tone.hairline, backgroundColor: tone.surface }]}>
      <Breathing
        active={pending}
        scale={0.08}
        dim={0.35}
        style={[
          styles.seal,
          { width: size * 0.42, height: size * 0.42, borderRadius: size * 0.21 },
          { borderColor: pending ? tone.text : colors.ink3 },
        ]}>
        <View style={[styles.core, { backgroundColor: pending ? tone.text : colors.ink3 }]} />
      </Breathing>
    </View>
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
      <Text variant="quote" style={styles.centered} testID="sticker-title">
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
          <Text variant="caption" soft numberOfLines={2} style={styles.centered}>
            {sticker.title}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  blank: { alignItems: "center", justifyContent: "center", borderWidth: StyleSheet.hairlineWidth * 2 },
  seal: { alignItems: "center", justifyContent: "center", borderWidth: StyleSheet.hairlineWidth * 2 },
  core: { width: 6, height: 6, borderRadius: 3, opacity: 0.7 },
  keepsake: { alignItems: "center", gap: space.sm },
  collect: { alignSelf: "stretch", marginTop: space.sm },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  tile: { width: TILE, gap: space.xs },
  centered: { textAlign: "center" },
  pressed: { opacity: 0.6 },
});
