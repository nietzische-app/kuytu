import { BadgeCheck, Baby, Target } from "lucide-react";
import type { CocukDurumu, Niyet } from "@/lib/types";

/**
 * Small pills used across cards. On a light canvas they sit on translucent
 * surfaces; over photos they use a dark scrim so they stay legible.
 */
function Pill({
  icon,
  label,
  tone = "neutral",
}: {
  icon: React.ReactNode;
  label: string;
  tone?: "neutral" | "gold" | "onPhoto";
}) {
  const toneClasses =
    tone === "gold"
      ? "border-kuytu-accent/40 bg-kuytu-accent/10 text-kuytu-accent-deep"
      : tone === "onPhoto"
        ? "border-white/25 bg-black/35 text-white backdrop-blur-md"
        : "border-kuytu-border bg-kuytu-card-raised text-kuytu-text/80";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${toneClasses}`}
    >
      {icon}
      {label}
    </span>
  );
}

export function NiyetBadge({ niyet }: { niyet: Niyet }) {
  return (
    <Pill
      tone="gold"
      icon={<Target size={13} strokeWidth={2.5} />}
      label={niyet}
    />
  );
}

export function CocukBadge({ durum }: { durum: CocukDurumu }) {
  return <Pill icon={<Baby size={13} strokeWidth={2.5} />} label={durum} />;
}

/** Verified badge — "Doğrulanmış Profil". Rendered as an inline mark. */
export function VerifiedBadge({
  showLabel = false,
  size = 18,
}: {
  showLabel?: boolean;
  size?: number;
}) {
  return (
    <span className="inline-flex items-center gap-1 text-kuytu-accent">
      <BadgeCheck size={size} strokeWidth={2.5} aria-label="Doğrulanmış Profil" />
      {showLabel && <span className="text-xs font-semibold">Doğrulanmış</span>}
    </span>
  );
}

export function InterestChip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-kuytu-border bg-kuytu-card-raised px-3 py-1.5 text-xs font-medium text-kuytu-text/75">
      {label}
    </span>
  );
}
