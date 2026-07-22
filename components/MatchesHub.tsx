"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, MessageSquare, Sparkles, WifiOff } from "lucide-react";
import { fetchMatches } from "@/lib/api";
import { formatRelativeTime } from "@/lib/time";
import type { GroupedMatches, MatchSummary } from "@/lib/types";
import { CountdownBadge } from "./CountdownBadge";
import { VerifiedBadge } from "./ProfileBadges";

/** Circular avatar with a graceful fallback when no photo is set. */
function Avatar({
  src,
  alt,
  size = 56,
  glow = false,
}: {
  src: string | null;
  alt: string;
  size?: number;
  glow?: boolean;
}) {
  return (
    <div
      className={`shrink-0 overflow-hidden rounded-full bg-kuytu-rose/30 bg-cover bg-center ring-2 ${
        glow
          ? "ring-kuytu-gold/60 shadow-[0_0_16px_-2px_rgba(229,184,128,0.55)]"
          : "ring-kuytu-border"
      }`}
      style={{
        width: size,
        height: size,
        backgroundImage: src ? `url(${src})` : undefined,
      }}
      aria-label={alt}
    >
      {!src && (
        <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-kuytu-gold">
          {alt.charAt(0)}
        </span>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 px-1 pb-3 font-serif text-lg font-semibold text-kuytu-text">
      {children}
    </h2>
  );
}

/** Horizontal row of new matches awaiting the first move. */
function NewMatchesRow({ matches }: { matches: MatchSummary[] }) {
  return (
    <section>
      <SectionTitle>
        <Sparkles size={17} className="text-kuytu-gold" />
        Yeni Eşleşmeler
      </SectionTitle>
      <div className="flex gap-4 overflow-x-auto pb-2 scroll-region">
        {matches.map((m) => (
          <Link
            key={m.matchId}
            href={`/chats/${m.matchId}`}
            className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5"
          >
            <Avatar
              src={m.profile.photos[0] ?? null}
              alt={m.profile.name}
              size={66}
              glow
            />
            <span className="max-w-full truncate text-xs font-medium text-kuytu-text/90">
              {m.profile.name}
            </span>
            <CountdownBadge deadline={m.expiresAt} />
          </Link>
        ))}
      </div>
    </section>
  );
}

/** A single conversation row. */
function ConversationRow({ match }: { match: MatchSummary }) {
  const unread = match.unreadCount > 0;
  const preview = match.lastMessage?.content ?? "Sohbeti başlatın";
  return (
    <Link
      href={`/chats/${match.matchId}`}
      className={`flex items-center gap-3 rounded-2xl border px-3 py-3 transition-all duration-200 active:scale-[0.99] ${
        unread
          ? "border-kuytu-gold/20 bg-kuytu-card"
          : "border-kuytu-border/60 bg-kuytu-card/60 hover:bg-kuytu-card"
      }`}
    >
      <Avatar
        src={match.profile.photos[0] ?? null}
        alt={match.profile.name}
        glow={unread}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate font-semibold text-kuytu-text">
            {match.profile.name}
          </span>
          {match.profile.verified && <VerifiedBadge size={14} />}
        </div>
        <p
          className={`truncate text-sm ${
            unread ? "font-medium text-kuytu-text/90" : "text-kuytu-text/50"
          }`}
        >
          {preview}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        {match.lastMessage && (
          <span className="text-[11px] text-kuytu-text/40">
            {formatRelativeTime(match.lastMessage.createdAt)}
          </span>
        )}
        {unread && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-grad-gold px-1.5 text-[11px] font-bold text-kuytu-bg-deep shadow-[0_0_12px_-2px_rgba(229,184,128,0.7)]">
            {match.unreadCount}
          </span>
        )}
      </div>
    </Link>
  );
}

/**
 * The messaging hub: new matches (awaiting first move) grouped above active
 * conversations. Shared by the Eşleşmeler and Sohbetler tabs.
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
        <p className="max-w-xs text-sm text-kuytu-text/60">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="animate-spin text-kuytu-gold" size={32} />
      </div>
    );
  }

  const empty = data.newMatches.length === 0 && data.conversations.length === 0;
  if (empty) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <Sparkles className="text-kuytu-gold" size={40} />
        <h3 className="font-serif text-2xl text-kuytu-text">Henüz eşleşme yok</h3>
        <p className="max-w-xs text-sm text-kuytu-text/60">
          Keşfet&apos;te beğenmeye devam et — eşleşmelerin ve sohbetlerin burada
          toplanacak.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7 px-4 pb-6">
      {data.newMatches.length > 0 && <NewMatchesRow matches={data.newMatches} />}

      <section>
        <SectionTitle>
          <MessageSquare size={17} className="text-kuytu-gold" />
          Sohbetler
        </SectionTitle>
        {data.conversations.length > 0 ? (
          <div className="flex flex-col gap-2">
            {data.conversations.map((m) => (
              <ConversationRow key={m.matchId} match={m} />
            ))}
          </div>
        ) : (
          <p className="px-1 py-4 text-sm text-kuytu-text/50">
            Henüz başlamış bir sohbet yok.
          </p>
        )}
      </section>
    </div>
  );
}
