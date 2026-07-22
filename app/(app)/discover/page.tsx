"use client";

import { useCallback, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { CardStack } from "@/components/CardStack";
import { MatchModal } from "@/components/MatchModal";
import { mockProfiles } from "@/lib/mockData";
import type { Match, Profile, SwipeAction } from "@/lib/types";

/**
 * /discover — the primary discovery surface.
 *
 * Owns the "did this swipe create a match?" decision and surfaces the
 * MatchModal. For the MVP a Like/Super on a woman's profile deterministically
 * mints a match so the full flow (including the 48h countdown) is demoable.
 */
export default function DiscoverPage() {
  const [match, setMatch] = useState<Match | null>(null);

  const handleSwipe = useCallback((action: SwipeAction, profile: Profile) => {
    if (action === "pass") return;

    // MVP match heuristic — replace with a real server response.
    const isMatch = profile.gender === "kadın" || action === "super";
    if (isMatch) {
      setMatch({
        id: `m-${profile.id}-${Date.now()}`,
        profile,
        matchedAt: Date.now(),
      });
    }
  }, []);

  return (
    <div className="flex flex-1 flex-col px-4">
      {/* Header */}
      <header className="flex items-center justify-between py-4">
        <h1 className="font-serif text-2xl font-semibold tracking-wide text-kuytu-gold">
          Kuytu
        </h1>
        <button
          type="button"
          aria-label="Filtreler"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition-colors hover:text-white"
        >
          <SlidersHorizontal size={18} />
        </button>
      </header>

      {/* Card stack fills the remaining space. */}
      <div className="relative flex-1 pb-4">
        <CardStack profiles={mockProfiles} onSwipe={handleSwipe} />
      </div>

      <MatchModal
        match={match}
        viewerIsWoman
        onClose={() => setMatch(null)}
        onSendMessage={(m) => {
          // Wire to the chat route once it exists.
          setMatch(null);
          console.log("Opening chat with", m.profile.name);
        }}
      />
    </div>
  );
}
