import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    phoneHmac: v.string(),
    name: v.optional(v.string()),
    avatarId: v.optional(v.id("_storage")),
    pushToken: v.optional(v.string()),
    onboardedAt: v.optional(v.number()),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_phoneHmac", ["phoneHmac"]),

  contacts: defineTable({
    ownerId: v.id("users"),
    phoneHmac: v.string(),
    matchedUserId: v.optional(v.id("users")),
  })
    .index("by_owner", ["ownerId"])
    .index("by_phoneHmac", ["phoneHmac"]),

  questions: defineTable({
    authorId: v.id("users"),
    text: v.string(),
    tags: v.array(v.string()),
    audience: v.union(v.literal("friends"), v.literal("everyone")),
    responseCount: v.number(),
    isDaily: v.boolean(),
    dailyDate: v.optional(v.string()),
  })
    .index("by_author", ["authorId"])
    .index("by_audience_time", ["audience"])
    .index("by_daily", ["isDaily", "dailyDate"]),

  sealedEntries: defineTable({
    kind: v.union(v.literal("direct"), v.literal("answer")),
    authorId: v.id("users"),
    body: v.string(),
    recipientUserId: v.optional(v.id("users")),
    recipientPhoneHmac: v.optional(v.string()),
    questionId: v.optional(v.id("questions")),
  })
    .index("by_author", ["authorId"])
    .index("by_recipient", ["recipientUserId"])
    .index("by_recipientHmac", ["recipientPhoneHmac"])
    .index("by_question_author", ["questionId", "authorId"]),

  matches: defineTable({
    type: v.union(v.literal("direct"), v.literal("social")),
    userA: v.id("users"),
    userB: v.id("users"),
    entryA: v.id("sealedEntries"),
    entryB: v.id("sealedEntries"),
    questionId: v.optional(v.id("questions")),
    aiScore: v.number(),
    aiTheme: v.string(),
    status: v.union(v.literal("pending"), v.literal("revealed"), v.literal("closed")),
    expiresAt: v.number(),
  })
    .index("by_userA", ["userA"])
    .index("by_userB", ["userB"])
    .index("by_entries", ["entryA", "entryB"]),

  matchConsents: defineTable({
    matchId: v.id("matches"),
    userId: v.id("users"),
    decision: v.union(v.literal("accept"), v.literal("decline")),
    decidedAt: v.number(),
  }).index("by_match_user", ["matchId", "userId"]),

  conversations: defineTable({
    matchId: v.id("matches"),
    userA: v.id("users"),
    userB: v.id("users"),
    openedAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_userA", ["userA"])
    .index("by_userB", ["userB"]),

  stickers: defineTable({
    matchId: v.id("matches"),
    userA: v.id("users"),
    userB: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("ready"), v.literal("failed")),
    title: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    collectedByA: v.optional(v.number()),
    collectedByB: v.optional(v.number()),
  })
    .index("by_match", ["matchId"])
    .index("by_userA", ["userA"])
    .index("by_userB", ["userB"]),

  chatMessages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    body: v.string(),
  }).index("by_conversation", ["conversationId"]),

  notices: defineTable({
    userId: v.id("users"),
    kind: v.union(v.literal("sealedReceived"), v.literal("matchProposed")),
    refId: v.optional(v.union(v.id("sealedEntries"), v.id("matches"))),
    readAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),
});
