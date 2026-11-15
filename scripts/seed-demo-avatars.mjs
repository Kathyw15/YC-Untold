#!/usr/bin/env node
// Uploads photos to the Convex deployment in .env.local and sets them as avatars of the demo world's people.
// Each file is named after a person's key in convex/demoCast.ts or convex/demoWorld.ts (maya.jpg, chloe.jpg).
// Run it once per deployment, after "npx convex run devSeed:resetDemo"; a reset keeps the avatars.
// Usage: node scripts/seed-demo-avatars.mjs [--dir <folder>] [key ...]
// Without --dir it reads assets/demo/avatars, the seeded friends' photos. The two demo accounts' own
// photos are personal and stay out of this repository: keep them in a folder elsewhere and pass --dir.
// With keys (for example "maya jordan"), only those people's photos are uploaded.
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

const run = (name, args = {}) =>
  execFileSync("npx", ["convex", "run", name, JSON.stringify(args)], { encoding: "utf8" }).trim();

const args = process.argv.slice(2);
const dir = args[0] === "--dir" ? args.splice(0, 2)[1] : "assets/demo/avatars";
for (const file of readdirSync(dir)) {
  const extension = extname(file).toLowerCase();
  const key = file.slice(0, -extension.length);
  if (![".jpg", ".jpeg", ".png"].includes(extension) || (args.length > 0 && !args.includes(key))) continue;
  const uploadUrl = JSON.parse(run("devSeed:avatarUploadUrl"));
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": extension === ".png" ? "image/png" : "image/jpeg" },
    body: readFileSync(join(dir, file)),
  });
  const { storageId } = await response.json();
  run("devSeed:setAvatar", { key, storageId });
  console.log("Set the avatar of " + key);
}
