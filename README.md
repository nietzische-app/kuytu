# Kuytu

A premium, web-based dating **PWA** tailored for mature adults (35–55). Elegant,
uncluttered, dark-mode-first, and trustworthy.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** — custom Kuytu design tokens
- **Framer Motion** — swipe gestures & transitions
- **Lucide React** — icons
- **Prisma + PostgreSQL** — data layer (users, swipes, matches, messages)
- **Uploadthing** — real image uploads for the profile Photo Manager

## Getting started

```bash
npm install
cp .env.example .env        # set DATABASE_URL to your Postgres instance
npm run db:migrate          # apply the schema
npm run db:seed             # load demo users (incl. demo@kuytu.app)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/discover`.

### Database scripts

| Script              | Purpose                                            |
| ------------------- | -------------------------------------------------- |
| `npm run db:migrate`| Create/apply a dev migration (`prisma migrate dev`)|
| `npm run db:deploy` | Apply migrations in CI/prod (`migrate deploy`)     |
| `npm run db:seed`   | Seed demo users + a pending like                   |
| `npm run db:studio` | Open Prisma Studio                                 |
| `npm run gen:icons` | Regenerate the PWA icons under `public/icons/`      |

## Design system — "Sıcak Sığınak & Loş Kemer"

A bright, clean, mature light theme for the 35–55 audience. The signature motif
is *cozy sanctuary & arch*: soft vaulted arches (`rounded-t-[2.75rem]`) on cards,
modals and profile frames; warm champagne **ambient-glow** avatar rings
(`ring-2 ring-kuytu-accent/50 shadow-[0_0_12px_rgba(212,163,115,0.3)]`); a
floating **glassmorphism action dock** (Pas · Geri Al · Kıvılcım · Beğen) that
lifts off the photo; and a rounded icon set (`Sparkles`, `Heart`, `RotateCcw`,
`X`, `ShieldCheck`, `MessageCircleHeart`). Defined in `tailwind.config.ts` and
`app/globals.css`.

### Typography (`next/font/google`)

- **Plus Jakarta Sans** (`--font-jakarta`) throughout — extra-bold for
  headlines/titles, crisp for body, buttons, and message bubbles. (`font-serif`
  is kept as a legacy alias mapped to Jakarta.)

### Color tokens

| Token           | Hex       | Use                                              |
| --------------- | --------- | ------------------------------------------------ |
| `kuytu-bg`      | `#FAFAFA` | Soft off-white canvas (`.soft` `#F4F3F1`, `.deep` `#ECEBE8`) |
| `kuytu-card`    | `#FFFFFF` | Pure-white cards / surfaces (`.raised` `#F7F7F8`) |
| `kuytu-border`  | `#E5E7EB` | Thin light borders / dividers                    |
| `kuytu-text`    | `#18181B` | Deep charcoal — headers & primary (`.muted` `#71717A`) |
| `kuytu-accent`  | `#D4A373` | Champagne gold — active tabs, rings, badges (`.soft` `#E5B880`, `.deep` `#B8895A`) |

Action tokens: `kuytu-pass` (`#F0576F`), `kuytu-like` (`#22B07D`),
`kuytu-super` (`#3E90E0`). Soft elevation shadows (`shadow-card`, `shadow-soft`,
`shadow-nav`), a champagne `bg-grad-gold`, a `photo-scrim` overlay, and a
`.glass` utility round out the system. Legacy dark aliases (`kuytu-gold`,
`kuytu-rose`, `kuytu-black`, `kuytu-burgundy`, `kuytu-bg-deep`) are repointed to
the light palette so older class names keep working.

## Project structure

```
app/
  layout.tsx              Root layout, fonts, PWA metadata
  manifest.ts             PWA web manifest
  page.tsx                Redirects to /discover
  (app)/
    layout.tsx            Mobile shell + bottom nav
    discover/page.tsx     Keşfet — "recommended" card stack (image_4)
    people/page.tsx       Kişiler — immersive full-card deck (image_3)
    liked-you/page.tsx    Beğenenler — who liked you + Spotlight upsell (image_2)
    chats/page.tsx        Sohbetler — matches + recent conversations (image_1)
    chats/[matchId]/      Chat screen (women-first composer)
    matches/page.tsx      Eşleşmeler — same hub (not in nav)
    profile/page.tsx      Profil — switcher + editor
    profile/PhotoManager.tsx  6-slot photo grid (Uploadthing upload/reorder)
  api/
    discover/route.ts               GET nearby, unseen, compatible profiles
    swipe/route.ts                  POST a swipe; mints a Match on a mutual like
    liked-you/route.ts              GET profiles who liked the current user
    matches/route.ts                GET grouped matches (new + conversations)
    matches/[matchId]/messages/     GET history · POST send (women-first)
    me/route.ts                     GET/PATCH the current user's profile
    auth/switch/route.ts            POST demo identity switch (sets cookie)
    uploadthing/core.ts             Uploadthing file router (profileImage)
    uploadthing/route.ts            Uploadthing GET/POST handlers
components/
  SwipeCard.tsx           Draggable white profile card (Framer Motion)
  CardStack.tsx           Stack orchestration, rewind, empty state
  ActionButtons.tsx       Floating Pass / Super / Like / Rewind buttons
  PeopleDeck.tsx          Immersive full-card deck (star / heart actions)
  LikedYou.tsx            "Liked you" grid + like-back + Spotlight upsell
  MatchModal.tsx          "Eşleşme Sağlandı!" + 48h countdown
  MatchesHub.tsx          Your matches row + recent conversations list
  ChatRoom.tsx            Chat screen with women-first composer lock
  CountdownBadge.tsx      Compact first-move countdown pill
  ProfileScreen.tsx       Demo switcher + bio/intention/photo editor
  BottomNav.tsx           Profil · Keşfet · Kişiler · Beğenenler · Sohbetler
  ProfileBadges.tsx       Niyet / Çocuk Durumu / Doğrulanmış pills
  ComingSoon.tsx          Placeholder tab content
lib/
  prisma.ts               PrismaClient singleton
  auth.ts                 getCurrentUser() + demo account list (MVP)
  discovery.ts            getDiscoverProfiles() — proximity feed
  liked.ts                getUsersWhoLikedMe() — "Liked You" feed
  uploadthing.ts          Typed Uploadthing React helpers (useUploadThing)
  matching.ts             recordSwipe() — swipe + mutual-match logic
  messaging.ts            matches list, conversation, send + women-first rule
  geo.ts                  Haversine distance
  mappers.ts              DB enum ↔ Turkish label mapping
  api.ts                  Client fetch helpers
  time.ts                 Turkish relative timestamps
  types.ts                Domain types
  constants.ts            Swipe thresholds, 48h window
  mockData.ts             Seed source data (consumed by prisma/seed.ts)
  useCountdown.ts         Countdown hook + formatter
prisma/
  schema.prisma           User, Swipe, Match, Message + enums
  seed.ts                 Demo seed (accounts, matches, messages)
  migrations/             SQL migrations
scripts/
  generate-icons.mjs      Dependency-free PWA icon generator
```

## API

| Endpoint                            | Description                                                        |
| ----------------------------------- | ----------------------------------------------------------------- |
| `GET /api/discover`                 | Nearby, unseen, mutually-compatible profiles. `?radius=<km>&limit=<n>`. |
| `POST /api/swipe`                   | `{ targetId, direction }`. Mutual like → `Match` (`expiresAt = now + 48h`). |
| `GET /api/matches`                  | Matches grouped into `newMatches` / `conversations`, with latest message + unread count. |
| `GET /api/matches/[matchId]/messages`  | Conversation history + first-move state + `canSend`. Marks read. |
| `POST /api/matches/[matchId]/messages` | `{ content }`. Sends a message; the opening message flips `isFirstMessageSent`. |
| `GET /api/me` · `PATCH /api/me`     | Read / update the current user (bio, intention, photos).          |
| `POST /api/auth/switch`             | `{ userId }` — MVP identity switch for testing (sets `kuytu_uid`). |

The "current user" is resolved by `lib/auth.ts` — an MVP stub that reads a
`kuytu_uid` cookie, then falls back to the seeded `demo@kuytu.app`. Swap this
for real authentication before production.

### Photo uploads

The **Profil** tab has a Bumble-style 6-slot Photo Manager
(`app/(app)/profile/PhotoManager.tsx`). Empty slots open the file picker and
upload via Uploadthing (`profileImage`: images only, ≤ 6, ≤ 4 MB each); each
photo can be deleted or reordered with the ← → arrows, and slot #1 is badged
"Ana". Every change persists to `photos[]` through `PATCH /api/me` and syncs the
active profile immediately. Set `UPLOADTHING_TOKEN` (see `.env.example`) for
uploads to work.

### Women-first rule

Enforced server-side in `lib/messaging.ts` (`canSendMessage`): anyone may reply
once a conversation has started, but the **first** message must come from the
woman. A man opening an unstarted chat sees a locked composer, and
`POST …/messages` returns **403** with:
_"Sohbeti başlatmak için karşı tarafın ilk mesajı atması bekleniyor."_

### Demo accounts (seeded)

Switch between them on the **Profil** tab to test the women-first flow:

| Account            | Gender | State                                             |
| ------------------ | ------ | ------------------------------------------------- |
| `demo@kuytu.app` (Deniz) | Kadın  | New match (Kemal) + active chat (Ahmet); Murat pending like in Keşfet |
| `kemal@kuytu.app`  | Erkek  | New match with Deniz — composer locked until she writes |
| `ahmet@kuytu.app`  | Erkek  | Active chat with Deniz — can send                 |

### Onboarding & deep profile

- **Onboarding wizard** (`/onboarding`, `components/Onboarding.tsx`) — 2 steps
  with a live completion meter: **Step 1** (mandatory) name, age, gender, target
  gender, Niyet, **primary photo, and height (cm)** — "Devam" is blocked until
  all are set; **Step 2** (optional, "Şimdilik Atla") job title, education,
  zodiac, smoking, alcohol, pets, and up to 3 icebreaker prompts. Weight is
  never collected or stored.
- **Enhanced profile editor** (`/profile`) — avatar with glow ring, location
  badge, a **"Profil Doluluk Oranı"** card with tips, and accordion sections:
  Temel Bilgiler, Yaşam Tarzı (quick-tap chips, auto-save), Buz Kırıcı Kartlar.
- **Completion** — `lib/completion.ts` (`computeCompletion`) recomputes
  `profileCompletion` (0–100) on every `PATCH /api/me`; base 40 for the
  mandatory core, +60 across optional deep-profile fields.
- **Card integration** — `/discover` and `/people` cards show lifestyle chips
  (`components/LifestyleChips.tsx`) and prompt Q&As.

## Data model

- **User** — profile, `gender`/`targetGender`, `intention` (Niyet),
  `kidsStatus` (Çocuk Durumu), `isVerified`, `latitude`/`longitude`; deep
  profile `jobTitle`, `education`, `height`, `zodiac`, `smoking`, `alcohol`,
  `pets`, `prompts` (JSON, ≤3), and `profileCompletion`.
- **Swipe** — `swiperId`, `targetId`, `direction`; unique per pair.
- **Match** — ordered `user1Id`/`user2Id` (unique pair), `expiresAt` (48h
  window), `isFirstMessageSent`, per-user `lastReadAt` cursors (unread counts).
- **Message** — `matchId`, `senderId`, `content`.

## Core mechanics implemented

- **Swipe & tap:** drag a card left (Geç) / right (Beğen) / up (Süper), or use
  the large bottom buttons. Tap the photo left/right to browse photos.
- **Women first move:** enforced end-to-end — the `MatchModal` framing, the
  chat composer lock, and the server (`403`) all honour it; a live 48h countdown
  runs on `FIRST_MOVE_WINDOW_MS`.
- **Messaging:** grouped matches list (Yeni Eşleşmeler / Sohbetler), real chat
  history, unread counts, mark-as-read on open, and light polling for new messages.
- **Onboarding/profile:** multi-step wizard, deep-profile editor with lifestyle
  chips + icebreaker prompts, and a live "Profil Doluluk Oranı" meter.
- **Structured badges:** Niyet, Çocuk Durumu, and a Doğrulanmış (verified) mark.
- **App feel:** fixed phone-width shell, bottom navigation, spring transitions.

## TODO

- Replace the MVP demo-user resolver + switcher (`lib/auth.ts`) with real auth.
- Promote messaging to realtime (WebSocket / SSE) instead of polling.
- Expire matches whose 48h window closes with no first message.
- Move distance filtering into SQL (PostGIS / bounding box) as the feed grows.
