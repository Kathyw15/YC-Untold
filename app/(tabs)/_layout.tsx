import { Redirect, Tabs } from "expo-router";

import { QuietTabBar } from "@/components/QuietTabBar";
import { useSession } from "@/lib/session";

export default function TabsLayout() {
  const { status } = useSession();

  if (status === "loading") return null;
  if (status === "needsProfile") return <Redirect href="/profile-setup" />;
  if (status === "needsOnboarding") return <Redirect href="/onboarding" />;
  if (status !== "ready") return <Redirect href="/welcome" />;

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <QuietTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="people" options={{ title: "People" }} />
      <Tabs.Screen name="conversations" options={{ title: "Conversations" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
