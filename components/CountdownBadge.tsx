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
    ? "border-kuytu-border bg-kuytu-bg-soft text-kuytu-muted"
    : urgent
      ? "border-kuytu-pass/30 bg-kuytu-pass-bg text-kuytu-pass"
      : "border-kuytu-accent/30 bg-kuytu-accent/10 text-kuytu-accent-deep";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold tabular-nums ${tone} ${className}`}
    >
      <Clock size={11} strokeWidth={2.5} />
      {parts.expired ? "Süre doldu" : formatCountdown(parts)}
    </span>
  );
}
