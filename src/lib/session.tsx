import { useAuth } from "@clerk/expo";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { createContext, type ReactNode, use, useEffect, useState } from "react";

import { api } from "@/convex/_generated/api";

type Profile = NonNullable<(typeof api.users.me)["_returnType"]>;

export type Session =
  | { status: "loading"; stalled: boolean }
  | { status: "signedOut" }
  | { status: "needsOnboarding"; me: Profile }
  | { status: "ready"; me: Profile };

const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === "1";

const SessionContext = createContext<Session>({ status: "loading", stalled: false });
const EndIntroContext = createContext<() => void>(() => {});

export function useEndIntro() {
  return use(EndIntroContext);
}

export function useSession() {
  return use(SessionContext);
}

export function useProfile(): Profile {
  const session = use(SessionContext);
  if (session.status === "loading" || session.status === "signedOut") {
    throw new Error("useProfile needs a signed-in user");
  }
  return session.me;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { isAuthenticated } = useConvexAuth();
  const me = useQuery(api.users.me, isAuthenticated ? {} : "skip");
  const ensure = useMutation(api.users.ensure);
  const [stalled, setStalled] = useState(false);
  const [intro, setIntro] = useState(false);

  useEffect(() => {
    if (DEMO_MODE && isLoaded && !isSignedIn) setIntro(true);
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (!isAuthenticated || me !== null) return;
    ensure().catch(() => setStalled(true));
  }, [ensure, isAuthenticated, me]);

  let session: Session;
  if (!isLoaded) session = { status: "loading", stalled: false };
  else if (!isSignedIn) session = { status: "signedOut" };
  else if (!isAuthenticated || !me) session = { status: "loading", stalled };
  else if (!me.onboarded || intro) session = { status: "needsOnboarding", me };
  else session = { status: "ready", me };

  return (
    <SessionContext value={session}>
      <EndIntroContext value={() => setIntro(false)}>{children}</EndIntroContext>
    </SessionContext>
  );
}
