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
            ? "rounded-br-md bg-kuytu-gold text-kuytu-black"
            : "rounded-bl-md bg-kuytu-black-elevated text-white"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <span
          className={`mt-0.5 block text-right text-[10px] ${
            mine ? "text-kuytu-black/60" : "text-white/40"
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
        <p className="max-w-xs text-sm text-white/60">{error}</p>
        <Link href="/chats" className="text-sm text-kuytu-gold">
          Sohbetlere dön
        </Link>
      </div>
    );
  }

  if (!convo) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="animate-spin text-kuytu-gold" size={32} />
      </div>
    );
  }

  const { profile } = convo;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-white/[0.08] bg-kuytu-black/95 px-3 py-2.5 backdrop-blur-xl">
        <Link
          href="/chats"
          aria-label="Geri"
          className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:text-white"
        >
          <ChevronLeft size={24} />
        </Link>
        <div
          className="h-9 w-9 shrink-0 rounded-full bg-cover bg-center ring-1 ring-kuytu-gold/30"
          style={{
            backgroundImage: profile.photos[0]
              ? `url(${profile.photos[0]})`
              : undefined,
          }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-semibold text-white">
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
            <p className="font-serif text-lg text-white">
              {profile.name} ile eşleştiniz
            </p>
            <p className="max-w-xs text-sm text-white/55">
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
      <div className="border-t border-white/[0.08] bg-kuytu-black px-3 py-2.5">
        {convo.canSend ? (
          <form onSubmit={handleSend} className="flex items-end gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Bir mesaj yaz…"
              aria-label="Mesaj"
              maxLength={2000}
              className="min-w-0 flex-1 rounded-full border border-white/10 bg-kuytu-black-elevated px-4 py-2.5 text-[15px] text-white placeholder:text-white/40 focus:border-kuytu-gold/50 focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Gönder"
              disabled={!draft.trim() || sending}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-kuytu-gold text-kuytu-black transition-opacity disabled:opacity-40"
            >
              {sending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={19} />
              )}
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <Lock size={16} className="shrink-0 text-kuytu-gold" />
            <p className="text-[13px] leading-snug text-white/70">
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
