import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { requireUser } from "./lib/authz";
import { otherParticipant, publicProfile } from "./lib/participants";

async function view(ctx: QueryCtx, sticker: Doc<"stickers">, me: Id<"users">) {
  const other = otherParticipant(sticker, me);
  const collectedAt = sticker.userA === me ? sticker.collectedByA : sticker.collectedByB;
  return {
    id: sticker._id,
    matchId: sticker.matchId,
    key: sticker.key ?? null,
    title: sticker.title ?? null,
    imageUrl: sticker.imageId ? await ctx.storage.getUrl(sticker.imageId) : null,
    collected: collectedAt !== undefined,
    createdAt: sticker._creationTime,
    other: await publicProfile(ctx, other),
  };
}

async function collectedBy(ctx: QueryCtx, me: Id<"users">) {
  const asA = await ctx.db
    .query("stickers")
    .withIndex("by_userA", (q) => q.eq("userA", me))
    .collect();
  const asB = await ctx.db
    .query("stickers")
    .withIndex("by_userB", (q) => q.eq("userB", me))
    .collect();
  return [...asA.filter((sticker) => sticker.collectedByA), ...asB.filter((sticker) => sticker.collectedByB)].sort(
    (a, b) => b._creationTime - a._creationTime,
  );
}

export const forMatch = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, { matchId }) => {
    const me = (await requireUser(ctx))._id;
    const sticker = await ctx.db
      .query("stickers")
      .withIndex("by_match", (q) => q.eq("matchId", matchId))
      .first();
    return sticker ? await view(ctx, sticker, me) : null;
  },
});

export const get = query({
  args: { stickerId: v.id("stickers") },
  handler: async (ctx, { stickerId }) => {
    const me = (await requireUser(ctx))._id;
    const sticker = await ctx.db.get(stickerId);
    if (!sticker) throw new ConvexError({ code: "NOT_FOUND" });
    const base = await view(ctx, sticker, me);

    const match = await ctx.db.get(sticker.matchId);
    const question = match?.questionId ? await ctx.db.get(match.questionId) : null;
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_userA", (q) => q.eq("userA", sticker.userA))
      .collect();
    return {
      ...base,
      type: match?.type ?? null,
      theme: match?.aiTheme ?? null,
      question: question?.text ?? null,
      conversationId: conversations.find((conversation) => conversation.matchId === sticker.matchId)?._id ?? null,
    };
  },
});

export const mine = query({
  args: {},
  handler: async (ctx) => {
    const me = (await requireUser(ctx))._id;
    return await Promise.all((await collectedBy(ctx, me)).map((sticker) => view(ctx, sticker, me)));
  },
});

export const withPerson = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const me = (await requireUser(ctx))._id;
    const shared = (await collectedBy(ctx, me)).filter((sticker) => otherParticipant(sticker, me) === userId);
    return await Promise.all(shared.map((sticker) => view(ctx, sticker, me)));
  },
});

export const collect = mutation({
  args: { stickerId: v.id("stickers") },
  handler: async (ctx, { stickerId }) => {
    const me = (await requireUser(ctx))._id;
    const sticker = await ctx.db.get(stickerId);
    if (!sticker) throw new ConvexError({ code: "NOT_FOUND" });
    otherParticipant(sticker, me);

    const iAmA = sticker.userA === me;
    if ((iAmA ? sticker.collectedByA : sticker.collectedByB) === undefined) {
      await ctx.db.patch(stickerId, iAmA ? { collectedByA: Date.now() } : { collectedByB: Date.now() });
    }
    return null;
  },
});
