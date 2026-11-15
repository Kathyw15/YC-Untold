import { Redirect, Stack, useSegments } from "expo-router";

import { useSession } from "@/lib/session";
import { colors } from "@/theme";

export default function AuthLayout() {
  const { status } = useSession();
  const onProfileSetup = useSegments().at(-1) === "profile-setup";

  if (status === "ready") return <Redirect href="/" />;
  if (status === "needsProfile" && !onProfileSetup) return <Redirect href="/profile-setup" />;
  if (status === "signedOut" && onProfileSetup) return <Redirect href="/phone" />;

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
