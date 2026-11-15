import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./lib/authz";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const notices = await ctx.db
      .query("notices")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
    return notices.map((notice) => ({
      id: notice._id,
      kind: notice.kind,
      createdAt: notice._creationTime,
      read: notice.readAt !== undefined,
    }));
  },
});

export const matchProposals = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const notices = await ctx.db
      .query("notices")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const proposals = [];
    for (const notice of notices) {
      if (notice.kind !== "matchProposed" || notice.readAt !== undefined || !notice.refId) continue;
      const match = await ctx.db.get(notice.refId as Id<"matches">);
      if (!match || match.status !== "pending") continue;
      const decided = await ctx.db
        .query("matchConsents")
        .withIndex("by_match_user", (q) => q.eq("matchId", match._id).eq("userId", user._id))
        .unique();
      if (decided) continue;
      proposals.push({ id: notice._id, matchId: match._id, type: match.type });
    }
    return proposals;
  },
});

export const markRead = mutation({
  args: { noticeIds: v.array(v.id("notices")) },
  handler: async (ctx, { noticeIds }) => {
    const user = await requireUser(ctx);
    const now = Date.now();
    for (const noticeId of noticeIds) {
      const notice = await ctx.db.get(noticeId);
      if (notice?.userId === user._id && notice.readAt === undefined) {
        await ctx.db.patch(noticeId, { readAt: now });
      }
    }
    return null;
  },
});
