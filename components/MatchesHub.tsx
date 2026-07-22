"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Loader2,
  MessageCircleHeart,
  Sparkles,
  WifiOff,
} from "lucide-react";
import { fetchMatches } from "@/lib/api";
import { formatRelativeTime } from "@/lib/time";
import { useCountdown } from "@/lib/useCountdown";
import type { GroupedMatches, MatchSummary } from "@/lib/types";
import { VerifiedBadge } from "./ProfileBadges";

/** Circular avatar with a graceful fallback and an optional warm gold glow. */
function Avatar({
  src,
  alt,
  size = 56,
  ring = false,
}: {
  src: string | null;
  alt: string;
  size?: number;
  ring?: boolean;
}) {
  return (
    <div
      className={`shrink-0 overflow-hidden rounded-full bg-kuytu-bg-deep bg-cover bg-center ${
        ring
          ? "ring-2 ring-kuytu-accent/50 shadow-[0_0_12px_rgba(212,163,115,0.3)]"
          : ""
      }`}
      style={{
        width: size,
        height: size,
        backgroundImage: src ? `url(${src})` : undefined,
      }}
      aria-label={alt}
    >
      {!src && (
        <span className="flex h-full w-full items-center justify-center text-lg font-bold text-kuytu-accent-deep">
          {alt.charAt(0)}
        </span>
      )}
    </div>
  );
}

/** Horizontal "Your matches" row — new matches awaiting the first move. */
function MatchesRow({ matches }: { matches: MatchSummary[] }) {
  return (
    <section>
      <h2 className="pb-3 text-lg font-extrabold text-kuytu-text">
        Eşleşmelerin
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-1 no-scrollbar">
        {matches.map((m) => (
          <Link
            key={m.matchId}
            href={`/chats/${m.matchId}`}
            className="flex w-[4.75rem] shrink-0 flex-col items-center gap-1.5"
          >
            <Avatar src={m.profile.photos[0] ?? null} alt={m.profile.name} size={68} ring />
            <span className="max-w-full truncate text-xs font-semibold text-kuytu-text">
              {m.profile.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Spotlight upsell banner (matches the reference "Be seen 10x" card). */
function SpotlightBanner() {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-3xl border border-kuytu-border bg-kuytu-card p-3.5 text-left shadow-soft transition-transform active:scale-[0.99]"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-kuytu-accent-soft text-kuytu-accent-deep shadow-[0_0_12px_rgba(212,163,115,0.3)]">
        <Sparkles size={22} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-extrabold text-kuytu-text">
          10 kat daha fazla görün
        </span>
        <span className="block text-sm text-kuytu-muted">
          Spotlight ile öne çık, önce sen görün.
        </span>
      </span>
      <ChevronRight size={20} className="shrink-0 text-kuytu-muted" />
    </button>
  );
}

/** Muted "expires in N days" line for a conversation. */
function ExpiryNote({ deadline }: { deadline: number }) {
  const { expired, remainingMs } = useCountdown(deadline);
  if (expired) return <>Sohbet süresi doldu</>;
  const days = Math.floor(remainingMs / 86_400_000);
  const hours = Math.floor((remainingMs % 86_400_000) / 3_600_000);
  const left = days >= 1 ? `${days} gün` : `${hours} saat`;
  return (
    <>
      Sohbet <span className="font-bold text-kuytu-text">{left}</span> sonra
      kapanır
    </>
  );
}

/** A single conversation list row. */
function ConversationRow({ match }: { match: MatchSummary }) {
  const unread = match.unreadCount > 0;
  const preview = match.lastMessage?.content ?? "Sohbeti başlat";
  return (
    <Link
      href={`/chats/${match.matchId}`}
      className="flex items-center gap-3.5 py-3"
    >
      <Avatar src={match.profile.photos[0] ?? null} alt={match.profile.name} ring={unread} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-lg font-extrabold text-kuytu-text">
            {match.profile.name}
          </span>
          {match.profile.verified && <VerifiedBadge size={15} />}
        </div>
        <p
          className={`truncate text-[15px] ${
            unread ? "font-semibold text-kuytu-text" : "text-kuytu-muted"
          }`}
        >
          {preview}
        </p>
        <p className="mt-0.5 truncate text-[13px] text-kuytu-muted">
          {match.lastMessage ? (
            formatRelativeTime(match.lastMessage.createdAt)
          ) : (
            <ExpiryNote deadline={match.expiresAt} />
          )}
        </p>
      </div>
      {unread && (
        <span className="mt-1 h-2.5 w-2.5 shrink-0 self-start rounded-full bg-kuytu-accent" />
      )}
    </Link>
  );
}

/**
 * The messaging hub: "Your matches" (new, awaiting first move) above the
 * recent conversations list. Shared by the Eşleşmeler and Sohbetler tabs.
 */
export function MatchesHub() {
  const [data, setData] = useState<GroupedMatches | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchMatches()
      .then((d) => !cancelled && setData(d))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <WifiOff className="text-kuytu-pass" size={36} />
        <p className="max-w-xs text-sm text-kuytu-muted">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="animate-spin text-kuytu-accent" size={32} />
      </div>
    );
  }

  const empty = data.newMatches.length === 0 && data.conversations.length === 0;
  if (empty) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <Sparkles className="text-kuytu-accent" size={40} />
        <h3 className="text-2xl font-extrabold text-kuytu-text">
          Henüz eşleşme yok
        </h3>
        <p className="max-w-xs text-sm text-kuytu-muted">
          Keşfet&apos;te beğenmeye devam et — eşleşmelerin ve sohbetlerin burada
          toplanacak.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-5 pb-6 pt-1">
      {data.newMatches.length > 0 ? (
        <MatchesRow matches={data.newMatches} />
      ) : (
        <SpotlightBanner />
      )}

      <section>
        <h2 className="flex items-center gap-2 pb-1 text-lg font-extrabold text-kuytu-text">
          <MessageCircleHeart size={19} className="text-kuytu-accent" />
          Sohbetler <span className="text-kuytu-muted">(Son)</span>
        </h2>
        {data.conversations.length > 0 ? (
          <div className="flex flex-col divide-y divide-kuytu-border">
            {data.conversations.map((m) => (
              <ConversationRow key={m.matchId} match={m} />
            ))}
          </div>
        ) : (
          <p className="py-4 text-sm text-kuytu-muted">
            Henüz başlamış bir sohbet yok.
          </p>
        )}
      </section>
    </div>
  );
}
