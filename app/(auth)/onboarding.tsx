import { useMutation } from "convex/react";
import { useState } from "react";

import { OnboardingSlide } from "@/components/OnboardingSlide";
import { Screen } from "@/components/Screen";
import { api } from "@/convex/_generated/api";

const HEADLINES = [
  "Some things are hard to say.",
  "Say them here. They stay sealed.",
  "When your words meet, you'll both know.",
];

export default function OnboardingScreen() {
  const complete = useMutation(api.users.completeOnboarding);
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState(false);
  const last = page === HEADLINES.length - 1;

  function onNext() {
    if (!last) return setPage(page + 1);
    setBusy(true);
    complete().catch(() => setBusy(false));
  }

  return (
    <Screen scene="cloud" testID="onboarding-screen">
      <OnboardingSlide
        headline={HEADLINES[page]}
        index={page}
        count={HEADLINES.length}
        nextLabel={last ? "Get started" : undefined}
        onNext={onNext}
        disabled={busy}
      />
    </Screen>
  );
}
