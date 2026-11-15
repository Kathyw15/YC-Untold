import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./lib/authz";
import { hmacPhone } from "./lib/phone";

const SYNC_BATCH_MAX = 500;

export const sync = mutation({
  args: { phones: v.array(v.string()) },
  handler: async (ctx, { phones }) => {
    const user = await requireUser(ctx);
    if (phones.length > SYNC_BATCH_MAX) throw new ConvexError({ code: "BATCH_TOO_LARGE" });

    const existing = new Map(
      (
        await ctx.db
          .query("contacts")
          .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
          .collect()
      ).map((contact) => [contact.phoneHmac, contact]),
    );

    const synced = [];
    for (const phone of new Set(phones)) {
      const phoneHmac = await hmacPhone(phone);
      if (phoneHmac === user.phoneHmac) continue;
      const matched = await ctx.db
        .query("users")
        .withIndex("by_phoneHmac", (q) => q.eq("phoneHmac", phoneHmac))
        .first();
      const known = existing.get(phoneHmac);
      if (known && known.matchedUserId !== matched?._id) {
        await ctx.db.patch(known._id, { matchedUserId: matched?._id });
      }
      const contactId =
        known?._id ?? (await ctx.db.insert("contacts", { ownerId: user._id, phoneHmac, matchedUserId: matched?._id }));
      synced.push({ phone, contactId, onUntold: matched !== null });
    }
    return synced;
  },
});

export const listMatched = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const contacts = await ctx.db
      .query("contacts")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();
    const matched = [];
    for (const contact of contacts) {
      if (!contact.matchedUserId) continue;
      const person = await ctx.db.get(contact.matchedUserId);
      if (!person) continue;
      matched.push({
        contactId: contact._id,
        userId: person._id,
        name: person.name ?? null,
        avatarUrl: person.avatarId ? await ctx.storage.getUrl(person.avatarId) : null,
      });
    }
    return matched;
  },
});
