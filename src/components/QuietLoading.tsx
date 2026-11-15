import { useAuth } from "@clerk/expo";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { colors, space } from "@/theme";

import { Atmosphere } from "./Atmosphere";
import { Breathing } from "./Breathing";
import { QuietLink } from "./QuietLink";
import { Text } from "./Text";

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
    <Animated.View style={StyleSheet.absoluteFill} exiting={FadeOut.duration(500)} testID="loading-screen">
      <Atmosphere scene="forest">
        <View style={styles.center}>
          <Breathing scale={0.5} dim={0.6} style={styles.dot} />
        </View>
        {offerWayOut ? (
          <Animated.View entering={FadeIn.duration(600)} style={styles.wayOut}>
            <Text variant="caption" soft style={styles.centered}>
              We couldn't open your account just now.
            </Text>
            <QuietLink label="Sign out and try again" onPress={() => void signOut()} testID="loading-sign-out" />
          </Animated.View>
        ) : null}
      </Atmosphere>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.paper },
  wayOut: { position: "absolute", left: space.xl, right: space.xl, bottom: space.xxl * 2, gap: space.sm },
  centered: { textAlign: "center" },
});
