# Untold

A place where the things you never said finally have somewhere to go.

Untold is an iOS app built with Expo (React Native, TypeScript, expo-router), Convex for the backend, Clerk for phone sign-in, and Revyl for cloud builds and devices.

## Run it

You need Node 22.13+ or 24, a Convex account with access to the "untold" project, and the Clerk publishable key.

```bash
npm install
cp .env.example .env.local   # then fill in EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
npx convex dev               # writes CONVEX_DEPLOYMENT and EXPO_PUBLIC_CONVEX_URL, then watches convex/
npx expo start               # in a second terminal
```

- **On your phone:** install Expo Go, then scan the QR code that "npx expo start" prints. Everything in the app runs in Expo Go.
- **On a Revyl cloud device:** run "revyl dev --platform ios". It installs the development build, connects it to your local Metro server, and opens a live viewer with hot reload.
- **Rebuild the development build** (only after native dependencies change): "revyl build --profile development --platform ios". The build runs on Revyl's cloud, so no local Xcode is needed.
- **Build a standalone Release app** (JavaScript embedded, no Metro and no dev client): "revyl build --profile preview --platform ios --env EXPO_PUBLIC_CONVEX_URL=<url> --env EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=<key>", then start a device with the build id it prints: "revyl device start --platform ios --app-id <app id> --build-version-id <id>".

Sign in with a Clerk test number: any of +1 (201) 555-0100 to 555-0199, with the code 424242. No SMS is sent for these. The phone field is US-only (+1).

## Environment variables

| Name | Where it lives | Purpose |
|---|---|---|
| EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY | .env.local | Clerk publishable key for the app |
| EXPO_PUBLIC_CONVEX_URL | .env.local (written by Convex) | Convex deployment URL for the app |
| CONVEX_DEPLOYMENT | .env.local (written by Convex) | Which deployment "npx convex dev" targets |
| CLERK_JWT_ISSUER_DOMAIN | Convex ("npx convex env set") | Clerk Frontend API URL that Convex trusts |
| OPENAI_API_KEY | Convex | Used by the matching and sticker actions |
| OPENAI_STICKER_IMAGE_MODEL | Convex (optional) | Image model for conversation stickers, default gpt-image-2 |
| PHONE_HMAC_PEPPER | Convex | Secret for hashing phone numbers |

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
