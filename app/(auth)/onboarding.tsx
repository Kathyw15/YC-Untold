import { useMutation } from "convex/react";
import { useState } from "react";

import { ContactsInvitation } from "@/components/ContactsInvitation";
import { OnboardingSlide } from "@/components/OnboardingSlide";
import { Screen } from "@/components/Screen";
import { api } from "@/convex/_generated/api";
import { requestContactsAccess } from "@/lib/contacts";

const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === "1";

const SCENES = ["clouds", "letter", "hug"] as const;

const HEADLINES = [
  "Some things are hard to say.",
  "Say them here. They stay sealed.",
  "When your words meet, you'll both know.",
];

export default function OnboardingScreen() {
  const complete = useMutation(api.users.completeOnboarding);
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState(false);

  async function finish(askForContacts: boolean) {
    setBusy(true);
    if (askForContacts) await requestContactsAccess().catch(() => null);
    complete().catch(() => setBusy(false));
  }

  return (
    <Screen scene={SCENES[page] ?? "aurora"} testID="onboarding-screen">
      {page < HEADLINES.length ? (
        <OnboardingSlide
          headline={HEADLINES[page]}
          index={page}
          count={HEADLINES.length}
          nextLabel={page === HEADLINES.length - 1 ? "Get started" : undefined}
          onNext={() => (DEMO_MODE && page === HEADLINES.length - 1 ? void finish(false) : setPage(page + 1))}
          disabled={busy}
        />
      ) : (
        <ContactsInvitation
          onContinue={() => void finish(true)}
          onNotNow={() => void finish(false)}
          onBack={() => setPage(page - 1)}
          busy={busy}
        />
      )}
    </Screen>
  );
}
