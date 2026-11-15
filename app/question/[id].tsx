import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "convex/react";
import { Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { useTone } from "@/components/Atmosphere";
import { BreathingButton } from "@/components/BreathingButton";
import { IconButton } from "@/components/IconButton";
import { MascotAvatar, type QuestionSummary } from "@/components/QuestionCard";
import { QuestionBackground, questionPhoto, QuestionScene } from "@/components/QuestionBackground";
import { Rise } from "@/components/Rise";
import { Text } from "@/components/Text";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { colors, radius, shadows, space, tones } from "@/theme";

function ago(time: number) {
  const minutes = Math.floor((Date.now() - time) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return minutes + "m ago";
  if (minutes < 60 * 24) return Math.floor(minutes / 60) + "h ago";
  return Math.floor(minutes / (60 * 24)) + "d ago";
}

function answered(count: number) {
  if (count <= 0) return "No answers yet";
  return count === 1 ? "1 person answered" : count + " people answered";
}

function Body({ question, onAnswer }: { question: QuestionSummary & { myAnswer: { body: string } | null }; onAnswer: () => void }) {
  const toneName = useTone();
  const tone = tones[toneName];
  const glass = toneName === "dark" ? styles.photoGlass : styles.glass;
  const first = question.isMine ? "You" : (question.author?.name?.split(" ")[0] ?? "Someone");
  return (
    <>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Rise>
          <View style={styles.author}>
            {question.isDaily ? (
              <MascotAvatar size={44} />
            ) : (
              <Avatar
                uri={question.author?.avatarUrl ?? null}
                emoji={question.author?.avatarEmoji}
                name={question.author?.name ?? null}
                size={44}
              />
            )}
            <View>
              <Text style={styles.name}>{question.isDaily ? "Daily question" : first}</Text>
              <Text style={styles.ago}>{ago(question.createdAt)}</Text>
            </View>
          </View>
        </Rise>
        <Rise order={1}>
          <Text style={styles.question} testID="question-text">
            {question.text}
          </Text>
        </Rise>
        {question.tags.length > 0 ? (
          <Rise order={2}>
            <View style={styles.tags}>
              {question.tags.map((tag) => (
                <View key={tag} style={[styles.tag, glass]}>
                  <Text style={styles.tagText}># {tag}</Text>
                </View>
              ))}
            </View>
          </Rise>
        ) : null}
        <Rise order={3}>
          <View style={[styles.sealed, glass]}>
            <View style={[styles.lock, toneName === "dark" ? styles.lockOnPhoto : styles.lockOnGradient]}>
              <Ionicons name="lock-closed" size={20} color={tone.text} />
            </View>
            <View style={styles.sealedText}>
              {question.myAnswer ? (
                <>
                  <Text style={styles.sealedTitle}>Your answer is sealed</Text>
                  <Text style={styles.mine} testID="my-answer">
                    “{question.myAnswer.body}”
                  </Text>
                  <Text style={styles.sealedBody}>
                    Only you can see this. If your words meet someone’s, we’ll let you both know.
                  </Text>
                </>
              ) : question.isDaily ? (
                <>
                  <Text style={styles.sealedTitle}>Every answer here is sealed</Text>
                  <Text style={styles.sealedBody}>
                    Answers are only revealed when two people both choose to unlock.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.sealedTitle}>{first}’s answer is sealed</Text>
                  <Text style={styles.sealedBody}>
                    Their answer will only be revealed if you both choose to unlock.
                  </Text>
                </>
              )}
            </View>
          </View>
        </Rise>
        <Rise order={4}>
          <View style={styles.count}>
            <Ionicons name="people" size={20} color={tone.text} />
            <Text style={styles.countText} testID="question-responses">
              {answered(question.responseCount)}
            </Text>
          </View>
        </Rise>
      </ScrollView>
      <Rise order={4} style={styles.foot}>
        {question.myAnswer ? (
          <View style={[styles.waiting, toneName === "dark" ? styles.waitingOnPhoto : styles.waitingOnGradient]}>
            <Ionicons name="sparkles" size={16} color={tone.text} />
            <Text variant="button">We’ll tell you if your words meet</Text>
          </View>
        ) : (
          <BreathingButton testID="answer-privately" label="Leave your answer" icon="pencil-outline" onPress={onAnswer} />
        )}
      </Rise>
    </>
  );
}

function Mine({ question }: { question: QuestionSummary & { myAnswer: { body: string } | null } }) {
  const router = useRouter();
  const matches = useQuery(api.matches.list);
  const mine = (matches ?? []).filter((match) => match.question === question.text);
  const ink = questionPhoto(question) ? colors.white : colors.ink;
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.mineCard}>
        <QuestionBackground question={question} style={styles.mineFill} />
        <Text style={[styles.mineQuestion, { color: ink }]} testID="question-text">
          {question.text}
        </Text>
        <View style={styles.mineMeta}>
          <Text style={[styles.countText, { color: ink }]}>
            {question.audience === "friends" ? "Friends only" : "Everyone"}
          </Text>
          <View style={styles.count}>
            <Ionicons name="people" size={18} color={ink} />
            <Text style={[styles.countText, { color: ink }]} testID="question-responses">
              {answered(question.responseCount)}
            </Text>
          </View>
        </View>
      </View>
      <View style={[styles.sealed, styles.glass, styles.mineSealed]}>
        <View style={[styles.lock, styles.lockOnGradient]}>
          <Ionicons name="lock-closed" size={20} color={colors.ink} />
        </View>
        <View style={styles.sealedText}>
          <Text style={styles.sealedTitle}>Your sealed answer</Text>
          <Text style={styles.mine} testID="my-answer">
            “{question.myAnswer?.body}”
          </Text>
          <Text style={styles.sealedBody}>Only you can see this.</Text>
        </View>
      </View>
      <Text style={styles.section}>Conversations from this question</Text>
      {mine.length > 0 ? (
        <View style={styles.list}>
          {mine.map((match, index) => (
            <Pressable
              key={match.id}
              accessibilityRole="button"
              onPress={() => router.navigate("/(tabs)/conversations")}
              style={[styles.listRow, index > 0 && styles.listRule]}>
              <Avatar
                uri={match.other?.avatarUrl ?? null}
                emoji={match.other?.avatarEmoji}
                name={match.other?.name ?? "?"}
                size={48}
              />
              <View style={styles.sealedText}>
                <Text variant="row">
                  {match.state === "revealed"
                    ? (match.other?.name ?? "Someone on Seal")
                    : match.state === "waiting"
                      ? "Waiting for them"
                      : "A match is waiting for you"}
                </Text>
                <Text variant="caption" soft>
                  Open in Conversations
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.ink3} />
            </Pressable>
          ))}
        </View>
      ) : (
        <Text variant="caption" soft style={styles.none}>
          None yet. We’ll let you know when someone’s answer meets yours.
        </Text>
      )}
    </ScrollView>
  );
}

export default function QuestionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const question = useQuery(api.questions.get, { questionId: id as Id<"questions"> });

  return (
    <QuestionScene question={question?.isMine ? null : question} variant="detail" testID="question-screen">
      <View style={styles.nav}>
        <IconButton icon="chevron-back" testID="question-back" label="Back" onPress={() => router.back()} />
        {question?.isMine ? (
          <>
            <Text style={styles.navTitle}>My question</Text>
            <View style={styles.navSpace} />
          </>
        ) : (
          <IconButton icon="ellipsis-horizontal" label="More" onPress={() => {}} />
        )}
      </View>
      {question === null ? (
        <View style={styles.missing}>
          <Text variant="title" style={styles.centered}>
            This question isn't here anymore.
          </Text>
        </View>
      ) : question?.isMine ? (
        <Mine question={question} />
      ) : question ? (
        <Body
          question={question}
          onAnswer={() => router.push({ pathname: "/compose/answer/[questionId]", params: { questionId: question.id } })}
        />
      ) : null}
    </QuestionScene>
  );
}

const styles = StyleSheet.create({
  nav: { height: 52, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  navTitle: { fontSize: 17, lineHeight: 22, fontWeight: "600" },
  navSpace: { width: 40 },
  mineCard: { height: 250, borderRadius: radius.feed, justifyContent: "flex-end", padding: 22, boxShadow: shadows.feed },
  mineFill: { borderRadius: radius.feed },
  mineQuestion: { fontSize: 27, lineHeight: 30, fontWeight: "700", letterSpacing: -0.8, marginBottom: 16 },
  mineMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  mineSealed: { marginTop: 14, marginBottom: 0 },
  section: { fontSize: 20, lineHeight: 25, fontWeight: "700", letterSpacing: -0.5, marginTop: 26, marginBottom: 12, marginHorizontal: 2 },
  list: { borderRadius: radius.list, backgroundColor: colors.white, boxShadow: shadows.card, overflow: "hidden" },
  listRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 16 },
  listRule: { borderTopWidth: 1, borderTopColor: colors.line },
  none: { marginLeft: 2 },
  missing: { flex: 1, alignItems: "center", justifyContent: "center" },
  centered: { textAlign: "center" },
  scroll: { flex: 1 },
  content: { paddingTop: 6, paddingBottom: space.lg },
  author: { flexDirection: "row", alignItems: "center", gap: 12 },
  name: { fontSize: 17, lineHeight: 22, fontWeight: "600" },
  ago: { fontSize: 14, lineHeight: 18, opacity: 0.82 },
  question: { fontSize: 36, lineHeight: 40, fontWeight: "700", letterSpacing: -1.15, marginTop: 20, marginBottom: 18 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { height: 36, paddingHorizontal: 15, borderRadius: radius.pill, justifyContent: "center" },
  tagText: { fontSize: 15, lineHeight: 20, fontWeight: "500" },
  glass: {
    backgroundColor: "rgba(255, 255, 255, 0.62)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
    boxShadow: shadows.card,
  },
  photoGlass: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.42)",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
  },
  sealed: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    borderRadius: radius.list,
    padding: 18,
    paddingLeft: 16,
    marginTop: 26,
    marginBottom: 16,
  },
  lock: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  lockOnPhoto: { backgroundColor: "rgba(255, 255, 255, 0.3)" },
  lockOnGradient: { backgroundColor: colors.white, boxShadow: shadows.card },
  sealedText: { flex: 1 },
  sealedTitle: { fontSize: 17, lineHeight: 22, fontWeight: "600", marginBottom: 4 },
  sealedBody: { fontSize: 14, lineHeight: 20, opacity: 0.86 },
  mine: { fontSize: 18, lineHeight: 24, fontWeight: "500", marginTop: 4, marginBottom: 8 },
  count: { flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 4 },
  countText: { fontSize: 16, lineHeight: 21, fontWeight: "500" },
  foot: { paddingTop: 10 },
  waiting: {
    height: 56,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  waitingOnPhoto: { backgroundColor: "rgba(255, 255, 255, 0.22)", borderColor: "rgba(255, 255, 255, 0.5)" },
  waitingOnGradient: { backgroundColor: "rgba(255, 255, 255, 0.6)", borderColor: colors.white },
});
