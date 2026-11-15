#!/usr/bin/env node
// Uploads the photos in assets/demo/avatars to the Convex deployment in .env.local and sets them as the
// avatars of the seeded friends that have one (see convex/demoCast.ts). Run it once per deployment, after
// "npx convex run devSeed:resetDemo". Usage: node scripts/seed-demo-avatars.mjs [key ...]
// With keys (for example "maya jordan"), only those friends' photos are uploaded.
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";

const run = (name, args = {}) =>
  execFileSync("npx", ["convex", "run", name, JSON.stringify(args)], { encoding: "utf8" }).trim();

const only = process.argv.slice(2);
for (const file of readdirSync("assets/demo/avatars")) {
  if (only.length > 0 && !only.includes(file.replace(".jpg", ""))) continue;
  const uploadUrl = JSON.parse(run("devSeed:avatarUploadUrl"));
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "image/jpeg" },
    body: readFileSync("assets/demo/avatars/" + file),
  });
  const { storageId } = await response.json();
  run("devSeed:setAvatar", { key: file.replace(".jpg", ""), storageId });
  console.log("Set the avatar of " + file.replace(".jpg", ""));
}
