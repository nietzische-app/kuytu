"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, SlidersHorizontal, WifiOff } from "lucide-react";
import { CardStack } from "@/components/CardStack";
import { MatchModal } from "@/components/MatchModal";
import { fetchDiscoverProfiles, sendSwipe } from "@/lib/api";
import type { Match, Profile, SwipeAction } from "@/lib/types";

/**
 * /discover — the primary discovery surface.
 *
 * Loads the feed from `GET /api/discover`, records each swipe via
 * `POST /api/swipe`, and surfaces the MatchModal when the server reports a
 * mutual like (with the real 48-hour first-move deadline).
 */
export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [match, setMatch] = useState<Match | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchDiscoverProfiles()
      .then((data) => {
        if (!cancelled) setProfiles(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSwipe = useCallback((action: SwipeAction, profile: Profile) => {
    // Fire-and-forget persistence; surface a match if the server reports one.
    sendSwipe(profile.id, action)
      .then((res) => {
        if (res.matched && res.match) {
          setMatch({
            id: res.match.id,
            profile: res.match.profile,
            matchedAt: res.match.matchedAt,
          });
        }
      })
      .catch((err: Error) => {
        // Non-fatal: the card already left the stack. Log for diagnostics.
        console.error("Swipe failed:", err.message);
      });
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
        {error ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
            <WifiOff className="text-kuytu-pass" size={36} />
            <h3 className="font-serif text-xl text-white">
              Bir şeyler ters gitti
            </h3>
            <p className="max-w-xs text-sm text-white/60">{error}</p>
          </div>
        ) : profiles === null ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="animate-spin text-kuytu-gold" size={32} />
          </div>
        ) : (
          <CardStack profiles={profiles} onSwipe={handleSwipe} />
        )}
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
