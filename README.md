# Kuytu

A premium, web-based dating **PWA** tailored for mature adults (35–55). Elegant,
uncluttered, dark-mode-first, and trustworthy.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** — custom Kuytu design tokens
- **Framer Motion** — swipe gestures & transitions
- **Lucide React** — icons
- **Prisma + PostgreSQL** — data layer (users, swipes, matches, messages)

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

## Design tokens

Defined in `tailwind.config.ts`:

| Token             | Hex       | Use                          |
| ----------------- | --------- | ---------------------------- |
| `kuytu-black`     | `#0B0B0E` | Deep Night Black — canvas    |
| `kuytu-burgundy`  | `#4A0E17` | Rich Burgundy / Wine         |
| `kuytu-gold`      | `#D4AF37` | Warm Amber / Gold — highlights |

Semantic action colors: `kuytu-pass` (red), `kuytu-like` (green),
`kuytu-super` (blue).

## Project structure

```
app/
  layout.tsx              Root layout, fonts, PWA metadata
  manifest.ts             PWA web manifest
  page.tsx                Redirects to /discover
  (app)/
    layout.tsx            Mobile shell + bottom nav
    discover/page.tsx     Main discovery view (owns match logic)
    matches/page.tsx      Eşleşmeler — messaging hub
    chats/page.tsx        Sohbetler — same hub
    chats/[matchId]/      Chat screen (women-first composer)
    profile/page.tsx      Profil — switcher + editor
  api/
    discover/route.ts               GET nearby, unseen, compatible profiles
    swipe/route.ts                  POST a swipe; mints a Match on a mutual like
    matches/route.ts                GET grouped matches (new + conversations)
    matches/[matchId]/messages/     GET history · POST send (women-first)
    me/route.ts                     GET/PATCH the current user's profile
    auth/switch/route.ts            POST demo identity switch (sets cookie)
components/
  SwipeCard.tsx           Draggable profile card (Framer Motion)
  CardStack.tsx           Stack orchestration, rewind, empty state
  ActionButtons.tsx       Pass / Super Like / Like buttons
  MatchModal.tsx          "Eşleşme Sağlandı!" + 48h countdown
  MatchesHub.tsx          Grouped matches + conversations list
  ChatRoom.tsx            Chat screen with women-first composer lock
  CountdownBadge.tsx      Compact first-move countdown pill
  ProfileScreen.tsx       Demo switcher + bio/intention/photo editor
  BottomNav.tsx           Keşfet · Eşleşmeler · Sohbetler · Profil
  ProfileBadges.tsx       Niyet / Çocuk Durumu / Doğrulanmış pills
  ComingSoon.tsx          Placeholder tab content
lib/
  prisma.ts               PrismaClient singleton
  auth.ts                 getCurrentUser() + demo account list (MVP)
  discovery.ts            getDiscoverProfiles() — proximity feed
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

## Data model

- **User** — profile, `gender`/`targetGender`, `intention` (Niyet),
  `kidsStatus` (Çocuk Durumu), `isVerified`, `latitude`/`longitude`.
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
- **Onboarding/profile:** demo identity switcher + editable bio / intention / photos.
- **Structured badges:** Niyet, Çocuk Durumu, and a Doğrulanmış (verified) mark.
- **App feel:** fixed phone-width shell, bottom navigation, spring transitions.

## TODO

- Replace the MVP demo-user resolver + switcher (`lib/auth.ts`) with real auth.
- Promote messaging to realtime (WebSocket / SSE) instead of polling.
- Expire matches whose 48h window closes with no first message.
- Move distance filtering into SQL (PostGIS / bounding box) as the feed grows.
