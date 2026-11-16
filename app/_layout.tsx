import "@/lib/demoFrame";

import { ClerkProvider, useAuth } from "@clerk/expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { tokenCache } from "@clerk/expo/token-cache";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { Fragment, useEffect } from "react";
import { Platform, useWindowDimensions, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { MatchPopup } from "@/components/MatchPopup";
import { QuietLoading } from "@/components/QuietLoading";
import { SessionProvider, useSession } from "@/lib/session";
import { colors } from "@/theme";

SplashScreen.preventAutoHideAsync();

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, { unsavedChangesWarning: false });

function useAuthWithConvexTemplate() {
  return { ...useAuth(), sessionClaims: undefined };
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(Ionicons.font);

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hide();
  }, [fontError, fontsLoaded]);

  const framed = useWindowDimensions().width > 500 && Platform.OS === "web";

  if (!fontsLoaded && !fontError) return null;

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: framed ? "#E4E2DC" : colors.base }}>
    <GestureHandlerRootView
      style={[
        { flex: 1, width: "100%", backgroundColor: colors.base },
        framed && { maxWidth: 414, maxHeight: 896, borderRadius: 32, overflow: "hidden" },
      ]}>
      <ClerkProvider
        publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
        tokenCache={tokenCache}
        afterSignOutUrl={(process.env.EXPO_BASE_URL ?? "") + "/"}>
        <ConvexProviderWithClerk client={convex} useAuth={useAuthWithConvexTemplate}>
          <SessionProvider>
            <RootNavigator />
          </SessionProvider>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </GestureHandlerRootView>
    </View>
  );
}

function RootNavigator() {
  const session = useSession();
  const ready = session.status === "ready";
  const Insets = Platform.OS === "web" ? SafeAreaProvider : Fragment;
  return (
    <Insets>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          animationDuration: 500,
          contentStyle: { backgroundColor: colors.base },
        }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
      </Stack>
      {ready ? <MatchPopup /> : null}
      {session.status === "loading" ? <QuietLoading stalled={session.stalled} /> : null}
    </Insets>
  );
}
