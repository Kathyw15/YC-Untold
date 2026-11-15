import { Redirect, Tabs } from "expo-router";

import { QuietTabBar } from "@/components/QuietTabBar";
import { useSession } from "@/lib/session";

export default function TabsLayout() {
  const { status } = useSession();

  if (status === "loading") return null;
  if (status !== "ready") return <Redirect href={status === "needsProfile" ? "/profile-setup" : "/phone"} />;

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <QuietTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="people" options={{ title: "People" }} />
      <Tabs.Screen name="connections" options={{ title: "Connections" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
