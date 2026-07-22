"use client";

import { useEffect, useState } from "react";

export interface CountdownParts {
  hours: number;
  minutes: number;
  seconds: number;
  /** Total remaining time in ms (0 once expired). */
  remainingMs: number;
  expired: boolean;
}

function computeParts(targetMs: number): CountdownParts {
  const remainingMs = Math.max(0, targetMs - Date.now());
  const totalSeconds = Math.floor(remainingMs / 1000);
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    remainingMs,
    expired: remainingMs <= 0,
  };
}

/**
 * Ticks once per second toward `targetMs` (an epoch timestamp).
 * Cleans up its interval and stops once the deadline passes.
 */
export function useCountdown(targetMs: number): CountdownParts {
  const [parts, setParts] = useState<CountdownParts>(() =>
    computeParts(targetMs),
  );

  useEffect(() => {
    setParts(computeParts(targetMs));
    const id = setInterval(() => {
      const next = computeParts(targetMs);
      setParts(next);
      if (next.expired) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  return parts;
}

/** Formats parts as a zero-padded HH:MM:SS string. */
export function formatCountdown({ hours, minutes, seconds }: CountdownParts) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
