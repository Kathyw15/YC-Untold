import { EmptyState } from "@/components/EmptyState";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";

export default function PeopleScreen() {
  return (
    <Screen scene="mist" aboveTabBar testID="people-screen">
      <Rise>
        <Text variant="label" soft>
          People
        </Text>
      </Rise>
      <EmptyState
        testID="people-empty"
        title="No one is here yet."
        body="The people you might have something to say to will appear here."
      />
    </Screen>
  );
}
