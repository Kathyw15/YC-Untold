# Seal

A place where the things you never said finally have somewhere to go.

Seal (first named Untold, which the repository, bundle identifier, and backend project still use) is an iOS app built with Expo (React Native, TypeScript, expo-router), Convex for the backend, Clerk for phone sign-in, and Revyl for cloud builds and devices.

## Run it

You need Node 22.13+ or 24, a Convex account with access to the "untold" project, and the Clerk publishable key.

```bash
npm install
cp .env.example .env.local   # then fill in EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
npx convex dev               # writes CONVEX_DEPLOYMENT and EXPO_PUBLIC_CONVEX_URL, pushes convex/, then watches it
npx convex run seed:run      # once per deployment: publishes today's question and four sample questions
```

Everyone shares one Convex dev deployment, and every "npx convex dev" push replaces all of its functions with the ones in your checkout. Push from an up-to-date main before a demo: an app that calls a function the deployment lacks closes on launch.

Sign in with a Clerk test number: any of +1 (201) 555-0100 to 555-0199, with the code 424242. No SMS is sent for these. The phone field is US-only (+1).

### Expo Go on your phone

```bash
npx expo start --go
```

Install Expo Go, put the phone on the same Wi-Fi as your computer, and scan the QR code. The "--go" flag matters: without it the QR code targets the development build, because expo-dev-client is installed. Everything in the app runs in Expo Go.

### Revyl cloud iPhone

Build a standalone Release app (JavaScript embedded, no Metro, no dev client) and start a device with it. Revyl does not upload .env.local, so pass the two public values at build time:

```bash
revyl build --profile preview --platform ios \
  --env EXPO_PUBLIC_CONVEX_URL=<url> --env EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=<key>
revyl device start --platform ios --build-version-id <id the build prints>
```

The build runs on Revyl's cloud, so no local Xcode is needed. It takes about 4 minutes with a warm cache. Rebuild after every change you want on the device. The preview profile sets EXPO_PUBLIC_DEMO_MODE=1 (see "Two accounts at once").

For hot reload instead, "revyl dev --platform ios" installs the development build and connects it to your local Metro server; rebuild that build with "revyl build --profile development --platform ios" after native dependencies change. Taps are sometimes dropped under "revyl dev", so use the Release build for demos.

### Two accounts at once

Sign in with a different test number on each device, for example 555-0100 on a Revyl iPhone and 555-0101 in Expo Go. Both devices must use the same Convex deployment.

With EXPO_PUBLIC_DEMO_MODE=1, People skips the contacts permission and loads sample contacts for the signed-in account: the other demo account (555-0100 is Chloe, 555-0101 is Kathy), that account's own circle of seeded friends, and a few people who are not on Seal. The circles are in convex/demoCast.ts. The Revyl preview profile sets the flag; for Expo Go, add EXPO_PUBLIC_DEMO_MODE=1 to .env.local and restart "npx expo start --go". Without the flag, a development build shows a "Load sample contacts (dev)" link instead, and any build can reach another account through "Write to a phone number".

To put the demo back to its starting state, run "npx convex run devSeed:resetDemo". It deletes everything people wrote and writes the seeded world again: eight friends, the Social feed, and for Chloe and for Kathy a history with those friends (closed and open conversations with stickers, Seals still waiting, questions asked and answered). Nothing is seeded between Chloe and Kathy, and no invitation is pending, so their own story starts fresh. The text is in convex/demoWorld.ts, and the timely feed questions are the TIMELY_QUESTIONS constant at its top: edit them and run the reset again. Run the reset before opening the apps. On a new deployment, also run "node scripts/seed-demo-avatars.mjs" once after the first reset to give the seeded friends their photos.

## Web demo

"scripts/publish-web.sh" exports the web build with demo mode on and force-pushes it to the gh-pages branch of chloezql/seal, which GitHub Pages serves at https://chloezql.github.io/seal/. The root is the landing page in web/landing: the app twice, side by side, each in its own iframe, with the two demo accounts. The app alone is under /app/. Set PAGES_REPO=owner/name to publish somewhere else; the base path follows the repository name.

The two iframes share an origin, so src/lib/demoFrame.ts gives each named frame (seal-left, seal-right) its own cookies and local storage. That is what lets each side hold its own Clerk session. It does nothing outside those frames.

## Environment variables

| Name | Where it lives | Purpose |
|---|---|---|
| EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY | .env.local, or "--env" on a Revyl build | Clerk publishable key for the app |
| EXPO_PUBLIC_CONVEX_URL | .env.local (written by Convex), or "--env" on a Revyl build | Convex deployment URL for the app |
| EXPO_PUBLIC_DEMO_MODE | .env.local, optional; set by the Revyl preview profile | "1" makes People load the sample contacts instead of the device's contacts |
| CONVEX_DEPLOYMENT | .env.local (written by Convex) | Which deployment "npx convex dev" targets |
| CLERK_JWT_ISSUER_DOMAIN | Convex ("npx convex env set") | Clerk Frontend API URL that Convex trusts |
| OPENAI_API_KEY | Convex | Used by the matching and sticker actions |
| OPENAI_STICKER_IMAGE_MODEL | Convex (optional) | Image model for conversation stickers, default gpt-image-1.5. It must support transparent backgrounds. |
| PHONE_HMAC_PEPPER | Convex | Secret for hashing phone numbers |
| OPENAI_MATCH_MODEL | Convex, optional | Model for matching (default gpt-5.4-mini) |
| MATCH_THRESHOLD | Convex, optional | Minimum score for an invitation (default 0.6) |
| CHAT_WINDOW_MS | Convex, optional | How long a conversation stays open once one of the two people opens it (default 24 hours) |

Secrets never go in the repository. .env.example lists names only.

## How sign-in works

1. The app collects a US phone number and a texted code with Clerk (custom screens in app/(auth)).
2. Convex receives Clerk's "convex" JWT template, which carries the verified phone number as the phone_number claim. The app always asks for that template; the default session token has no phone number.
3. On first entry the app calls users.ensure. Convex stores an HMAC-SHA256 of the phone number (never the number itself) and hands the new user any sealed entries that were left for that number.
4. A user without a name is sent to profile setup (name required, photo optional).

The Clerk instance needs phone sign-up and sign-in enabled, email and password disabled, and a JWT template named "convex" with these claims:

```json
{
  "aud": "convex",
  "phone_number": "{{user.primary_phone_number}}",
  "phone_number_verified": "{{user.phone_number_verified}}"
}
```

## Layout

```
app/                 expo-router routes
  (auth)/            phone, verify, profile-setup, onboarding
  (tabs)/            Home, People, Conversations, Profile (the tab bar's centre plus opens compose/question)
src/
  theme/             tokens, typography, background scenes
  components/        Atmosphere, Breathing, Rise, Text, BreathingButton, ...
  lib/               session state, phone formatting, auth error copy
convex/
  schema.ts          the full data model
  users.ts           me, ensure, updateProfile, generateAvatarUploadUrl
  lib/authz.ts       requireIdentity, requireUser
  lib/phone.ts       hmacPhone
assets/atmosphere/   out-of-focus nature backgrounds and film grain
.revyl/              Revyl project and build configuration
```

## Conventions

- Every public Convex function identifies the caller through ctx.auth (use requireUser), never through a client-supplied user id, and returns explicitly picked fields.
- Convex functions signal expected failures with ConvexError({ code }), for example UNAUTHENTICATED, USER_NOT_FOUND, INVALID_NAME.
- Screens sit on an Atmosphere scene and use the Text variants from src/theme/typography.ts: serif italic for emotional text, light sans for interface text. Colours come from src/theme/tokens.ts; wheat is the only warm accent and is reserved for reveals and countdowns.
- Slow motion only: Breathing for things that wait, Rise for things that arrive. No spinners, badges, or springs.
- Everything in the repository is written in English.

## Checks

```bash
npm run typecheck   # also runs in CI on every pull request
npm test            # Convex function tests (vitest + convex-test)
```
