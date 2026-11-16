import type { Tone } from "./tokens";

export const scenes = {
  base: { source: null, tone: "light", fit: "fill" },
  aurora: { source: require("@/assets/backgrounds/aurora.jpg"), tone: "light", fit: "fill" },
  lime: { source: require("@/assets/backgrounds/aurora-lime.jpg"), tone: "light", fit: "fill" },
  sky: { source: require("@/assets/onboarding/sky-cloudscape.jpg"), tone: "light", fit: "cover" },
  clouds: { source: require("@/assets/onboarding/o-clouds.jpg"), tone: "dark", fit: "cover" },
  letter: { source: require("@/assets/onboarding/o-letter.jpg"), tone: "dark", fit: "cover" },
  friends: { source: require("@/assets/onboarding/o-friends.jpg"), tone: "dark", fit: "cover" },
} as const satisfies Record<string, { source: number | null; tone: Tone; fit: "fill" | "cover" }>;

export type SceneName = keyof typeof scenes;
