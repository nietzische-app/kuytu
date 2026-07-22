"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, WifiOff } from "lucide-react";
import { fetchDiscoverProfiles, fetchMe, sendSwipe } from "@/lib/api";
import type { Match, Profile, SwipeAction } from "@/lib/types";
import { ActionButtons } from "./ActionButtons";
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
      {/* Immersive photo card — arched "vault" top */}
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-b-[1.75rem] rounded-t-[2.75rem] border border-kuytu-border bg-kuytu-bg-deep shadow-card">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: current.photos[0]
              ? `url(${current.photos[0]})`
              : undefined,
          }}
        />
        <div className="absolute inset-0 bg-photo-scrim" />

        {/* Verified + name/age */}
        <div className="absolute inset-x-0 bottom-0 p-5">
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
      </div>

      {/* Prompt card */}
      {(current.prompts[0] || current.interests.length > 0) && (
        <div className="rounded-3xl border border-kuytu-border bg-kuytu-card p-4 shadow-soft">
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

      {/* Floating glassmorphism action dock */}
      <div className="pt-1">
        <ActionButtons onAction={act} showRewind={false} />
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
