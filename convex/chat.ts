import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./lib/authz";
import { otherParticipant, publicProfile } from "./lib/participants";

const MESSAGE_MAX_LENGTH = 2000;

export const list = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    const me = (await requireUser(ctx))._id;
    const conversation = await ctx.db.get(conversationId);
    if (!conversation) throw new ConvexError({ code: "NOT_FOUND" });
    const other = otherParticipant(conversation, me);

    const match = await ctx.db.get(conversation.matchId);
    const [entryA, entryB] = match
      ? await Promise.all([ctx.db.get(match.entryA), ctx.db.get(match.entryB)])
      : [null, null];
    const iAmA = conversation.userA === me;

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", conversationId))
      .collect();

    return {
      id: conversation._id,
      matchId: conversation.matchId,
      other: await publicProfile(ctx, other),
      expiresAt: conversation.expiresAt,
      closed: match?.status === "closed" || Date.now() >= conversation.expiresAt,
      opening: {
        mine: (iAmA ? entryA : entryB)?.body ?? "",
        theirs: (iAmA ? entryB : entryA)?.body ?? "",
      },
      messages: messages.map((message) => ({
        id: message._id,
        body: message.body,
        mine: message.senderId === me,
        sentAt: message._creationTime,
      })),
    };
  },
});

export const send = mutation({
  args: { conversationId: v.id("conversations"), body: v.string() },
  handler: async (ctx, args) => {
    const me = (await requireUser(ctx))._id;
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new ConvexError({ code: "NOT_FOUND" });
    otherParticipant(conversation, me);
    if (Date.now() >= conversation.expiresAt) throw new ConvexError({ code: "CHAT_CLOSED" });

    const body = args.body.trim();
    if (body.length === 0 || body.length > MESSAGE_MAX_LENGTH) {
      throw new ConvexError({ code: "INVALID_MESSAGE" });
    }
    await ctx.db.insert("chatMessages", { conversationId: args.conversationId, senderId: me, body });
    return null;
  },
});
