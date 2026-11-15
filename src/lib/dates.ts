export function shortDate(time: number) {
  return new Date(time).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
