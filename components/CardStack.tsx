"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { Profile, SwipeAction } from "@/lib/types";
import { SwipeCard, type SwipeCardHandle } from "./SwipeCard";
import { ActionButtons } from "./ActionButtons";

/** How many cards are rendered behind the active one. */
const VISIBLE_STACK = 3;

interface CardStackProps {
  profiles: Profile[];
  /** Fired for every committed swipe. Parent decides matches, likes, etc. */
  onSwipe: (action: SwipeAction, profile: Profile) => void;
}

export function CardStack({ profiles, onSwipe }: CardStackProps) {
  // Index of the current top card.
  const [index, setIndex] = useState(0);
  // History of consumed indices to support "rewind".
  const [history, setHistory] = useState<number[]>([]);
  const topCardRef = useRef<SwipeCardHandle>(null);

  const remaining = profiles.length - index;

  const visible = useMemo(
    () => profiles.slice(index, index + VISIBLE_STACK),
    [profiles, index],
  );

  function handleSwipe(action: SwipeAction, profile: Profile) {
    onSwipe(action, profile);
    setHistory((h) => [...h, index]);
    setIndex((i) => i + 1);
  }

  // Button-triggered swipes drive the top card's imperative handle so the
  // gesture animation and the button path stay identical.
  function handleAction(action: SwipeAction) {
    topCardRef.current?.swipe(action);
  }

  function handleRewind() {
    if (history.length === 0) return;
    setHistory((h) => h.slice(0, -1));
    setIndex((i) => Math.max(0, i - 1));
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="relative flex-1">
        {/* Empty state */}
        {remaining <= 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
            <Sparkles className="text-kuytu-gold" size={40} />
            <h3 className="font-serif text-2xl text-white">
              Şimdilik bu kadar
            </h3>
            <p className="max-w-xs text-sm text-white/60">
              Yeni profiller için biraz sonra tekrar uğrayın. En iyi eşleşmeler
              acele etmeyenleri bekler.
            </p>
          </div>
        )}

        {/* Render back-to-front so the top card sits last in the DOM. */}
        <AnimatePresence>
          {visible
            .map((profile, i) => ({ profile, i }))
            .reverse()
            .map(({ profile, i }) => (
              <SwipeCard
                key={profile.id}
                ref={i === 0 ? topCardRef : undefined}
                profile={profile}
                active={i === 0}
                offset={i}
                onSwipe={handleSwipe}
              />
            ))}
        </AnimatePresence>
      </div>

      {/* Action row */}
      {remaining > 0 && (
        <motion.div
          className="pt-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ActionButtons
            onAction={handleAction}
            onRewind={handleRewind}
            canRewind={history.length > 0}
          />
        </motion.div>
      )}
    </div>
  );
}
