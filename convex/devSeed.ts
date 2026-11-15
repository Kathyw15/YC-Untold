import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";

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
