"use client";

import { motion } from "framer-motion";
import { Heart, X, Star, RotateCcw } from "lucide-react";
import type { SwipeAction } from "@/lib/types";

interface ActionButtonsProps {
  onAction: (action: SwipeAction) => void;
  onRewind?: () => void;
  canRewind?: boolean;
  disabled?: boolean;
}

interface CircleButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  /** Diameter — Like/Pass are large primaries, Super/Rewind are secondary. */
  size: "lg" | "md";
  /** Base surface + icon styling. */
  surface: string;
  /** Ambient glow shown on hover/press. */
  glow: string;
  children: React.ReactNode;
}

/**
 * Floating circular action button, Tinder-style: a soft elevated disc that
 * lifts and blooms a warm ambient glow when pressed.
 */
function CircleButton({
  label,
  onClick,
  disabled,
  size,
  surface,
  glow,
  children,
}: CircleButtonProps) {
  const dim = size === "lg" ? "h-[4.25rem] w-[4.25rem]" : "h-[3.25rem] w-[3.25rem]";
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.86 }}
      whileHover={{ scale: 1.07, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
      className={`group relative flex ${dim} items-center justify-center rounded-full border shadow-action transition-[box-shadow,opacity] duration-300 disabled:opacity-35 ${surface} ${glow}`}
    >
      {children}
    </motion.button>
  );
}

/**
 * Bottom action row for the discovery stack.
 * Large, obvious targets sit alongside the swipe gestures — a requirement
 * for the 35–55 audience who may not rely on gestures alone.
 */
export function ActionButtons({
  onAction,
  onRewind,
  canRewind = false,
  disabled = false,
}: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <CircleButton
        label="Geri al"
        size="md"
        surface="border-kuytu-border bg-kuytu-card text-kuytu-accent"
        glow="hover:shadow-glow-gold"
        onClick={() => onRewind?.()}
        disabled={disabled || !canRewind}
      >
        <RotateCcw size={20} strokeWidth={2.5} />
      </CircleButton>

      <CircleButton
        label="Geç"
        size="lg"
        surface="border-kuytu-border bg-kuytu-card text-kuytu-pass"
        glow="hover:shadow-[0_12px_30px_-8px_rgba(240,87,111,0.45)]"
        onClick={() => onAction("pass")}
        disabled={disabled}
      >
        <X size={30} strokeWidth={3} />
      </CircleButton>

      <CircleButton
        label="Süper Beğeni"
        size="md"
        surface="border-kuytu-border bg-kuytu-card text-kuytu-super"
        glow="hover:shadow-[0_12px_30px_-8px_rgba(62,144,224,0.45)]"
        onClick={() => onAction("super")}
        disabled={disabled}
      >
        <Star size={22} strokeWidth={2.5} fill="currentColor" />
      </CircleButton>

      <CircleButton
        label="Beğen"
        size="lg"
        surface="border-transparent bg-grad-gold text-white"
        glow="hover:shadow-glow-like"
        onClick={() => onAction("like")}
        disabled={disabled}
      >
        <Heart size={28} strokeWidth={2.5} fill="currentColor" />
      </CircleButton>
    </div>
  );
}
