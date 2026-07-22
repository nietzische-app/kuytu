"use client";

/**
 * "Profil Doluluk Oranı" — a sleek animated progress bar. Used in onboarding
 * (live preview) and the profile header (with tips).
 */
export function CompletionMeter({
  value,
  compact = false,
}: {
  value: number;
  compact?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span
          className={`font-bold text-kuytu-text ${compact ? "text-sm" : "text-[15px]"}`}
        >
          Profil Doluluk Oranı
        </span>
        <span className="text-sm font-extrabold text-kuytu-accent-deep">
          %{pct}
        </span>
      </div>
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-kuytu-bg-deep">
        <div
          className="h-full rounded-full bg-grad-gold transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
