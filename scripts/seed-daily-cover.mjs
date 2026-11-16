#!/usr/bin/env node
// Uploads a photo to the Convex deployment in .env.local and sets it as the cover of today's question, so
// builds already installed show it without a rebuild. Run it after "npx convex run devSeed:resetDemo".
// Usage: node scripts/seed-daily-cover.mjs [file]
// Without a file it uploads assets/questions/daily.jpg, the cover bundled with the app.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const run = (name, args = {}) =>
  execFileSync("npx", ["convex", "run", name, JSON.stringify(args)], { encoding: "utf8" }).trim();

const file = process.argv[2] ?? "assets/questions/daily.jpg";
const response = await fetch(JSON.parse(run("devSeed:avatarUploadUrl")), {
  method: "POST",
  headers: { "Content-Type": file.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg" },
  body: readFileSync(file),
});
const { storageId } = await response.json();
run("devSeed:setDailyCover", { storageId });
console.log("Set the cover of today's question from " + file);
