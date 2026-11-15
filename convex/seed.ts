import { internalMutation } from "./_generated/server";
import { publishDaily } from "./daily";

const SEEDS = [
  {
    name: "Maya",
    text: "Have you ever missed someone but felt too proud to reach out?",
    tags: ["relationships"],
    answer:
      "Yes. My brother and I stopped talking after our dad's birthday. I have typed the first line a dozen times and deleted it every time.",
  },
  {
    name: "Jonah",
    text: "Do people deserve second chances?",
    tags: ["forgiveness"],
    answer: "Yes, because I've made mistakes I wish I could undo, and someone once gave me room to try again.",
  },
  {
    name: "Iris",
    text: "What did you believe at nineteen that you no longer believe?",
    tags: ["growing up"],
    answer: "That being needed and being loved were the same thing. It took me years to tell them apart.",
  },
  {
    name: "Theo",
    text: "Where do you go when you need to feel like yourself again?",
    tags: ["everyday"],
    answer: "The long way home along the river, with my phone in my bag. Twenty minutes and I can hear myself think.",
  },
];

export const run = internalMutation({
  args: {},
  handler: async (ctx) => {
    await publishDaily(ctx);
    for (const seed of SEEDS) {
      const token = "seed:" + seed.name.toLowerCase();
      const existing = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", token))
        .unique();
      if (existing) continue;
      const authorId = await ctx.db.insert("users", { tokenIdentifier: token, phoneHmac: token, name: seed.name });
      const questionId = await ctx.db.insert("questions", {
        authorId,
        text: seed.text,
        tags: seed.tags,
        audience: "everyone",
        responseCount: 0,
        isDaily: false,
      });
      await ctx.db.insert("sealedEntries", { kind: "answer", authorId, body: seed.answer, questionId });
    }
    return null;
  },
});
