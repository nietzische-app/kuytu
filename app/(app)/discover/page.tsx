"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, SlidersHorizontal, WifiOff } from "lucide-react";
import { CardStack } from "@/components/CardStack";
import { MatchModal } from "@/components/MatchModal";
import { fetchDiscoverProfiles, fetchMe, sendSwipe } from "@/lib/api";
import type { Match, Profile, SwipeAction } from "@/lib/types";

/**
 * /discover — the primary discovery surface.
 *
 * Loads the feed from `GET /api/discover`, records each swipe via
 * `POST /api/swipe`, and surfaces the MatchModal when the server reports a
 * mutual like (with the real 48-hour first-move deadline).
 */
export default function DiscoverPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [viewerIsWoman, setViewerIsWoman] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchDiscoverProfiles()
      .then((data) => {
        if (!cancelled) setProfiles(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    // Learn the viewer's gender so the match modal is framed correctly.
    fetchMe()
      .then(({ me }) => !cancelled && setViewerIsWoman(me.gender === "kadın"))
      .catch(() => {
        /* non-fatal — defaults to the women-first framing */
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
      <header className="glass sticky top-0 z-30 -mx-4 flex items-center justify-between border-b border-white/[0.05] px-4 py-3.5">
        <h1 className="bg-grad-gold bg-clip-text font-serif text-2xl font-semibold tracking-wide text-transparent">
          Kuytu
        </h1>
        <button
          type="button"
          aria-label="Filtreler"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-kuytu-border bg-kuytu-card/60 text-kuytu-text/70 transition-colors hover:text-kuytu-gold"
        >
          <SlidersHorizontal size={18} />
        </button>
      </header>

      {/* Card stack fills the remaining space. */}
      <div className="relative flex min-h-0 flex-1 flex-col pb-4 pt-4">
        {error ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <WifiOff className="text-kuytu-pass" size={36} />
            <h3 className="font-serif text-xl text-kuytu-text">
              Bir şeyler ters gitti
            </h3>
            <p className="max-w-xs text-sm text-kuytu-text/60">{error}</p>
          </div>
        ) : profiles === null ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="animate-spin text-kuytu-gold" size={32} />
          </div>
        ) : (
          <CardStack profiles={profiles} onSwipe={handleSwipe} />
        )}
      </div>

      <MatchModal
        match={match}
        viewerIsWoman={viewerIsWoman}
        onClose={() => setMatch(null)}
        onSendMessage={(m) => {
          setMatch(null);
          router.push(`/chats/${m.id}`);
        }}
      />
    </div>
  );
}
