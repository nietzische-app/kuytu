# Kuytu

A premium, web-based dating **PWA** tailored for mature adults (35–55). Elegant,
uncluttered, dark-mode-first, and trustworthy.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** — custom Kuytu design tokens
- **Framer Motion** — swipe gestures & transitions
- **Lucide React** — icons

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/discover`.

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
components/
  SwipeCard.tsx           Draggable profile card (Framer Motion)
  CardStack.tsx           Stack orchestration, rewind, empty state
  ActionButtons.tsx       Pass / Super Like / Like buttons
  MatchModal.tsx          "Eşleşme Sağlandı!" + 48h countdown
  BottomNav.tsx           Keşfet · Eşleşmeler · Sohbetler · Profil
  ProfileBadges.tsx       Niyet / Çocuk Durumu / Doğrulanmış pills
  ComingSoon.tsx          Placeholder tab content
lib/
  types.ts                Domain types
  constants.ts            Swipe thresholds, 48h window
  mockData.ts             Placeholder discovery feed
  useCountdown.ts         Countdown hook + formatter
```

## Core mechanics implemented

- **Swipe & tap:** drag a card left (Geç) / right (Beğen) / up (Süper), or use
  the large bottom buttons. Tap the photo left/right to browse photos.
- **Women first move:** `MatchModal` frames the CTA toward the woman making the
  first move and runs a live 48-hour countdown (`FIRST_MOVE_WINDOW_MS`).
- **Structured badges:** Niyet, Çocuk Durumu, and a Doğrulanmış (verified) mark.
- **App feel:** fixed phone-width shell, bottom navigation, spring transitions.

## TODO

- Real backend feed & auth; replace `lib/mockData.ts` and the MVP match heuristic
  in `app/(app)/discover/page.tsx`.
- Add PWA icons under `public/icons/` (referenced by `app/manifest.ts`).
- Build out Matches, Chats, and Profile tabs; add a service worker for offline.
