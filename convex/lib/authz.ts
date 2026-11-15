import { ConvexError } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type Ctx = QueryCtx | MutationCtx;

export async function requireIdentity(ctx: Ctx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError({ code: "UNAUTHENTICATED" });
  return identity;
}

export function findUserByToken(ctx: Ctx, tokenIdentifier: string) {
  return ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
    .unique();
}

export async function requireUser(ctx: Ctx): Promise<Doc<"users">> {
  const identity = await requireIdentity(ctx);
  const user = await findUserByToken(ctx, identity.tokenIdentifier);
  if (!user) throw new ConvexError({ code: "USER_NOT_FOUND" });
  return user;
}
