import type { Tone } from "./tokens";

export const scenes = {
  dawn: { source: require("@/assets/atmosphere/dawn.jpg"), tone: "light" },
  mist: { source: require("@/assets/atmosphere/mist.jpg"), tone: "light" },
  forest: { source: require("@/assets/atmosphere/forest.jpg"), tone: "dark" },
  wheat: { source: require("@/assets/atmosphere/wheat.jpg"), tone: "light" },
} as const satisfies Record<string, { source: number; tone: Tone }>;

export type SceneName = keyof typeof scenes;

export const grain = require("@/assets/atmosphere/grain.png") as number;
