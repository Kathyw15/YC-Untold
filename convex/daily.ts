import { internalMutation, type MutationCtx } from "./_generated/server";

const SYSTEM_TOKEN = "system:untold";

const DAILY_BANK = [
  "What's something you wish people understood about you?",
  "What would your younger self think of you today?",
  "What's a small thing that instantly makes your day better?",
  "Who do you think about more often than they would guess?",
  "What's a weird opinion you'll defend forever?",
  "What did you almost say this week, and then didn't?",
  "What's a place you keep returning to in your mind?",
  "When did someone's kindness catch you off guard?",
  "What are you quietly proud of that nobody has noticed?",
  "What's an apology you are still waiting for, or still owe?",
  "What do you miss about a version of yourself you left behind?",
  "What's a question you wish someone would ask you?",
  "What made you laugh harder than it should have?",
  "What are you learning to let go of?",
];

export async function publishDaily(ctx: MutationCtx) {
  const now = Date.now();
  const dailyDate = new Date(now).toISOString().slice(0, 10);
  const existing = await ctx.db
    .query("questions")
    .withIndex("by_daily", (q) => q.eq("isDaily", true).eq("dailyDate", dailyDate))
    .first();
  if (existing) return existing._id;

  const system = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", SYSTEM_TOKEN))
    .unique();
  const authorId =
    system?._id ??
    (await ctx.db.insert("users", { tokenIdentifier: SYSTEM_TOKEN, phoneHmac: SYSTEM_TOKEN, name: "Untold" }));

  return await ctx.db.insert("questions", {
    authorId,
    text: DAILY_BANK[Math.floor(now / 86_400_000) % DAILY_BANK.length],
    tags: [],
    audience: "everyone",
    responseCount: 0,
    isDaily: true,
    dailyDate,
  });
}

export const publish = internalMutation({
  args: {},
  handler: async (ctx) => {
    await publishDaily(ctx);
    return null;
  },
});
