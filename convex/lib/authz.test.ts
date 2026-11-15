import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import schema from "../schema";
import { modules } from "../test.setup";
import { requireUser } from "./authz";

const alex = { tokenIdentifier: "https://clerk.test|user_alex" };
const sam = { tokenIdentifier: "https://clerk.test|user_sam" };

describe("requireUser", () => {
  test("rejects a caller with no identity", async () => {
    const t = convexTest(schema, modules);
    await expect(t.run((ctx) => requireUser(ctx))).rejects.toMatchObject({
      data: { code: "UNAUTHENTICATED" },
    });
  });

  test("rejects an authenticated caller who has no user row", async () => {
    const t = convexTest(schema, modules);
    await expect(t.withIdentity(alex).run((ctx) => requireUser(ctx))).rejects.toMatchObject({
      data: { code: "USER_NOT_FOUND" },
    });
  });

  test("resolves the caller's own row from ctx.auth and nobody else's", async () => {
    const t = convexTest(schema, modules);
    const [alexId, samId] = await t.run(async (ctx) => [
      await ctx.db.insert("users", { tokenIdentifier: alex.tokenIdentifier, phoneHmac: "a" }),
      await ctx.db.insert("users", { tokenIdentifier: sam.tokenIdentifier, phoneHmac: "b" }),
    ]);

    const asAlex = await t.withIdentity(alex).run((ctx) => requireUser(ctx));
    const asSam = await t.withIdentity(sam).run((ctx) => requireUser(ctx));

    expect(asAlex._id).toBe(alexId);
    expect(asSam._id).toBe(samId);
  });
});
