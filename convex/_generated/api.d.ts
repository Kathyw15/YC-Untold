/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as chat from "../chat.js";
import type * as contacts from "../contacts.js";
import type * as crons from "../crons.js";
import type * as daily from "../daily.js";
import type * as devSeed from "../devSeed.js";
import type * as direct from "../direct.js";
import type * as lib_authz from "../lib/authz.js";
import type * as lib_participants from "../lib/participants.js";
import type * as lib_phone from "../lib/phone.js";
import type * as matches from "../matches.js";
import type * as matching from "../matching.js";
import type * as notices from "../notices.js";
import type * as questions from "../questions.js";
import type * as seed from "../seed.js";
import type * as stickers from "../stickers.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  chat: typeof chat;
  contacts: typeof contacts;
  crons: typeof crons;
  daily: typeof daily;
  devSeed: typeof devSeed;
  direct: typeof direct;
  "lib/authz": typeof lib_authz;
  "lib/participants": typeof lib_participants;
  "lib/phone": typeof lib_phone;
  matches: typeof matches;
  matching: typeof matching;
  notices: typeof notices;
  questions: typeof questions;
  seed: typeof seed;
  stickers: typeof stickers;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
