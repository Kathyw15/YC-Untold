import { useAuth } from "@clerk/expo";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { space } from "@/theme";

import { Atmosphere } from "./Atmosphere";
import { Breathing } from "./Breathing";
import { QuietLink } from "./QuietLink";
import { Text } from "./Text";
import { Wordmark } from "./Wordmark";

const PATIENCE_MS = 12000;

export function QuietLoading({ stalled }: { stalled: boolean }) {
  const { isSignedIn, signOut } = useAuth();
  const [waitedLong, setWaitedLong] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setWaitedLong(true), PATIENCE_MS);
    return () => clearTimeout(timer);
  }, []);

  const offerWayOut = isSignedIn && (stalled || waitedLong);

  return (
    <View style={StyleSheet.absoluteFill} testID="loading-screen">
      <Atmosphere scene="sky">
        <View style={styles.center}>
          <Breathing period={1800} scale={0.06} dim={0.3}>
            <Wordmark style={styles.mark} />
          </Breathing>
        </View>
        {offerWayOut ? (
          <Animated.View entering={FadeIn.duration(600)} style={styles.wayOut}>
            <Text variant="caption" style={styles.centered}>
              We couldn't open your account just now.
            </Text>
            <QuietLink label="Sign out and try again" onPress={() => void signOut()} testID="loading-sign-out" />
          </Animated.View>
        ) : null}
      </Atmosphere>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  mark: { fontSize: 56, lineHeight: 64, letterSpacing: -3.4 },
  wayOut: { position: "absolute", left: space.xl, right: space.xl, bottom: space.xxl * 2, gap: space.sm },
  centered: { textAlign: "center" },
});
