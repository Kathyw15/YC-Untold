import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { QUESTION_PHOTOS } from "@/lib/questionPhotos";
import { colors, questionGradients, space } from "@/theme";

import { ToneProvider } from "./Atmosphere";

export type QuestionLook = {
  id: string;
  gradient: number | null;
  photo: string | null;
  imageUrl: string | null;
};

const SCRIMS = {
  card: {
    colors: ["rgba(0, 0, 0, 0.06)", "rgba(0, 0, 0, 0)", "rgba(10, 10, 20, 0.18)", "rgba(10, 10, 20, 0.66)"],
    locations: [0, 0.3, 0.52, 1],
  },
  screen: {
    colors: ["rgba(6, 10, 26, 0.2)", "rgba(6, 10, 26, 0.04)", "rgba(6, 10, 26, 0.06)", "rgba(6, 10, 26, 0.48)"],
    locations: [0, 0.26, 0.52, 1],
  },
  detail: {
    colors: ["rgba(6, 10, 26, 0.5)", "rgba(6, 10, 26, 0.34)", "rgba(6, 10, 26, 0.22)", "rgba(6, 10, 26, 0.55)"],
    locations: [0, 0.45, 0.7, 1],
  },
} as const;

const HIGHLIGHT = ["rgba(255, 255, 255, 0.6)", "rgba(255, 255, 255, 0)"] as const;

export function gradientFor(id: string) {
  let sum = 0;
  for (let index = 0; index < id.length; index++) sum += id.charCodeAt(index);
  return questionGradients[sum % questionGradients.length];
}

export function questionPhoto(question: QuestionLook) {
  if (question.imageUrl) return { uri: question.imageUrl };
  return question.photo ? (QUESTION_PHOTOS[question.photo] ?? null) : null;
}

type QuestionBackgroundProps = {
  question: QuestionLook;
  variant?: keyof typeof SCRIMS;
  style?: StyleProp<ViewStyle>;
};

export function QuestionBackground({ question, variant = "card", style }: QuestionBackgroundProps) {
  const photo = questionPhoto(question);
  return (
    <View style={[StyleSheet.absoluteFill, styles.clip, style]} pointerEvents="none">
      {photo ? (
        <>
          <Image source={photo} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
          <LinearGradient
            colors={SCRIMS[variant].colors}
            locations={SCRIMS[variant].locations}
            style={StyleSheet.absoluteFill}
          />
        </>
      ) : (
        <>
          <LinearGradient
            colors={
              question.gradient !== null && questionGradients[question.gradient]
                ? questionGradients[question.gradient]
                : gradientFor(question.id)
            }
            start={{ x: 0.37, y: 0 }}
            end={{ x: 0.63, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient colors={HIGHLIGHT} start={{ x: 1, y: 0 }} end={{ x: 0.45, y: 0.4 }} style={StyleSheet.absoluteFill} />
        </>
      )}
    </View>
  );
}

type QuestionSceneProps = {
  question: QuestionLook | null | undefined;
  variant: "screen" | "detail";
  children: ReactNode;
  testID?: string;
};

export function QuestionScene({ question, variant, children, testID }: QuestionSceneProps) {
  const insets = useSafeAreaInsets();
  return (
    <ToneProvider tone={question && questionPhoto(question) ? "dark" : "light"}>
      <View style={styles.scene}>
        {question ? <QuestionBackground question={question} variant={variant} /> : null}
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.fill}>
          <View
            testID={testID}
            style={[styles.content, { paddingTop: insets.top + space.md, paddingBottom: insets.bottom + space.lg }]}>
            {children}
          </View>
        </KeyboardAvoidingView>
      </View>
    </ToneProvider>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: "hidden" },
  scene: { flex: 1, backgroundColor: colors.base, overflow: "hidden" },
  fill: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 22 },
});
