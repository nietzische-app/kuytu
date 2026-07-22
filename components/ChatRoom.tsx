"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Loader2,
  Lock,
  Send,
  WifiOff,
} from "lucide-react";
import { fetchConversation, postMessage } from "@/lib/api";
import { formatClock } from "@/lib/time";
import type { ChatMessage, Conversation } from "@/lib/types";
import { CountdownBadge } from "./CountdownBadge";
import { VerifiedBadge } from "./ProfileBadges";

/** Poll interval while a chat is open — cheap stand-in for realtime. */
const POLL_MS = 5000;

function Bubble({ message, mine }: { message: ChatMessage; mine: boolean }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-[15px] leading-snug ${
          mine
            ? "rounded-br-md bg-kuytu-accent-soft text-kuytu-text"
            : "rounded-bl-md border border-kuytu-border bg-kuytu-card-raised text-kuytu-text"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <span
          className={`mt-0.5 block text-right text-[10px] ${
            mine ? "text-kuytu-text/50" : "text-kuytu-muted"
          }`}
        >
          {formatClock(message.createdAt)}
        </span>
      </div>
    </div>
  );
}

export function ChatRoom({ matchId }: { matchId: string }) {
  const [convo, setConvo] = useState<Conversation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  // Initial load.
  useEffect(() => {
    let cancelled = false;
    fetchConversation(matchId)
      .then((c) => {
        if (cancelled) return;
        setConvo(c);
        requestAnimationFrame(() => scrollToBottom(false));
      })
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [matchId, scrollToBottom]);

  // Light polling for incoming messages.
  useEffect(() => {
    const id = setInterval(() => {
      fetchConversation(matchId)
        .then((fresh) => {
          setConvo((prev) => {
            if (!prev) return fresh;
            // Only adopt if the server has something new, to avoid clobbering.
            if (fresh.messages.length !== prev.messages.length) {
              requestAnimationFrame(() => scrollToBottom());
              return fresh;
            }
            // Keep local optimistic state but refresh gating flags.
            return { ...prev, canSend: fresh.canSend, lockReason: fresh.lockReason };
          });
        })
        .catch(() => {
          /* transient — next tick retries */
        });
    }, POLL_MS);
    return () => clearInterval(id);
  }, [matchId, scrollToBottom]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content || sending || !convo?.canSend) return;

    setSending(true);
    setSendError(null);
    try {
      const message = await postMessage(matchId, content);
      setConvo((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, message],
              isFirstMessageSent: true,
              canSend: true,
              lockReason: null,
            }
          : prev,
      );
      setDraft("");
      requestAnimationFrame(() => scrollToBottom());
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Mesaj gönderilemedi");
    } finally {
      setSending(false);
    }
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <WifiOff className="text-kuytu-pass" size={36} />
        <p className="max-w-xs text-sm text-kuytu-muted">{error}</p>
        <Link href="/chats" className="text-sm font-semibold text-kuytu-accent-deep">
          Sohbetlere dön
        </Link>
      </div>
    );
  }

  if (!convo) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="animate-spin text-kuytu-accent" size={32} />
      </div>
    );
  }

  const { profile } = convo;

  return (
    <div className="flex h-full flex-col bg-kuytu-bg">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-kuytu-border bg-kuytu-card px-3 py-2.5">
        <Link
          href="/chats"
          aria-label="Geri"
          className="flex h-9 w-9 items-center justify-center rounded-full text-kuytu-text transition-colors hover:text-kuytu-accent"
        >
          <ChevronLeft size={24} />
        </Link>
        <div
          className="h-10 w-10 shrink-0 rounded-full bg-kuytu-bg-deep bg-cover bg-center ring-2 ring-kuytu-accent ring-offset-1 ring-offset-kuytu-card"
          style={{
            backgroundImage: profile.photos[0]
              ? `url(${profile.photos[0]})`
              : undefined,
          }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-bold text-kuytu-text">
              {profile.name}
            </span>
            {profile.verified && <VerifiedBadge size={15} />}
          </div>
          {!convo.isFirstMessageSent && (
            <CountdownBadge deadline={convo.expiresAt} className="mt-0.5" />
          )}
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-4 py-4 scroll-region">
        {convo.messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="text-xl font-extrabold text-kuytu-text">
              {profile.name} ile eşleştiniz
            </p>
            <p className="max-w-xs text-sm text-kuytu-muted">
              {convo.canSend
                ? "İlk mesajı göndererek sohbeti başlat."
                : convo.lockReason}
            </p>
          </div>
        ) : (
          convo.messages.map((m) => (
            <Bubble key={m.id} message={m} mine={m.senderId === convo.viewerId} />
          ))
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-kuytu-border bg-kuytu-card px-3 py-2.5">
        {convo.canSend ? (
          <form onSubmit={handleSend} className="flex items-end gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Bir mesaj yaz…"
              aria-label="Mesaj"
              maxLength={2000}
              className="min-w-0 flex-1 rounded-full border border-kuytu-border bg-kuytu-card-raised px-4 py-2.5 text-[15px] text-kuytu-text placeholder:text-kuytu-muted focus:border-kuytu-accent focus:outline-none focus:ring-1 focus:ring-kuytu-accent/40"
            />
            <button
              type="submit"
              aria-label="Gönder"
              disabled={!draft.trim() || sending}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-grad-gold text-kuytu-text shadow-glow-gold transition-[opacity,transform] active:scale-95 disabled:opacity-40 disabled:shadow-none"
            >
              {sending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={19} />
              )}
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2.5 rounded-2xl border border-kuytu-accent/25 bg-kuytu-accent/10 px-4 py-3">
            <Lock size={16} className="shrink-0 text-kuytu-accent-deep" />
            <p className="text-[13px] font-medium leading-snug text-kuytu-text/80">
              {convo.lockReason}
            </p>
          </div>
        )}
        {sendError && (
          <p className="mt-1.5 px-2 text-xs text-kuytu-pass">{sendError}</p>
        )}
      </div>
    </div>
  );
}
