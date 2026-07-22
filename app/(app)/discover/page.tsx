"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HelpCircle, Info, Loader2, WifiOff } from "lucide-react";
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
    <div className="flex flex-1 flex-col px-5">
      {/* Header */}
      <header className="flex items-start justify-between pb-3 pt-4">
        <div>
          <h1 className="text-[2rem] font-extrabold tracking-tight text-kuytu-text">
            Keşfet
          </h1>
          <span className="mt-2 inline-block rounded-full bg-kuytu-accent-soft px-3 py-1 text-sm font-bold text-kuytu-text">
            16 saat içinde yeni kişiler
          </span>
          <p className="mt-3 max-w-xs text-[15px] leading-snug text-kuytu-text/80">
            Sana uygun kişilerle ortak zeminde tanış, her gün yenilenir.
          </p>
        </div>
        <button
          type="button"
          aria-label="Yardım"
          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-kuytu-border text-kuytu-text/70 transition-colors hover:text-kuytu-accent"
        >
          <HelpCircle size={18} />
        </button>
      </header>

      <h2 className="pb-3 pt-1 text-xl font-extrabold text-kuytu-text">
        Sana özel öneriler
      </h2>

      {/* Card stack fills the remaining space. */}
      <div className="relative flex min-h-0 flex-1 flex-col pb-2">
        {error ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <WifiOff className="text-kuytu-pass" size={36} />
            <h3 className="text-xl font-bold text-kuytu-text">
              Bir şeyler ters gitti
            </h3>
            <p className="max-w-xs text-sm text-kuytu-muted">{error}</p>
          </div>
        ) : profiles === null ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="animate-spin text-kuytu-accent" size={32} />
          </div>
        ) : (
          <CardStack profiles={profiles} onSwipe={handleSwipe} />
        )}
        <p className="flex items-center justify-center gap-1.5 pt-3 text-sm text-kuytu-muted">
          <Info size={14} />
          Profilin ve geçmiş eşleşmelerine göre
        </p>
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
