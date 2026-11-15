import type { Tone } from "./tokens";

export const scenes = {
  base: { source: null, tone: "light", fit: "fill" },
  aurora: { source: require("@/assets/backgrounds/aurora.jpg"), tone: "light", fit: "fill" },
  lime: { source: require("@/assets/backgrounds/aurora-lime.jpg"), tone: "light", fit: "fill" },
  sky: { source: require("@/assets/onboarding/splash-sky.jpg"), tone: "light", fit: "cover" },
  clouds: { source: require("@/assets/onboarding/o-clouds.jpg"), tone: "dark", fit: "cover" },
  letter: { source: require("@/assets/onboarding/o-letter.jpg"), tone: "dark", fit: "cover" },
  hug: { source: require("@/assets/onboarding/o-hug.jpg"), tone: "dark", fit: "cover" },
} as const satisfies Record<string, { source: number | null; tone: Tone; fit: "fill" | "cover" }>;

export type SceneName = keyof typeof scenes;
