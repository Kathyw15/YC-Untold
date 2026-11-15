import { Tabs } from "expo-router";

import { QuietTabBar } from "@/components/QuietTabBar";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <QuietTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="people" options={{ title: "People" }} />
      <Tabs.Screen name="connections" options={{ title: "Connections" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
