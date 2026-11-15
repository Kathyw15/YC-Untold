import type { Tone } from "./tokens";

const sky = require("@/assets/backgrounds/sky.jpg") as number;
const pastel = require("@/assets/backgrounds/pastel.jpg") as number;
const dusk = require("@/assets/backgrounds/dusk.jpg") as number;
const golden = require("@/assets/backgrounds/golden.jpg") as number;

type Scene = {
  tone: Tone;
  ground: string;
  photo: number | null;
  // "top": the photo sits at the top and fades into the ground. "full": the photo fills the screen.
  fit: "top" | "full";
  veil: readonly [string, string, ...string[]];
  veilStops: readonly [number, number, ...number[]];
  veilHeight?: number;
};

export const scenes = {
  // Tab roots: sky at the top, fading to cloud.
  soft: {
    tone: "light",
    ground: "#F6F4FB",
    photo: sky,
    fit: "top",
    veil: ["rgba(246, 244, 251, 0.15)", "rgba(246, 244, 251, 0.82)", "#F6F4FB"],
    veilStops: [0, 0.53, 1],
    veilHeight: 320,
  },
  // Sign-in steps and explainers: pastel sky at the top, fading.
  blush: {
    tone: "light",
    ground: "#F8F4FC",
    photo: pastel,
    fit: "top",
    veil: ["rgba(248, 244, 252, 0.1)", "rgba(248, 244, 252, 0.8)", "#F8F4FC"],
    veilStops: [0, 0.53, 1],
    veilHeight: 380,
  },
  // Welcome and question detail: full sky, white text.
  sky: {
    tone: "dark",
    ground: "#5B9BD8",
    photo: sky,
    fit: "full",
    veil: ["rgba(40, 90, 160, 0.25)", "rgba(40, 90, 160, 0)"],
    veilStops: [0, 0.45],
  },
  // Writing sheets and the invitation: dusk sky under a dark veil, white text.
  dusk: {
    tone: "dark",
    ground: "#2B2742",
    photo: dusk,
    fit: "full",
    veil: ["rgba(28, 22, 60, 0.4)", "rgba(28, 22, 60, 0.1)", "rgba(20, 14, 40, 0.62)"],
    veilStops: [0, 0.38, 1],
  },
  // Sealed confirmation and waiting.
  pastel: {
    tone: "light",
    ground: "#F3DCEB",
    photo: pastel,
    fit: "full",
    veil: ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0)"],
    veilStops: [0, 1],
  },
  // Reveal and sticker detail.
  golden: {
    tone: "light",
    ground: "#FFFAF0",
    photo: golden,
    fit: "full",
    veil: ["rgba(255, 250, 240, 0)", "rgba(255, 250, 240, 0.35)", "rgba(255, 250, 240, 0.8)"],
    veilStops: [0, 0.55, 1],
  },
  // Chat, profile, person page, onboarding: flat cloud with blushes in two corners.
  cloud: {
    tone: "light",
    ground: "#FBFAFF",
    photo: null,
    fit: "full",
    veil: ["#E3F0FF", "rgba(245, 245, 255, 0)", "rgba(255, 240, 246, 0)", "#FFE6F1"],
    veilStops: [0, 0.35, 0.65, 1],
  },
} as const satisfies Record<string, Scene>;

export type SceneName = keyof typeof scenes;
