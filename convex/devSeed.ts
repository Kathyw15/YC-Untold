import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";
import { publishDaily } from "./daily";
import { CAST } from "./demoCast";
import { DAILY_QUESTION, FEED, OWNERS } from "./demoWorld";
import { hmacPhone } from "./lib/phone";
import { pickSticker } from "./stickerSet";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export const directPair = internalMutation({
  args: {
    userA: v.id("users"),
    userB: v.id("users"),
    textA: v.optional(v.string()),
    textB: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const entryA = await ctx.db.insert("sealedEntries", {
      kind: "direct",
      authorId: args.userA,
      recipientUserId: args.userB,
      body: args.textA ?? "I'm sorry I yelled at you.",
    });
    const entryB = await ctx.db.insert("sealedEntries", {
      kind: "direct",
      authorId: args.userB,
      recipientUserId: args.userA,
      body: args.textB ?? "I don't want to fight anymore.",
    });
    await ctx.scheduler.runAfter(0, internal.matching.onEntryCreated, { entryId: entryA });
    await ctx.scheduler.runAfter(0, internal.matching.onEntryCreated, { entryId: entryB });
    return { entryA, entryB };
  },
});

export const socialPair = internalMutation({
  args: {
    author: v.id("users"),
    respondent: v.id("users"),
    question: v.optional(v.string()),
    authorAnswer: v.optional(v.string()),
    respondentAnswer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const questionId = await ctx.db.insert("questions", {
      authorId: args.author,
      text: args.question ?? "Have you ever missed someone but felt too proud to reach out?",
      tags: [],
      audience: "everyone",
      responseCount: 1,
      isDaily: false,
    });
    const entryA = await ctx.db.insert("sealedEntries", {
      kind: "answer",
      authorId: args.author,
      questionId,
      body: args.authorAnswer ?? "Yes. My brother. I keep writing the text and then deleting it.",
    });
    const entryB = await ctx.db.insert("sealedEntries", {
      kind: "answer",
      authorId: args.respondent,
      questionId,
      body:
        args.respondentAnswer ?? "All the time. I'd rather they think I'm fine than find out I still think about them.",
    });
    await ctx.scheduler.runAfter(0, internal.matching.onEntryCreated, { entryId: entryA });
    await ctx.scheduler.runAfter(0, internal.matching.onEntryCreated, { entryId: entryB });
    return { questionId, entryA, entryB };
  },
});

// Puts the shared deployment back to the demo's starting state: everything people wrote is deleted, then the
// seeded friends, the Social feed and each demo account's own history (see demoWorld.ts) are written again.
// Chloe and Kathy never share any of it, so their own story starts fresh. It creates no invitations and no
// notices, so no match popup shows on launch.
export const resetDemo = internalMutation({
  args: {},
  handler: async (ctx) => {
    for (const table of [
      "chatMessages",
      "conversations",
      "stickers",
      "matchConsents",
      "matches",
      "notices",
      "sealedEntries",
      "contacts",
    ] as const) {
      for (const doc of await ctx.db.query(table).collect()) await ctx.db.delete(doc._id);
    }
    for (const question of await ctx.db.query("questions").collect()) {
      if (question.isDaily) await ctx.db.patch(question._id, { responseCount: 0 });
      else await ctx.db.delete(question._id);
    }
    await ctx.db.patch(await publishDaily(ctx), { text: DAILY_QUESTION });

    const now = Date.now();
    const people = new Map<string, Id<"users">>();
    for (const person of [...CAST, ...OWNERS]) {
      const phoneHmac = await hmacPhone(person.phone);
      const existing =
        (await ctx.db
          .query("users")
          .withIndex("by_phoneHmac", (q) => q.eq("phoneHmac", phoneHmac))
          .first()) ??
        (await ctx.db
          .query("users")
          .withIndex("by_token", (q) => q.eq("tokenIdentifier", "seed:" + person.key))
          .first());
      if (!existing) {
        people.set(
          person.key,
          await ctx.db.insert("users", {
            tokenIdentifier: "seed:" + person.key,
            phoneHmac,
            name: person.name,
            onboardedAt: now,
            ...("emoji" in person && person.emoji ? { avatarEmoji: person.emoji } : {}),
          }),
        );
        continue;
      }
      people.set(person.key, existing._id);
      if ("contactName" in person) {
        await ctx.db.patch(existing._id, { phoneHmac, name: person.name, avatarEmoji: person.emoji, onboardedAt: now });
      }
    }

    // The feed lists the newest question first, so write the oldest first.
    for (const owner of OWNERS) {
      const authorId = people.get(owner.key)!;
      for (const asked of owner.asked) {
        const questionId = await ctx.db.insert("questions", {
          authorId,
          text: asked.text,
          tags: asked.tags,
          audience: "everyone",
          responseCount: asked.responses,
          isDaily: false,
          gradient: asked.text.length % 5,
        });
        await ctx.db.insert("sealedEntries", { kind: "answer", authorId, body: asked.answer, questionId });
      }
    }
    const feed = new Map<string, { questionId: Id<"questions">; answerId: Id<"sealedEntries">; responses: number }>();
    for (const [index, question] of [...FEED].reverse().entries()) {
      const authorId = people.get(question.by)!;
      const questionId = await ctx.db.insert("questions", {
        authorId,
        text: question.text,
        tags: question.tags,
        audience: "everyone",
        responseCount: question.responses,
        isDaily: false,
        gradient: index % 5,
        photo: question.photo,
      });
      const answerId = await ctx.db.insert("sealedEntries", {
        kind: "answer",
        authorId,
        body: question.answer,
        questionId,
      });
      feed.set(question.key, { questionId, answerId, responses: question.responses });
    }

    for (const owner of OWNERS) {
      const me = people.get(owner.key)!;

      const answer = async (key: string, body: string) => {
        const question = feed.get(key)!;
        question.responses += 1;
        await ctx.db.patch(question.questionId, { responseCount: question.responses });
        return await ctx.db.insert("sealedEntries", {
          kind: "answer",
          authorId: me,
          body,
          questionId: question.questionId,
        });
      };

      for (const seal of owner.waiting) {
        const recipient = people.get(seal.to);
        await ctx.db.insert("sealedEntries", {
          kind: "direct",
          authorId: me,
          body: seal.body,
          ...(recipient ? { recipientUserId: recipient } : { recipientPhoneHmac: await hmacPhone(seal.to) }),
        });
      }
      for (const answered of owner.answered) await answer(answered.question, answered.body);

      for (const talk of owner.talks) {
        const friend = people.get(talk.with)!;
        const question = talk.question ? feed.get(talk.question)! : null;
        const entryA = question
          ? await answer(talk.question!, talk.mine)
          : await ctx.db.insert("sealedEntries", {
              kind: "direct",
              authorId: me,
              recipientUserId: friend,
              body: talk.mine,
            });
        const entryB = question
          ? question.answerId
          : await ctx.db.insert("sealedEntries", {
              kind: "direct",
              authorId: friend,
              recipientUserId: me,
              body: talk.theirs ?? "",
            });
        const matchId = await ctx.db.insert("matches", {
          type: question ? "social" : "direct",
          userA: me,
          userB: friend,
          entryA,
          entryB,
          ...(question ? { questionId: question.questionId } : {}),
          aiScore: 0.86,
          aiTheme: talk.theme,
          status: talk.open ? "revealed" : "closed",
          expiresAt: now + 7 * DAY_MS,
        });
        const openedAt = talk.open ? now - 5 * HOUR_MS : now - 3 * DAY_MS;
        const conversationId = await ctx.db.insert("conversations", {
          matchId,
          userA: me,
          userB: friend,
          openedAt,
          expiresAt: openedAt + DAY_MS,
        });
        for (const [from, body] of talk.chat) {
          await ctx.db.insert("chatMessages", { conversationId, senderId: from === "me" ? me : friend, body });
        }

        await ctx.db.insert("stickers", {
          matchId,
          userA: me,
          userB: friend,
          status: "ready",
          ...pickSticker(talk.theme, talk.mine),
          collectedByA: now,
          collectedByB: now,
        });
      }
    }
    return null;
  },
});

// scripts/seed-daily-cover.mjs gives today's question its cover with this, after an upload through
// avatarUploadUrl. The image is served from storage, so builds already installed show it.
export const setDailyCover = internalMutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    await ctx.db.patch(await publishDaily(ctx), { imageId: storageId });
    return null;
  },
});

// The two steps scripts/seed-demo-avatars.mjs uses to give the seeded friends and the two demo accounts their
// photos. A reset leaves avatars alone, so they are set once per deployment.
export const avatarUploadUrl = internalMutation({
  args: {},
  handler: async (ctx) => await ctx.storage.generateUploadUrl(),
});

export const setAvatar = internalMutation({
  args: { key: v.string(), storageId: v.id("_storage") },
  handler: async (ctx, { key, storageId }) => {
    const person = [...CAST, ...OWNERS].find((member) => member.key === key);
    if (!person) throw new Error("Nobody in the demo world is called " + key);
    const phoneHmac = await hmacPhone(person.phone);
    const user = await ctx.db
      .query("users")
      .withIndex("by_phoneHmac", (q) => q.eq("phoneHmac", phoneHmac))
      .first();
    if (!user) throw new Error("Run devSeed:resetDemo first");
    await ctx.db.patch(user._id, { avatarId: storageId });
    return null;
  },
});
