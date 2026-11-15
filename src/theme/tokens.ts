export const colors = {
  ink: "#0B0B0F",
  ink2: "#6B6B73",
  ink3: "#A3A3AB",
  line: "rgba(11, 11, 15, 0.08)",
  fill: "#EFEFF4",
  base: "#F7F7FA",
  white: "#FFFFFF",
  blue: "#2F7CF6",
  blueSoft: "#E2EDFF",
  red: "#FF3B30",
  lime: "#E2F7A1",
  limeInk: "#344407",
  pink: "#FFE1EA",
  pinkInk: "#A2234F",
  bubble: "#EEEEF2",
  track: "#EEEEF3",
} as const;

export type Tone = "light" | "dark";

export const tones = {
  light: {
    ground: colors.base,
    text: colors.ink,
    textSoft: colors.ink2,
    faint: colors.ink3,
    hairline: colors.line,
    surface: "rgba(255, 255, 255, 0.62)",
    border: "rgba(255, 255, 255, 0.9)",
    pill: colors.ink,
    onPill: colors.white,
  },
  dark: {
    ground: "#1B2233",
    text: colors.white,
    textSoft: "rgba(255, 255, 255, 0.86)",
    faint: "rgba(255, 255, 255, 0.6)",
    hairline: "rgba(255, 255, 255, 0.42)",
    surface: "rgba(255, 255, 255, 0.18)",
    border: "rgba(255, 255, 255, 0.42)",
    pill: colors.white,
    onPill: colors.ink,
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
  feed: 30,
  card: 28,
  reveal: 24,
  list: 24,
  field: 18,
  thumb: 16,
  pill: 999,
} as const;

export const shadows = {
  card: "0 1px 2px rgba(16, 18, 30, 0.05), 0 6px 20px rgba(16, 18, 30, 0.07)",
  feed: "0 2px 6px rgba(16, 18, 30, 0.06), 0 18px 44px rgba(16, 18, 30, 0.16)",
  blackPill: "0 10px 24px rgba(11, 11, 15, 0.2)",
  whitePill: "0 10px 28px rgba(0, 0, 0, 0.16)",
  tabBar: "0 12px 36px rgba(20, 22, 40, 0.16)",
} as const;

export const questionGradients = [
  ["#FFE2D2", "#FDF1D6", "#E8F6C4", "#DCEFFF"],
  ["#E7E1FF", "#FDE3F0", "#FFF0D9"],
  ["#D8EEFF", "#E5E3FF", "#FBE5F2"],
  ["#F4F8C6", "#DDF3E3", "#D6EAFF"],
  ["#FFF0C6", "#FFDFD4", "#EFE2FF"],
] as const;

export const motion = {
  breath: 5000,
  rise: 420,
  riseDistance: 10,
  stagger: 90,
} as const;

export const layout = {
  screenPadding: 20,
  tabBarHeight: 76,
  tabBarInset: 18,
} as const;
