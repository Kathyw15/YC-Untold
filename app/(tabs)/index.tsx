import { StyleSheet, View } from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { useProfile } from "@/lib/session";
import { space } from "@/theme";

function greeting(hour: number) {
  if (hour < 5) return "Still awake";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const me = useProfile();
  const now = new Date();
  const firstName = me.name?.split(" ")[0];

  return (
    <Screen scene="dawn" aboveTabBar testID="home-screen">
      <Rise>
        <View style={styles.header}>
          <Text variant="label" soft>
            {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </Text>
          <Text variant="display" testID="home-greeting">
            {greeting(now.getHours())},{"\n"}
            {firstName}.
          </Text>
        </View>
      </Rise>
      <EmptyState
        testID="home-empty"
        title="It's quiet here."
        body="Questions from the people you know will gather here, and wait until you're ready."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.sm },
});
