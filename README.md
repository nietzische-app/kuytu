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
    matches|chats|profile Placeholder tabs
  api/
    discover/route.ts     GET nearby, unseen, compatible profiles
    swipe/route.ts        POST a swipe; mints a Match on a mutual like
components/
  SwipeCard.tsx           Draggable profile card (Framer Motion)
  CardStack.tsx           Stack orchestration, rewind, empty state
  ActionButtons.tsx       Pass / Super Like / Like buttons
  MatchModal.tsx          "Eşleşme Sağlandı!" + 48h countdown
  BottomNav.tsx           Keşfet · Eşleşmeler · Sohbetler · Profil
  ProfileBadges.tsx       Niyet / Çocuk Durumu / Doğrulanmış pills
  ComingSoon.tsx          Placeholder tab content
lib/
  prisma.ts               PrismaClient singleton
  auth.ts                 getCurrentUser() — MVP demo-user resolver
  discovery.ts            getDiscoverProfiles() — proximity feed
  matching.ts             recordSwipe() — swipe + mutual-match logic
  geo.ts                  Haversine distance
  mappers.ts              DB enum ↔ Turkish label mapping
  api.ts                  Client fetch helpers (discover / swipe)
  types.ts                Domain types
  constants.ts            Swipe thresholds, 48h window
  mockData.ts             Seed source data (consumed by prisma/seed.ts)
  useCountdown.ts         Countdown hook + formatter
prisma/
  schema.prisma           User, Swipe, Match, Message + enums
  seed.ts                 Demo seed
  migrations/             SQL migrations
scripts/
  generate-icons.mjs      Dependency-free PWA icon generator
```

## API

| Endpoint            | Description                                                        |
| ------------------- | ----------------------------------------------------------------- |
| `GET /api/discover` | Nearby, unseen, mutually-compatible profiles for the current user. Optional `?radius=<km>&limit=<n>`. |
| `POST /api/swipe`   | Body `{ targetId, direction: "LIKE" \| "PASS" \| "SUPERLIKE" }`. On a mutual like, creates a `Match` (`expiresAt = now + 48h`) and returns it. |

The "current user" is resolved by `lib/auth.ts` — an MVP stub that reads a
`kuytu_uid` cookie, then falls back to the seeded `demo@kuytu.app`. Swap this
for real authentication before production.

## Data model

- **User** — profile, `gender`/`targetGender`, `intention` (Niyet),
  `kidsStatus` (Çocuk Durumu), `isVerified`, `latitude`/`longitude`.
- **Swipe** — `swiperId`, `targetId`, `direction`; unique per pair.
- **Match** — ordered `user1Id`/`user2Id` (unique pair), `expiresAt` (48h
  window), `isFirstMessageSent`.
- **Message** — `matchId`, `senderId`, `content`.

## Core mechanics implemented

- **Swipe & tap:** drag a card left (Geç) / right (Beğen) / up (Süper), or use
  the large bottom buttons. Tap the photo left/right to browse photos.
- **Women first move:** `MatchModal` frames the CTA toward the woman making the
  first move and runs a live 48-hour countdown (`FIRST_MOVE_WINDOW_MS`).
- **Structured badges:** Niyet, Çocuk Durumu, and a Doğrulanmış (verified) mark.
- **App feel:** fixed phone-width shell, bottom navigation, spring transitions.

## TODO

- Replace the MVP demo-user resolver (`lib/auth.ts`) with real authentication.
- Persist messages / enforce the women-first rule server-side when chat is built.
- Build out Matches, Chats, and Profile tabs; add a service worker for offline.
- Move distance filtering into SQL (PostGIS / bounding box) as the feed grows.
