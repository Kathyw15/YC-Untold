#!/usr/bin/env node
// Uploads the photos in assets/demo/avatars to the Convex deployment in .env.local and sets them as the
// avatars of the seeded friends that have one (see convex/demoCast.ts). Run it once per deployment, after
// "npx convex run devSeed:resetDemo". Usage: node scripts/seed-demo-avatars.mjs
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";

const run = (name, args = {}) =>
  execFileSync("npx", ["convex", "run", name, JSON.stringify(args)], { encoding: "utf8" }).trim();

for (const file of readdirSync("assets/demo/avatars")) {
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
