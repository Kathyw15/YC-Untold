import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { QuietLoading } from "@/components/QuietLoading";
import { SessionProvider, useSession } from "@/lib/session";
import { colors, fontAssets } from "@/theme";

SplashScreen.preventAutoHideAsync();

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, { unsavedChangesWarning: false });

function useAuthWithConvexTemplate() {
  return { ...useAuth(), sessionClaims: undefined };
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hide();
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.forest }}>
      <ClerkProvider publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!} tokenCache={tokenCache}>
        <ConvexProviderWithClerk client={convex} useAuth={useAuthWithConvexTemplate}>
          <SessionProvider>
            <RootNavigator />
          </SessionProvider>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const session = useSession();
  const ready = session.status === "ready";
  return (
    <>
      <StatusBar style={ready ? "dark" : "light"} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          animationDuration: 500,
          contentStyle: { backgroundColor: colors.forest },
        }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
      </Stack>
      {session.status === "loading" ? <QuietLoading stalled={session.stalled} /> : null}
    </>
  );
}
