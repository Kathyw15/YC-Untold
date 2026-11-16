import { useMutation } from "convex/react";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";

import { ContactsInvitation } from "@/components/ContactsInvitation";
import { OnboardingSlide } from "@/components/OnboardingSlide";
import { Screen } from "@/components/Screen";
import { api } from "@/convex/_generated/api";
import { requestContactsAccess } from "@/lib/contacts";
import { useEndIntro } from "@/lib/session";

const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === "1";

const PAGES = [
  {
    scene: "clouds",
    eyebrow: "Private expression",
    headline: "Speak first. Stay sealed.",
    body: "Say what you really think or feel. No one else sees it yet.",
  },
  {
    scene: "letter",
    eyebrow: "AI intermediary",
    headline: "AI finds mutual intent.",
    body: "Your words meet in a private AI space, where meaning and intentions are matched before anything is revealed.",
  },
  {
    scene: "friends",
    eyebrow: "Mutual reveal",
    headline: "Reveal together.",
    body: "Two yeses. Your words unlock. A real conversation begins.",
  },
] as const;

export default function OnboardingScreen() {
  const complete = useMutation(api.users.completeOnboarding);
  const endIntro = useEndIntro();
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState(false);

  async function finish(askForContacts: boolean) {
    setBusy(true);
    if (askForContacts) await requestContactsAccess().catch(() => null);
    complete().then(endIntro, () => setBusy(false));
  }

  return (
    <Screen scene={PAGES[page]?.scene ?? "aurora"} testID="onboarding-screen">
      <StatusBar style={page < PAGES.length ? "light" : "dark"} />
      {page < PAGES.length ? (
        <OnboardingSlide
          eyebrow={PAGES[page].eyebrow}
          headline={PAGES[page].headline}
          body={PAGES[page].body}
          index={page}
          count={PAGES.length}
          nextLabel={page === PAGES.length - 1 ? "Get started" : undefined}
          onNext={() => (DEMO_MODE && page === PAGES.length - 1 ? void finish(false) : setPage(page + 1))}
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
