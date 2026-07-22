"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2, Plus, WifiOff } from "lucide-react";
import { fetchLikedYou, fetchMe, sendSwipe } from "@/lib/api";
import type { Match, Profile } from "@/lib/types";
import { MatchModal } from "./MatchModal";
import { VerifiedBadge } from "./ProfileBadges";

/** The "Be seen 10x" upsell — matches the reference banner + dark CTA. */
function SpotlightUpsell({ hero }: { hero?: string | null }) {
  return (
    <div className="flex flex-col items-center px-4 pt-10 text-center">
      <div className="relative mb-6">
        <div
          className="h-28 w-28 rounded-full bg-kuytu-bg-deep bg-cover bg-center ring-4 ring-kuytu-card"
          style={{ backgroundImage: hero ? `url(${hero})` : undefined }}
        />
        <span className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full bg-kuytu-text text-white ring-4 ring-kuytu-bg">
          <Plus size={20} strokeWidth={3} />
        </span>
      </div>
      <h2 className="max-w-[16rem] text-3xl font-extrabold leading-tight text-kuytu-text">
        10 kat daha fazla kişi seni görsün
      </h2>
      <p className="mt-3 max-w-xs text-[15px] leading-snug text-kuytu-muted">
        Spotlight ile daha fazla kişiye görün, tanışmak için daha çok fırsat
        yakala.
      </p>
      <button
        type="button"
        className="mt-6 w-full rounded-full bg-kuytu-text py-4 text-base font-bold text-white transition-transform active:scale-[0.98]"
      >
        Spotlight Dene
      </button>
    </div>
  );
}

/** A single "liked you" card with a like-back action. */
function LikerCard({
  profile,
  onLikeBack,
  pending,
}: {
  profile: Profile;
  onLikeBack: (p: Profile) => void;
  pending: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-kuytu-border bg-kuytu-card shadow-soft">
      <div
        className="aspect-[3/4] bg-kuytu-bg-deep bg-cover bg-center"
        style={{
          backgroundImage: profile.photos[0]
            ? `url(${profile.photos[0]})`
            : undefined,
        }}
      />
      <div className="absolute inset-x-0 bottom-0 bg-photo-scrim p-3">
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-lg font-extrabold text-white drop-shadow">
              <span className="truncate">{profile.name}</span>
              <span className="font-bold">{profile.age}</span>
              {profile.verified && <VerifiedBadge size={15} />}
            </p>
          </div>
          <button
            type="button"
            aria-label={`${profile.name} adlı kişiyi beğen`}
            disabled={pending}
            onClick={() => onLikeBack(profile)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-grad-gold text-kuytu-text shadow-glow-gold transition-transform active:scale-90 disabled:opacity-60"
          >
            {pending ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Heart size={20} fill="currentColor" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function LikedYou() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [viewerIsWoman, setViewerIsWoman] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchLikedYou()
      .then((d) => !cancelled && setProfiles(d))
      .catch((e: Error) => !cancelled && setError(e.message));
    fetchMe()
      .then(({ me }) => !cancelled && setViewerIsWoman(me.gender === "kadın"))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const likeBack = useCallback((p: Profile) => {
    setPendingId(p.id);
    sendSwipe(p.id, "like")
      .then((res) => {
        if (res.matched && res.match) {
          setMatch({
            id: res.match.id,
            profile: res.match.profile,
            matchedAt: res.match.matchedAt,
          });
        }
        setProfiles((prev) => prev?.filter((x) => x.id !== p.id) ?? prev);
      })
      .catch((e: Error) => console.error("Like-back failed:", e.message))
      .finally(() => setPendingId(null));
  }, []);

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

  return (
    <div className="flex flex-1 flex-col px-5 pb-6">
      {profiles.length === 0 ? (
        <SpotlightUpsell />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {profiles.map((p) => (
              <LikerCard
                key={p.id}
                profile={p}
                onLikeBack={likeBack}
                pending={pendingId === p.id}
              />
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-kuytu-border bg-kuytu-card p-4 text-center shadow-soft">
            <p className="font-extrabold text-kuytu-text">
              10 kat daha fazla görün
            </p>
            <p className="mt-1 text-sm text-kuytu-muted">
              Spotlight ile öne çık, önce sen görün.
            </p>
            <button
              type="button"
              className="mt-3 w-full rounded-full bg-kuytu-text py-3 text-sm font-bold text-white transition-transform active:scale-[0.98]"
            >
              Spotlight Dene
            </button>
          </div>
        </>
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
