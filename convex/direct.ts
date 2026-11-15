import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./lib/authz";
import { hmacPhone } from "./lib/phone";

const BODY_MAX_LENGTH = 2000;

export const create = mutation({
  args: { phone: v.string(), body: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const body = args.body.trim();
    if (body.length === 0 || body.length > BODY_MAX_LENGTH) throw new ConvexError({ code: "INVALID_BODY" });

    const phoneHmac = await hmacPhone(args.phone);
    if (phoneHmac === user.phoneHmac) throw new ConvexError({ code: "CANNOT_WRITE_TO_SELF" });
    const recipient = await ctx.db
      .query("users")
      .withIndex("by_phoneHmac", (q) => q.eq("phoneHmac", phoneHmac))
      .first();

    const entryId = await ctx.db.insert("sealedEntries", {
      kind: "direct",
      authorId: user._id,
      body,
      ...(recipient ? { recipientUserId: recipient._id } : { recipientPhoneHmac: phoneHmac }),
    });
    if (recipient) {
      await ctx.db.insert("notices", { userId: recipient._id, kind: "sealedReceived", refId: entryId });
      await ctx.scheduler.runAfter(0, internal.matching.onEntryCreated, { entryId });
    }
    return { id: entryId };
  },
});

export const listSent = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const entries = await ctx.db
      .query("sealedEntries")
      .withIndex("by_author", (q) => q.eq("authorId", user._id))
      .order("desc")
      .collect();
    const contacts = await ctx.db
      .query("contacts")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();

    return entries
      .filter((entry) => entry.kind === "direct")
      .map((entry) => ({
        id: entry._id,
        body: entry.body,
        createdAt: entry._creationTime,
        contactId:
          contacts.find((contact) =>
            entry.recipientUserId
              ? contact.matchedUserId === entry.recipientUserId
              : contact.phoneHmac === entry.recipientPhoneHmac,
          )?._id ?? null,
      }));
  },
});
