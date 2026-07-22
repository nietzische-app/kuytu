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
    <div className="flex items-center justify-center gap-2 rounded-2xl border border-kuytu-gold/25 bg-kuytu-gold/5 px-4 py-3">
      <Clock size={16} className="text-kuytu-gold" />
      <span className="text-sm text-white/70">İlk mesaj için kalan süre</span>
      <span className="ml-1 font-mono text-base font-semibold tabular-nums text-kuytu-gold">
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
            className="absolute inset-0 bg-kuytu-black/85 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Eşleşme Sağlandı"
            className="relative w-full max-w-sm overflow-hidden rounded-card border border-kuytu-gold/20 bg-gradient-to-b from-kuytu-burgundy-deep to-kuytu-black-elevated shadow-gold"
            initial={{ scale: 0.85, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            <button
              type="button"
              aria-label="Kapat"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 text-white/60 transition-colors hover:text-white"
            >
              <X size={22} />
            </button>

            <div className="flex flex-col items-center px-6 pb-6 pt-9 text-center">
              {/* Overlapping avatars */}
              <div className="mb-5 flex items-center">
                <div
                  className="h-20 w-20 rounded-full border-2 border-kuytu-gold bg-cover bg-center"
                  style={{
                    backgroundImage: `url(https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80)`,
                  }}
                />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 400 }}
                  className="z-10 -mx-4 flex h-12 w-12 items-center justify-center rounded-full bg-kuytu-gold text-kuytu-black"
                >
                  <Heart size={22} fill="currentColor" />
                </motion.div>
                <div
                  className="h-20 w-20 rounded-full border-2 border-kuytu-gold bg-cover bg-center"
                  style={{ backgroundImage: `url(${match.profile.photos[0]})` }}
                />
              </div>

              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-serif text-3xl font-semibold text-kuytu-gold"
              >
                Eşleşme Sağlandı!
              </motion.h2>

              <p className="mt-2 flex items-center justify-center gap-1.5 text-white/80">
                Sen ve {match.profile.name}
                {match.profile.verified && <VerifiedBadge size={16} />}
                birbirinizi beğendiniz.
              </p>

              {/* Women-first callout */}
              <div className="mt-5 w-full rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-left">
                <p className="text-sm leading-relaxed text-white/85">
                  {viewerIsWoman ? (
                    <>
                      <span className="font-semibold text-kuytu-gold">
                        İlk adım senin.
                      </span>{" "}
                      Kuytu&apos;da sohbeti kadınlar başlatır. 48 saat içinde bir
                      merhaba bırak, tanışmanın kapısını sen arala.
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-kuytu-gold">
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
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-kuytu-gold py-3.5 text-base font-semibold text-kuytu-black transition-transform active:scale-95"
                >
                  <MessageCircle size={19} />
                  {viewerIsWoman ? "İlk Mesajı Gönder" : "Sohbete Git"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-full border border-white/15 py-3 text-sm font-medium text-white/70 transition-colors hover:text-white"
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
