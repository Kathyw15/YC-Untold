import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "edge-runtime",
    include: ["convex/**/*.test.ts", "src/**/*.test.ts"],
    server: { deps: { inline: ["convex-test"] } },
    env: { PHONE_HMAC_PEPPER: "test-pepper" },
  },
});
