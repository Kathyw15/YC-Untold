import { Stack } from "expo-router";

import { useSession } from "@/lib/session";
import { colors } from "@/theme";

export default function AuthLayout() {
  const needsProfile = useSession().status === "needsProfile";
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        animationDuration: 500,
        contentStyle: { backgroundColor: colors.forest },
      }}>
      <Stack.Protected guard={!needsProfile}>
        <Stack.Screen name="phone" />
        <Stack.Screen name="verify" />
      </Stack.Protected>
      <Stack.Protected guard={needsProfile}>
        <Stack.Screen name="profile-setup" />
      </Stack.Protected>
    </Stack>
  );
}
