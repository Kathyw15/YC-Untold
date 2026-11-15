import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";

import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { requireUser } from "./lib/authz";

const QUESTION_MAX_LENGTH = 240;
const ANSWER_MAX_LENGTH = 2000;
const TAG_MAX_LENGTH = 24;
const TAGS_MAX = 3;

function clean(text: string, maxLength: number, code: string) {
  const cleaned = text.trim();
  if (cleaned.length === 0 || cleaned.length > maxLength) throw new ConvexError({ code });
  return cleaned;
}

async function isFriend(ctx: QueryCtx, me: Doc<"users">, other: Doc<"users">) {
  const mineHoldTheirs = await ctx.db
    .query("contacts")
    .withIndex("by_phoneHmac", (q) => q.eq("phoneHmac", other.phoneHmac))
    .filter((q) => q.eq(q.field("ownerId"), me._id))
    .first();
  if (mineHoldTheirs) return true;
  const theirsHoldMine = await ctx.db
    .query("contacts")
    .withIndex("by_phoneHmac", (q) => q.eq("phoneHmac", me.phoneHmac))
    .filter((q) => q.eq(q.field("ownerId"), other._id))
    .first();
  return theirsHoldMine !== null;
}

async function loadVisibleAuthor(ctx: QueryCtx, me: Doc<"users">, question: Doc<"questions">) {
  const author = await ctx.db.get(question.authorId);
  if (!author) return null;
  if (question.audience === "everyone" || author._id === me._id) return author;
  return (await isFriend(ctx, me, author)) ? author : null;
}

function findMyEntry(ctx: QueryCtx, me: Doc<"users">, questionId: Id<"questions">) {
  return ctx.db
    .query("sealedEntries")
    .withIndex("by_question_author", (q) => q.eq("questionId", questionId).eq("authorId", me._id))
    .first();
}

async function toCard(
  ctx: QueryCtx,
  me: Doc<"users">,
  question: Doc<"questions">,
  author: Doc<"users">,
  myEntry: Doc<"sealedEntries"> | null,
) {
  return {
    id: question._id,
    text: question.text,
    tags: question.tags,
    audience: question.audience,
    isDaily: question.isDaily,
    createdAt: question._creationTime,
    responseCount: question.responseCount,
    author: question.isDaily
      ? null
      : {
          name: author.name ?? null,
          avatarUrl: author.avatarId ? await ctx.storage.getUrl(author.avatarId) : null,
        },
    isMine: author._id === me._id,
    hasAnswered: myEntry !== null,
  };
}

export const create = mutation({
  args: {
    text: v.string(),
    audience: v.union(v.literal("friends"), v.literal("everyone")),
    answer: v.string(),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const me = await requireUser(ctx);
    const text = clean(args.text, QUESTION_MAX_LENGTH, "INVALID_QUESTION");
    const body = clean(args.answer, ANSWER_MAX_LENGTH, "INVALID_ANSWER");
    const tags = (args.tags ?? []).slice(0, TAGS_MAX).map((tag) => clean(tag, TAG_MAX_LENGTH, "INVALID_TAG"));

    const questionId = await ctx.db.insert("questions", {
      authorId: me._id,
      text,
      tags,
      audience: args.audience,
      responseCount: 0,
      isDaily: false,
    });
    await ctx.db.insert("sealedEntries", { kind: "answer", authorId: me._id, body, questionId });
    return questionId;
  },
});

export const answer = mutation({
  args: { questionId: v.id("questions"), body: v.string() },
  handler: async (ctx, args) => {
    const me = await requireUser(ctx);
    const body = clean(args.body, ANSWER_MAX_LENGTH, "INVALID_ANSWER");
    const question = await ctx.db.get(args.questionId);
    if (!question || !(await loadVisibleAuthor(ctx, me, question))) {
      throw new ConvexError({ code: "QUESTION_NOT_FOUND" });
    }
    if (await findMyEntry(ctx, me, question._id)) throw new ConvexError({ code: "ALREADY_ANSWERED" });

    const entryId = await ctx.db.insert("sealedEntries", {
      kind: "answer",
      authorId: me._id,
      body,
      questionId: question._id,
    });
    await ctx.db.patch(question._id, { responseCount: question.responseCount + 1 });
    await ctx.scheduler.runAfter(0, internal.matching.onEntryCreated, { entryId });
    return null;
  },
});

export const today = query({
  args: {},
  handler: async (ctx) => {
    const me = await requireUser(ctx);
    const question = await ctx.db
      .query("questions")
      .withIndex("by_daily", (q) => q.eq("isDaily", true))
      .order("desc")
      .first();
    if (!question) return null;
    const author = await ctx.db.get(question.authorId);
    if (!author) return null;
    return await toCard(ctx, me, question, author, await findMyEntry(ctx, me, question._id));
  },
});

export const feed = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const me = await requireUser(ctx);
    const result = await ctx.db
      .query("questions")
      .order("desc")
      .filter((q) => q.eq(q.field("isDaily"), false))
      .paginate(args.paginationOpts);

    const page = [];
    for (const question of result.page) {
      const author = await loadVisibleAuthor(ctx, me, question);
      if (!author) continue;
      page.push(await toCard(ctx, me, question, author, await findMyEntry(ctx, me, question._id)));
    }
    return { ...result, page };
  },
});

export const get = query({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    const me = await requireUser(ctx);
    const question = await ctx.db.get(args.questionId);
    if (!question) return null;
    const author = await loadVisibleAuthor(ctx, me, question);
    if (!author) return null;
    const myEntry = await findMyEntry(ctx, me, question._id);
    return {
      ...(await toCard(ctx, me, question, author, myEntry)),
      myAnswer: myEntry ? { body: myEntry.body, createdAt: myEntry._creationTime } : null,
    };
  },
});

export const mine = query({
  args: {},
  handler: async (ctx) => {
    const me = await requireUser(ctx);
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_author", (q) => q.eq("authorId", me._id))
      .order("desc")
      .take(50);
    return await Promise.all(
      questions.map(async (question) => {
        const myEntry = await findMyEntry(ctx, me, question._id);
        return {
          id: question._id,
          text: question.text,
          tags: question.tags,
          audience: question.audience,
          createdAt: question._creationTime,
          responseCount: question.responseCount,
          myAnswer: myEntry?.body ?? null,
        };
      }),
    );
  },
});

export const myAnswers = query({
  args: {},
  handler: async (ctx) => {
    const me = await requireUser(ctx);
    const entries = await ctx.db
      .query("sealedEntries")
      .withIndex("by_author", (q) => q.eq("authorId", me._id))
      .order("desc")
      .take(100);

    const answers = [];
    for (const entry of entries) {
      if (entry.kind !== "answer" || !entry.questionId) continue;
      const question = await ctx.db.get(entry.questionId);
      if (!question || question.authorId === me._id) continue;
      const author = question.isDaily ? null : await ctx.db.get(question.authorId);
      answers.push({
        id: entry._id,
        body: entry.body,
        createdAt: entry._creationTime,
        question: {
          id: question._id,
          text: question.text,
          isDaily: question.isDaily,
          authorName: author?.name ?? null,
        },
      });
    }
    return answers;
  },
});
