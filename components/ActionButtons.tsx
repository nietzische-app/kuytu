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
  /** Diameter class — Like/Pass are large, Super/Rewind are secondary. */
  size: "lg" | "md";
  ring: string;
  children: React.ReactNode;
}

function CircleButton({
  label,
  onClick,
  disabled,
  size,
  ring,
  children,
}: CircleButtonProps) {
  const dim = size === "lg" ? "h-16 w-16" : "h-12 w-12";
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.88 }}
      whileHover={{ scale: 1.06 }}
      className={`flex ${dim} items-center justify-center rounded-full border bg-kuytu-black-elevated shadow-action transition-opacity disabled:opacity-40 ${ring}`}
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
    <div className="flex items-center justify-center gap-5">
      <CircleButton
        label="Geri al"
        size="md"
        ring="border-white/15 text-kuytu-gold"
        onClick={() => onRewind?.()}
        disabled={disabled || !canRewind}
      >
        <RotateCcw size={20} strokeWidth={2.5} />
      </CircleButton>

      <CircleButton
        label="Geç"
        size="lg"
        ring="border-kuytu-pass/40 text-kuytu-pass"
        onClick={() => onAction("pass")}
        disabled={disabled}
      >
        <X size={30} strokeWidth={3} />
      </CircleButton>

      <CircleButton
        label="Süper Beğeni"
        size="md"
        ring="border-kuytu-super/50 text-kuytu-super"
        onClick={() => onAction("super")}
        disabled={disabled}
      >
        <Star size={22} strokeWidth={2.5} />
      </CircleButton>

      <CircleButton
        label="Beğen"
        size="lg"
        ring="border-kuytu-like/50 text-kuytu-like"
        onClick={() => onAction("like")}
        disabled={disabled}
      >
        <Heart size={28} strokeWidth={2.5} />
      </CircleButton>
    </div>
  );
}
