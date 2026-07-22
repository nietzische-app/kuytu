"use client";

import { Clock } from "lucide-react";
import { useCountdown, formatCountdown } from "@/lib/useCountdown";

/**
 * Compact "time left to first move" badge. Turns urgent (burgundy/red) under
 * six hours and shows "Süre doldu" once the 48h window closes.
 */
export function CountdownBadge({
  deadline,
  className = "",
}: {
  deadline: number;
  className?: string;
}) {
  const parts = useCountdown(deadline);
  const urgent = !parts.expired && parts.remainingMs < 6 * 3600_000;

  const tone = parts.expired
    ? "border-white/12 bg-white/5 text-kuytu-text/45"
    : urgent
      ? "border-kuytu-rose/50 bg-kuytu-rose/15 text-kuytu-rose-soft shadow-[0_0_14px_-4px_rgba(163,50,70,0.7)]"
      : "border-kuytu-gold/30 bg-kuytu-gold/[0.12] text-kuytu-gold";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tabular-nums backdrop-blur-sm ${tone} ${className}`}
    >
      <Clock size={11} strokeWidth={2.5} />
      {parts.expired ? "Süre doldu" : formatCountdown(parts)}
    </span>
  );
}
