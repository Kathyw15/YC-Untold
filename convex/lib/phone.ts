import { ConvexError } from "convex/values";

const E164 = /^\+[1-9]\d{6,14}$/;

export async function hmacPhone(e164: string): Promise<string> {
  if (!E164.test(e164)) throw new ConvexError({ code: "INVALID_PHONE" });
  const pepper = process.env.PHONE_HMAC_PEPPER;
  if (!pepper) throw new Error("PHONE_HMAC_PEPPER is not set on this Convex deployment");
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(pepper),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(e164));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
