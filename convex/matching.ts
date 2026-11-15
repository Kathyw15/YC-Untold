import { v } from "convex/values";

import { internalAction } from "./_generated/server";

export const onEntryCreated = internalAction({
  args: { entryId: v.id("sealedEntries") },
  handler: async () => {},
});
