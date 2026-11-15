import { ConvexError, v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { findUserByToken, requireIdentity, requireUser } from "./lib/authz";
import { hmacPhone } from "./lib/phone";

const NAME_MAX_LENGTH = 40;
const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

async function toProfile(ctx: QueryCtx, user: Pick<Doc<"users">, "_id" | "name" | "avatarId">) {
  return {
    id: user._id,
    name: user.name ?? null,
    avatarUrl: user.avatarId ? await ctx.storage.getUrl(user.avatarId) : null,
  };
}

export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await findUserByToken(ctx, identity.tokenIdentifier);
    return user ? await toProfile(ctx, user) : null;
  },
});

export const ensure = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const existing = await findUserByToken(ctx, identity.tokenIdentifier);
    if (existing) return await toProfile(ctx, existing);

    if (!identity.phoneNumber || identity.phoneNumberVerified !== true) {
      throw new ConvexError({ code: "PHONE_NOT_VERIFIED" });
    }
    const phoneHmac = await hmacPhone(identity.phoneNumber);

    const samePhone = await ctx.db
      .query("users")
      .withIndex("by_phoneHmac", (q) => q.eq("phoneHmac", phoneHmac))
      .first();
    if (samePhone) {
      await ctx.db.patch(samePhone._id, { tokenIdentifier: identity.tokenIdentifier });
      return await toProfile(ctx, samePhone);
    }

    const userId = await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      phoneHmac,
    });
    const waiting = await ctx.db
      .query("sealedEntries")
      .withIndex("by_recipientHmac", (q) => q.eq("recipientPhoneHmac", phoneHmac))
      .collect();
    for (const entry of waiting) {
      if (entry.recipientUserId !== undefined) continue;
      await ctx.db.patch(entry._id, { recipientUserId: userId });
      await ctx.db.insert("notices", { userId, kind: "sealedReceived", refId: entry._id });
    }
    return { id: userId, name: null, avatarUrl: null };
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    avatarId: v.optional(v.union(v.id("_storage"), v.null())),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const next = { _id: user._id, name: user.name, avatarId: user.avatarId };

    if (args.name !== undefined) {
      const name = args.name.trim().replace(/\s+/g, " ");
      if (name.length === 0 || name.length > NAME_MAX_LENGTH) {
        throw new ConvexError({ code: "INVALID_NAME" });
      }
      next.name = name;
    }

    if (args.avatarId !== undefined) {
      if (args.avatarId !== null) {
        const file = await ctx.db.system.get(args.avatarId);
        if (!file || !file.contentType?.startsWith("image/") || file.size > AVATAR_MAX_BYTES) {
          throw new ConvexError({ code: "INVALID_AVATAR" });
        }
      }
      if (user.avatarId && user.avatarId !== args.avatarId) {
        await ctx.storage.delete(user.avatarId);
      }
      next.avatarId = args.avatarId ?? undefined;
    }

    await ctx.db.patch(user._id, { name: next.name, avatarId: next.avatarId });
    return await toProfile(ctx, next);
  },
});

export const generateAvatarUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});
