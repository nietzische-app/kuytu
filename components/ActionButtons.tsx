"use client";

import { motion } from "framer-motion";
import { Heart, X, Sparkles, RotateCcw } from "lucide-react";
import type { SwipeAction } from "@/lib/types";

interface ActionButtonsProps {
  onAction: (action: SwipeAction) => void;
  onRewind?: () => void;
  canRewind?: boolean;
  disabled?: boolean;
  /** Hide the rewind control (e.g. the People deck has no history). */
  showRewind?: boolean;
}

interface DockButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  /** Diameter — primary actions are large, secondary ones smaller. */
  size: "lg" | "md" | "sm";
  surface: string;
  glow: string;
  children: React.ReactNode;
}

const DIMS = {
  lg: "h-[3.75rem] w-[3.75rem]",
  md: "h-[3.25rem] w-[3.25rem]",
  sm: "h-[2.75rem] w-[2.75rem]",
} as const;

/** A single disc inside the floating dock — lifts and glows on interaction. */
function DockButton({
  label,
  onClick,
  disabled,
  size,
  surface,
  glow,
  children,
}: DockButtonProps) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.85 }}
      whileHover={{ scale: 1.08, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
      className={`relative flex ${DIMS[size]} items-center justify-center rounded-full border transition-[box-shadow,opacity] duration-300 disabled:opacity-30 ${surface} ${glow}`}
    >
      {children}
    </motion.button>
  );
}

/**
 * Floating glassmorphism action dock for the discovery / people decks.
 * Order (left → right): Pas · Geri Al · Kıvılcım (Super) · Beğen — a calm,
 * obvious control cluster that lifts off the photo instead of sitting on it.
 */
export function ActionButtons({
  onAction,
  onRewind,
  canRewind = false,
  disabled = false,
  showRewind = true,
}: ActionButtonsProps) {
  return (
    <div className="flex justify-center">
      <div className="flex items-center gap-3 rounded-full border border-kuytu-border bg-white/90 px-5 py-2.5 shadow-lg backdrop-blur-md">
        {/* Pas — muted charcoal soft circle */}
        <DockButton
          label="Geç"
          size="lg"
          surface="border-transparent bg-kuytu-text/[0.07] text-kuytu-text"
          glow="hover:bg-kuytu-text/[0.12]"
          onClick={() => onAction("pass")}
          disabled={disabled}
        >
          <X size={26} strokeWidth={2.75} />
        </DockButton>

        {/* Geri Al — smaller secondary */}
        {showRewind && (
          <DockButton
            label="Geri al"
            size="sm"
            surface="border-kuytu-border bg-white text-kuytu-muted"
            glow="hover:text-kuytu-accent hover:shadow-glow-gold"
            onClick={() => onRewind?.()}
            disabled={disabled || !canRewind}
          >
            <RotateCcw size={18} strokeWidth={2.5} />
          </DockButton>
        )}

        {/* Kıvılcım / Super — warm gold spark */}
        <DockButton
          label="Kıvılcım"
          size="md"
          surface="border-kuytu-accent/40 bg-kuytu-accent/10 text-kuytu-accent-deep"
          glow="hover:shadow-glow-gold"
          onClick={() => onAction("super")}
          disabled={disabled}
        >
          <Sparkles size={22} strokeWidth={2.4} />
        </DockButton>

        {/* Beğen — primary glowing heart */}
        <DockButton
          label="Beğen"
          size="lg"
          surface="border-transparent bg-grad-gold text-white"
          glow="shadow-glow-gold hover:shadow-glow-like"
          onClick={() => onAction("like")}
          disabled={disabled}
        >
          <Heart size={26} strokeWidth={2.5} fill="currentColor" />
        </DockButton>
      </div>
    </div>
  );
}
