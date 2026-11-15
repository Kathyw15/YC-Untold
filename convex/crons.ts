import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily("publish the daily question", { hourUTC: 8, minuteUTC: 0 }, internal.daily.publish);

export default crons;
