import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { internalMutation, mutation, query, type QueryCtx } from "./_generated/server";
import { requireUser } from "./lib/authz";
import { otherParticipant, publicProfile } from "./lib/participants";

const DAY_MS = 24 * 60 * 60 * 1000;

function myConsent(ctx: QueryCtx, matchId: Id<"matches">, me: Id<"users">) {
  return ctx.db
    .query("matchConsents")
    .withIndex("by_match_user", (q) => q.eq("matchId", matchId).eq("userId", me))
    .unique();
}

async function stateFor(ctx: QueryCtx, match: Doc<"matches">, me: Id<"users">) {
  if (match.status !== "pending") return "revealed" as const;
  const decision = (await myConsent(ctx, match._id, me))?.decision;
  if (decision === "decline") return "declined" as const;
  if (Date.now() >= match.expiresAt) return "expired" as const;
  return decision === "accept" ? ("waiting" as const) : ("invited" as const);
}

async function conversationFor(ctx: QueryCtx, match: Doc<"matches">) {
  const conversations = await ctx.db
    .query("conversations")
    .withIndex("by_userA", (q) => q.eq("userA", match.userA))
    .collect();
  return conversations.find((conversation) => conversation.matchId === match._id) ?? null;
}

async function questionText(ctx: QueryCtx, match: Doc<"matches">) {
  return match.questionId ? ((await ctx.db.get(match.questionId))?.text ?? null) : null;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const me = (await requireUser(ctx))._id;
    const mine = [
      ...(await ctx.db
        .query("matches")
        .withIndex("by_userA", (q) => q.eq("userA", me))
        .collect()),
      ...(await ctx.db
        .query("matches")
        .withIndex("by_userB", (q) => q.eq("userB", me))
        .collect()),
    ].sort((a, b) => b._creationTime - a._creationTime);

    const visible = [];
    for (const match of mine) {
      const state = await stateFor(ctx, match, me);
      if (state === "declined" || state === "expired") continue;
      const conversation = state === "revealed" ? await conversationFor(ctx, match) : null;
      visible.push({
        id: match._id,
        type: match.type,
        state,
        question: await questionText(ctx, match),
        other: state === "revealed" ? await publicProfile(ctx, otherParticipant(match, me)) : null,
        conversation: conversation && { id: conversation._id, expiresAt: conversation.expiresAt },
      });
    }
    return visible;
  },
});

export const get = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, { matchId }) => {
    const me = (await requireUser(ctx))._id;
    const match = await ctx.db.get(matchId);
    if (!match) throw new ConvexError({ code: "NOT_FOUND" });
    const other = otherParticipant(match, me);
    const state = await stateFor(ctx, match, me);

    let revealed = null;
    if (state === "revealed") {
      const [entryA, entryB, conversation] = await Promise.all([
        ctx.db.get(match.entryA),
        ctx.db.get(match.entryB),
        conversationFor(ctx, match),
      ]);
      const iAmA = match.userA === me;
      revealed = {
        other: await publicProfile(ctx, other),
        mine: (iAmA ? entryA : entryB)?.body ?? "",
        theirs: (iAmA ? entryB : entryA)?.body ?? "",
        theme: match.aiTheme,
        conversation: conversation && { id: conversation._id, expiresAt: conversation.expiresAt },
      };
    }

    return {
      id: match._id,
      type: match.type,
      state,
      question: await questionText(ctx, match),
      revealed,
    };
  },
});

export const respond = mutation({
  args: {
    matchId: v.id("matches"),
    decision: v.union(v.literal("accept"), v.literal("decline")),
  },
  handler: async (ctx, { matchId, decision }) => {
    const me = (await requireUser(ctx))._id;
    const match = await ctx.db.get(matchId);
    if (!match) throw new ConvexError({ code: "NOT_FOUND" });
    const other = otherParticipant(match, me);
    if ((await stateFor(ctx, match, me)) !== "invited") return null;

    const now = Date.now();
    await ctx.db.insert("matchConsents", { matchId, userId: me, decision, decidedAt: now });
    if (decision === "decline") return null;

    const theirs = await myConsent(ctx, matchId, other);
    if (theirs?.decision !== "accept") return null;

    const expiresAt = now + (Number(process.env.CHAT_WINDOW_MS) || DAY_MS);
    await ctx.db.patch(matchId, { status: "revealed" });
    await ctx.db.insert("conversations", {
      matchId,
      userA: match.userA,
      userB: match.userB,
      openedAt: now,
      expiresAt,
    });
    await ctx.scheduler.runAt(expiresAt, internal.matches.close, { matchId });
    return null;
  },
});

export const close = internalMutation({
  args: { matchId: v.id("matches") },
  handler: async (ctx, { matchId }) => {
    await ctx.db.patch(matchId, { status: "closed" });
    return null;
  },
});
