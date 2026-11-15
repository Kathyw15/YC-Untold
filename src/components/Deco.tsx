import { Image } from "expo-image";
import { Platform, type StyleProp, View, type ViewStyle } from "react-native";

const DECO = {
  daisy: { source: require("@/assets/deco/daisy.png") as number, ratio: 360 / 322 },
  envelope: { source: require("@/assets/deco/envelope.png") as number, ratio: 360 / 243 },
  heart: { source: require("@/assets/deco/heart.png") as number, ratio: 360 / 305 },
  lock: { source: require("@/assets/deco/lock.png") as number, ratio: 310 / 360 },
  star: { source: require("@/assets/deco/star.png") as number, ratio: 360 / 350 },
} as const;

// A drop shadow that follows the sticker's outline rather than its bounding box.
export const stickerShadow = Platform.select<ViewStyle>({
  web: { filter: "drop-shadow(0 6px 10px rgba(40, 20, 80, 0.18))" },
  default: { shadowColor: "#281450", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 8 },
});

type DecoProps = {
  name: keyof typeof DECO;
  width: number;
  rotate?: number;
  style?: StyleProp<ViewStyle>;
};

export function Deco({ name, width, rotate = 0, style }: DecoProps) {
  const { source, ratio } = DECO[name];
  return (
    <View pointerEvents="none" style={[stickerShadow, { transform: [{ rotate: rotate + "deg" }] }, style]}>
      <Image source={source} style={{ width, height: width / ratio }} contentFit="contain" />
    </View>
  );
}
