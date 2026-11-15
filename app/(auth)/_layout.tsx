import { Redirect, Stack, useSegments } from "expo-router";

import { useSession } from "@/lib/session";
import { colors } from "@/theme";

export default function AuthLayout() {
  const { status } = useSession();
  const screen = useSegments().at(-1);

  if (status === "ready") return <Redirect href="/" />;
  if (status === "needsProfile" && screen !== "profile-setup") return <Redirect href="/profile-setup" />;
  if (status === "needsOnboarding" && screen !== "onboarding") return <Redirect href="/onboarding" />;
  if (status === "signedOut" && (screen === "profile-setup" || screen === "onboarding")) return <Redirect href="/phone" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        animationDuration: 500,
        contentStyle: { backgroundColor: colors.forest },
      }}
    />
  );
}
