"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2, Sparkles, Star, X, WifiOff } from "lucide-react";
import { fetchDiscoverProfiles, fetchMe, sendSwipe } from "@/lib/api";
import type { Match, Profile, SwipeAction } from "@/lib/types";
import { MatchModal } from "./MatchModal";
import { VerifiedBadge } from "./ProfileBadges";

/**
 * The primary "People" deck — one immersive, full-bleed profile at a time with
 * floating star / heart actions, matching the reference detail card.
 */
export function PeopleDeck() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [match, setMatch] = useState<Match | null>(null);
  const [viewerIsWoman, setViewerIsWoman] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchDiscoverProfiles()
      .then((d) => !cancelled && setProfiles(d))
      .catch((e: Error) => !cancelled && setError(e.message));
    fetchMe()
      .then(({ me }) => !cancelled && setViewerIsWoman(me.gender === "kadın"))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const current = useMemo(
    () => (profiles ? profiles[index] : undefined),
    [profiles, index],
  );

  const act = useCallback(
    (action: SwipeAction) => {
      if (!current) return;
      sendSwipe(current.id, action)
        .then((res) => {
          if (res.matched && res.match) {
            setMatch({
              id: res.match.id,
              profile: res.match.profile,
              matchedAt: res.match.matchedAt,
            });
          }
        })
        .catch((e: Error) => console.error("Swipe failed:", e.message));
      setIndex((i) => i + 1);
    },
    [current],
  );

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <WifiOff className="text-kuytu-pass" size={36} />
        <p className="max-w-xs text-sm text-kuytu-muted">{error}</p>
      </div>
    );
  }

  if (!profiles) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="animate-spin text-kuytu-accent" size={32} />
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <Sparkles className="text-kuytu-accent" size={40} />
        <h3 className="text-2xl font-extrabold text-kuytu-text">
          Şimdilik bu kadar
        </h3>
        <p className="max-w-xs text-sm text-kuytu-muted">
          Yeni kişiler için biraz sonra tekrar uğra.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-3">
      {/* Immersive photo card */}
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[1.5rem] border border-kuytu-border bg-kuytu-bg-deep shadow-card">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: current.photos[0]
              ? `url(${current.photos[0]})`
              : undefined,
          }}
        />
        <div className="absolute inset-0 bg-photo-scrim" />

        {/* Pass (small, top-right) */}
        <button
          type="button"
          aria-label="Geç"
          onClick={() => act("pass")}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-transform active:scale-90"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        {/* Bottom overlay: verified + name/age above the floating actions */}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="min-w-0">
            {current.verified && (
              <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                <VerifiedBadge size={14} /> Doğrulanmış
              </span>
            )}
            <h2 className="flex items-center gap-2 text-3xl font-extrabold text-white drop-shadow">
              <span className="truncate">{current.name}</span>
              <span className="font-bold">{current.age}</span>
            </h2>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              aria-label="Beğen"
              onClick={() => act("like")}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-grad-gold text-kuytu-text shadow-glow-gold transition-transform active:scale-90"
            >
              <Heart size={26} fill="currentColor" />
            </button>
            <button
              type="button"
              aria-label="Süper Beğeni"
              onClick={() => act("super")}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-grad-gold text-kuytu-text shadow-glow-gold transition-transform active:scale-90"
            >
              <Star size={26} fill="currentColor" />
            </button>
          </div>
        </div>
      </div>

      {/* Prompt card */}
      {(current.prompts[0] || current.interests.length > 0) && (
        <div className="rounded-2xl border border-kuytu-border bg-kuytu-card p-4 shadow-soft">
          <p className="text-base font-extrabold text-kuytu-text">
            {current.prompts[0]?.prompt ?? "Konuşabileceğimiz şeyler"}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {current.prompts[0] ? (
              <span className="rounded-full bg-kuytu-card-raised px-3 py-1.5 text-sm font-medium text-kuytu-text/80">
                {current.prompts[0].answer}
              </span>
            ) : (
              current.interests.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-kuytu-card-raised px-3 py-1.5 text-sm font-medium text-kuytu-text/80"
                >
                  {tag}
                </span>
              ))
            )}
          </div>
        </div>
      )}

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
