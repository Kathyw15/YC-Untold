export const colors = {
  ink: "#14141C",
  ink2: "#4B4D5E",
  mute: "#8A8C9C",
  cloud: "#F6F4FB",
  white: "#FFFFFF",
  pink: "#FF5FA2",
  sun: "#FFD23F",
  lilac: "#A98BFF",
  sky: "#5BB8FF",
  lime: "#E2FB5A",
  tangerine: "#FF9A3C",
  mint: "#C9F2DF",
} as const;

export type Tone = "light" | "dark";

export const tones = {
  light: {
    ground: colors.cloud,
    text: colors.ink,
    textSoft: colors.ink2,
    textMute: colors.mute,
    hairline: "rgba(20, 20, 28, 0.07)",
    surface: "rgba(255, 255, 255, 0.62)",
    surfaceBorder: "rgba(255, 255, 255, 0.78)",
    button: colors.ink,
    buttonText: colors.white,
  },
  dark: {
    ground: "#2B2742",
    text: colors.white,
    textSoft: "rgba(255, 255, 255, 0.88)",
    textMute: "rgba(255, 255, 255, 0.78)",
    hairline: "rgba(255, 255, 255, 0.32)",
    surface: "rgba(255, 255, 255, 0.16)",
    surfaceBorder: "rgba(255, 255, 255, 0.32)",
    button: colors.white,
    buttonText: colors.ink,
  },
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  card: 24,
  sheet: 30,
  field: 20,
  tile: 20,
  bubble: 22,
  pill: 999,
} as const;

export const shadows = {
  card: "0 8px 28px rgba(60, 40, 120, 0.10)",
  button: "0 8px 20px rgba(20, 20, 28, 0.22)",
  buttonSoft: "0 4px 14px rgba(40, 30, 90, 0.12)",
  tabBar: "0 10px 30px rgba(50, 30, 110, 0.16)",
  avatar: "0 2px 8px rgba(40, 30, 90, 0.12)",
} as const;

export const motion = {
  breath: 5000,
  rise: 420,
  riseDistance: 10,
  stagger: 90,
} as const;

export const layout = {
  screenPadding: 20,
  tabBarHeight: 70,
  tabBarInset: 14,
} as const;
