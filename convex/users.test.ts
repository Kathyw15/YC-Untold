import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import { hmacPhone } from "./lib/phone";
import schema from "./schema";
import { modules } from "./test.setup";

const alex = {
  tokenIdentifier: "https://clerk.test|user_alex",
  phoneNumber: "+12015550100",
  phoneNumberVerified: true,
};
const sam = {
  tokenIdentifier: "https://clerk.test|user_sam",
  phoneNumber: "+12015550101",
  phoneNumberVerified: true,
};

describe("users.ensure", () => {
  test("creates the caller's user once and stores only an HMAC of the phone", async () => {
    const t = convexTest(schema, modules);
    const asAlex = t.withIdentity(alex);

    const first = await asAlex.mutation(api.users.ensure, {});
    const second = await asAlex.mutation(api.users.ensure, {});

    expect(first).toEqual({ id: first.id, name: null, avatarUrl: null, onboarded: false });
    expect(second.id).toBe(first.id);
    const users = await t.run((ctx) => ctx.db.query("users").collect());
    expect(users).toHaveLength(1);
    expect(users[0].tokenIdentifier).toBe(alex.tokenIdentifier);
    expect(users[0].phoneHmac).toBe(await hmacPhone(alex.phoneNumber));
    expect(users[0].phoneHmac).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(users[0])).not.toContain("2015550100");
  });

  test("rejects a caller with no identity", async () => {
    const t = convexTest(schema, modules);
    await expect(t.mutation(api.users.ensure, {})).rejects.toMatchObject({
      data: { code: "UNAUTHENTICATED" },
    });
  });

  test("rejects a token without a verified phone number", async () => {
    const t = convexTest(schema, modules);
    await expect(
      t.withIdentity({ tokenIdentifier: alex.tokenIdentifier }).mutation(api.users.ensure, {}),
    ).rejects.toMatchObject({ data: { code: "PHONE_NOT_VERIFIED" } });
    await expect(
      t.withIdentity({ ...alex, phoneNumberVerified: false }).mutation(api.users.ensure, {}),
    ).rejects.toMatchObject({ data: { code: "PHONE_NOT_VERIFIED" } });
    expect(await t.run((ctx) => ctx.db.query("users").collect())).toHaveLength(0);
  });

  test("claims sealed entries left for the caller's phone and leaves a notice for each", async () => {
    const t = convexTest(schema, modules);
    const sender = await t.withIdentity(sam).mutation(api.users.ensure, {});
    const alexHmac = await hmacPhone(alex.phoneNumber);
    const [forAlex, forSomeoneElse] = await t.run(async (ctx) => [
      await ctx.db.insert("sealedEntries", {
        kind: "direct",
        authorId: sender.id,
        body: "I'm sorry I yelled at you.",
        recipientPhoneHmac: alexHmac,
      }),
      await ctx.db.insert("sealedEntries", {
        kind: "direct",
        authorId: sender.id,
        body: "For another number.",
        recipientPhoneHmac: await hmacPhone("+12015550102"),
      }),
    ]);

    const created = await t.withIdentity(alex).mutation(api.users.ensure, {});

    const { claimed, untouched, notices } = await t.run(async (ctx) => ({
      claimed: await ctx.db.get(forAlex),
      untouched: await ctx.db.get(forSomeoneElse),
      notices: await ctx.db.query("notices").collect(),
    }));
    expect(claimed?.recipientUserId).toBe(created.id);
    expect(untouched?.recipientUserId).toBeUndefined();
    expect(notices).toHaveLength(1);
    expect(notices[0]).toMatchObject({ userId: created.id, kind: "sealedReceived", refId: forAlex });
  });

  test("keeps one user per phone when the same number returns under a new token", async () => {
    const t = convexTest(schema, modules);
    const original = await t.withIdentity(alex).mutation(api.users.ensure, {});
    await t.withIdentity(alex).mutation(api.users.updateProfile, { name: "Alex" });

    const returning = await t
      .withIdentity({ ...alex, tokenIdentifier: "https://clerk.test|user_alex_again" })
      .mutation(api.users.ensure, {});

    expect(returning).toMatchObject({ id: original.id, name: "Alex" });
    expect(await t.run((ctx) => ctx.db.query("users").collect())).toHaveLength(1);
  });
});

describe("users.me", () => {
  test("is null for signed-out callers and for callers without a user row", async () => {
    const t = convexTest(schema, modules);
    expect(await t.query(api.users.me, {})).toBeNull();
    expect(await t.withIdentity(alex).query(api.users.me, {})).toBeNull();
  });

  test("returns only the caller's picked profile fields", async () => {
    const t = convexTest(schema, modules);
    const created = await t.withIdentity(alex).mutation(api.users.ensure, {});
    await t.withIdentity(sam).mutation(api.users.ensure, {});
    await t.withIdentity(sam).mutation(api.users.updateProfile, { name: "Sam" });

    const me = await t.withIdentity(alex).query(api.users.me, {});

    expect(me).toEqual({ id: created.id, name: null, avatarUrl: null, onboarded: false });
  });
});

describe("users.updateProfile", () => {
  test("requires a user row", async () => {
    const t = convexTest(schema, modules);
    await expect(t.mutation(api.users.updateProfile, { name: "Alex" })).rejects.toMatchObject({
      data: { code: "UNAUTHENTICATED" },
    });
    await expect(
      t.withIdentity(alex).mutation(api.users.updateProfile, { name: "Alex" }),
    ).rejects.toMatchObject({ data: { code: "USER_NOT_FOUND" } });
  });

  test("normalises the name and changes only the caller's row", async () => {
    const t = convexTest(schema, modules);
    await t.withIdentity(alex).mutation(api.users.ensure, {});
    await t.withIdentity(sam).mutation(api.users.ensure, {});

    const updated = await t.withIdentity(alex).mutation(api.users.updateProfile, { name: "  Alex   Chen " });

    expect(updated.name).toBe("Alex Chen");
    expect((await t.withIdentity(sam).query(api.users.me, {}))?.name).toBeNull();
  });

  test("rejects an empty or overlong name", async () => {
    const t = convexTest(schema, modules);
    const asAlex = t.withIdentity(alex);
    await asAlex.mutation(api.users.ensure, {});

    await expect(asAlex.mutation(api.users.updateProfile, { name: "   " })).rejects.toMatchObject({
      data: { code: "INVALID_NAME" },
    });
    await expect(asAlex.mutation(api.users.updateProfile, { name: "a".repeat(41) })).rejects.toMatchObject({
      data: { code: "INVALID_NAME" },
    });
  });

  test("accepts an uploaded image as the avatar, rejects other files, and can clear it", async () => {
    const t = convexTest(schema, modules);
    const asAlex = t.withIdentity(alex);
    await asAlex.mutation(api.users.ensure, {});
    const [image, text] = await t.run(async (ctx) => [
      await ctx.storage.store(new Blob(["png"], { type: "image/png" })),
      await ctx.storage.store(new Blob(["hello"], { type: "text/plain" })),
    ]);

    await expect(asAlex.mutation(api.users.updateProfile, { avatarId: text })).rejects.toMatchObject({
      data: { code: "INVALID_AVATAR" },
    });
    const withAvatar = await asAlex.mutation(api.users.updateProfile, { name: "Alex", avatarId: image });
    expect(withAvatar.avatarUrl).toEqual(expect.any(String));

    const cleared = await asAlex.mutation(api.users.updateProfile, { avatarId: null });
    expect(cleared).toMatchObject({ name: "Alex", avatarUrl: null });
    expect(await t.run((ctx) => ctx.storage.getUrl(image))).toBeNull();
  });
});
