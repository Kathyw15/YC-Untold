import { v } from "convex/values";
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
