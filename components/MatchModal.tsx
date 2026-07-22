"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart, MessageCircle, Clock, X } from "lucide-react";
import type { Match } from "@/lib/types";
import { FIRST_MOVE_WINDOW_MS } from "@/lib/constants";
import { useCountdown, formatCountdown } from "@/lib/useCountdown";
import { VerifiedBadge } from "./ProfileBadges";

interface MatchModalProps {
  match: Match | null;
  /** Whether the current viewer is a woman — decides the CTA framing. */
  viewerIsWoman?: boolean;
  onClose: () => void;
  onSendMessage: (match: Match) => void;
}

function CountdownRow({ deadline }: { deadline: number }) {
  const parts = useCountdown(deadline);

  return (
    <div className="flex items-center justify-center gap-2 rounded-2xl border border-kuytu-accent/25 bg-kuytu-accent/10 px-4 py-3">
      <Clock size={16} className="text-kuytu-accent-deep" />
      <span className="text-sm text-kuytu-muted">İlk mesaj için kalan süre</span>
      <span className="ml-1 font-mono text-base font-bold tabular-nums text-kuytu-accent-deep">
        {parts.expired ? "Süre doldu" : formatCountdown(parts)}
      </span>
    </div>
  );
}

/**
 * "Eşleşme Sağlandı!" — celebratory match modal.
 * Enforces Kuytu's women-first rule: the countdown runs on the 48h window and
 * the primary CTA is framed toward the woman making the first move.
 */
export function MatchModal({
  match,
  viewerIsWoman = true,
  onClose,
  onSendMessage,
}: MatchModalProps) {
  return (
    <AnimatePresence>
      {match && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-kuytu-text/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Eşleşme Sağlandı"
            className="relative w-full max-w-sm overflow-hidden rounded-b-[1.75rem] rounded-t-[2.75rem] border border-kuytu-border bg-grad-match shadow-card"
            initial={{ scale: 0.85, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            <button
              type="button"
              aria-label="Kapat"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 text-kuytu-muted transition-colors hover:text-kuytu-text"
            >
              <X size={22} />
            </button>

            <div className="relative flex flex-col items-center px-6 pb-6 pt-9 text-center">
              {/* Overlapping avatars */}
              <div className="mb-5 flex items-center">
                <div
                  className="h-20 w-20 rounded-full border-4 border-kuytu-card bg-kuytu-bg-deep bg-cover bg-center ring-2 ring-kuytu-accent/50 shadow-[0_0_16px_rgba(212,163,115,0.4)]"
                  style={{
                    backgroundImage: `url(https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80)`,
                  }}
                />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 400 }}
                  className="z-10 -mx-4 flex h-12 w-12 items-center justify-center rounded-full bg-grad-gold text-kuytu-text shadow-glow-gold"
                >
                  <Heart size={22} fill="currentColor" />
                </motion.div>
                <div
                  className="h-20 w-20 rounded-full border-4 border-kuytu-card bg-kuytu-bg-deep bg-cover bg-center ring-2 ring-kuytu-accent/50 shadow-[0_0_16px_rgba(212,163,115,0.4)]"
                  style={{ backgroundImage: `url(${match.profile.photos[0]})` }}
                />
              </div>

              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-[2rem] font-extrabold text-kuytu-text"
              >
                Eşleşme Sağlandı!
              </motion.h2>

              <p className="mt-2 flex items-center justify-center gap-1.5 text-kuytu-muted">
                Sen ve {match.profile.name}
                {match.profile.verified && <VerifiedBadge size={16} />}
                birbirinizi beğendiniz.
              </p>

              {/* Women-first callout */}
              <div className="mt-5 w-full rounded-2xl border border-kuytu-border bg-kuytu-card p-4 text-left">
                <p className="text-sm leading-relaxed text-kuytu-text/85">
                  {viewerIsWoman ? (
                    <>
                      <span className="font-bold text-kuytu-accent-deep">
                        İlk adım senin.
                      </span>{" "}
                      Kuytu&apos;da sohbeti kadınlar başlatır. 48 saat içinde bir
                      merhaba bırak, tanışmanın kapısını sen arala.
                    </>
                  ) : (
                    <>
                      <span className="font-bold text-kuytu-accent-deep">
                        Sıra {match.profile.name}&apos;de.
                      </span>{" "}
                      Kuytu&apos;da sohbeti kadınlar başlatır. İlk mesaj için 48
                      saat var — biraz sabır, güzel şeyler beklemeye değer.
                    </>
                  )}
                </p>
              </div>

              <div className="mt-4 w-full">
                <CountdownRow deadline={match.matchedAt + FIRST_MOVE_WINDOW_MS} />
              </div>

              {/* CTAs */}
              <div className="mt-5 flex w-full flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => onSendMessage(match)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-grad-gold py-3.5 text-base font-bold text-kuytu-text shadow-glow-gold transition-transform active:scale-95"
                >
                  <MessageCircle size={19} />
                  {viewerIsWoman ? "İlk Mesajı Gönder" : "Sohbete Git"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-full border border-kuytu-border py-3 text-sm font-semibold text-kuytu-muted transition-colors hover:text-kuytu-text"
                >
                  Keşfetmeye Devam Et
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
