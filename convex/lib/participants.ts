import { ConvexError } from "convex/values";
import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

export function otherParticipant(pair: { userA: Id<"users">; userB: Id<"users"> }, me: Id<"users">) {
  if (pair.userA === me) return pair.userB;
  if (pair.userB === me) return pair.userA;
  throw new ConvexError({ code: "FORBIDDEN" });
}

export async function publicProfile(ctx: QueryCtx, userId: Id<"users">) {
  const user = await ctx.db.get(userId);
  return {
    id: userId,
    name: user?.name ?? null,
    avatarUrl: user?.avatarId ? await ctx.storage.getUrl(user.avatarId) : null,
  };
}
