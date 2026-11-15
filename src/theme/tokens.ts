export const colors = {
  paper: "#F3EFE6",
  mist: "#C9D3D6",
  moss: "#6F7D4F",
  wheat: "#C9A85C",
  forest: "#1F2A22",
  inkSoft: "#4A5148",
} as const;

export type Tone = "light" | "dark";

export const tones = {
  light: {
    ground: colors.paper,
    text: colors.forest,
    textSoft: colors.inkSoft,
    hairline: "rgba(31, 42, 34, 0.22)",
    surface: "rgba(243, 239, 230, 0.5)",
    veil: ["rgba(243, 239, 230, 0.3)", "rgba(243, 239, 230, 0.12)", "rgba(243, 239, 230, 0.78)"],
  },
  dark: {
    ground: colors.forest,
    text: colors.paper,
    textSoft: "rgba(243, 239, 230, 0.72)",
    hairline: "rgba(243, 239, 230, 0.3)",
    surface: "rgba(31, 42, 34, 0.38)",
    veil: ["rgba(31, 42, 34, 0.42)", "rgba(31, 42, 34, 0.3)", "rgba(31, 42, 34, 0.84)"],
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
  pill: 999,
} as const;

export const motion = {
  breath: 5000,
  drift: 16000,
  rise: 520,
  riseDistance: 10,
  stagger: 120,
} as const;

export const layout = {
  screenPadding: space.xl,
  tabBarHeight: 64,
  grainOpacity: 0.07,
} as const;
