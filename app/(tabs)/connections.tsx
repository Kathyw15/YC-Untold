import { EmptyState } from "@/components/EmptyState";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";

export default function ConnectionsScreen() {
  return (
    <Screen scene="mist" aboveTabBar testID="connections-screen">
      <Rise>
        <Text variant="label" soft>
          Connections
        </Text>
      </Rise>
      <EmptyState
        testID="connections-empty"
        title="Nothing has surfaced yet."
        body="When your words and someone else's find each other, you'll both be asked before anything is revealed."
      />
    </Screen>
  );
}
