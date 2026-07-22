import { BadgeCheck, Baby, Target } from "lucide-react";
import type { CocukDurumu, Niyet } from "@/lib/types";

/**
 * Small, high-contrast pills used across the card. Kept visually calm —
 * gold is reserved for structural (verified / intention) emphasis only.
 */
function Pill({
  icon,
  label,
  tone = "neutral",
}: {
  icon: React.ReactNode;
  label: string;
  tone?: "neutral" | "gold";
}) {
  const toneClasses =
    tone === "gold"
      ? "border-kuytu-gold/40 bg-kuytu-gold/10 text-kuytu-gold"
      : "border-white/15 bg-black/30 text-white/90";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-sm ${toneClasses}`}
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
    <span className="inline-flex items-center gap-1 text-kuytu-gold">
      <BadgeCheck size={size} strokeWidth={2.5} aria-label="Doğrulanmış Profil" />
      {showLabel && <span className="text-xs font-medium">Doğrulanmış</span>}
    </span>
  );
}

export function InterestChip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/80">
      {label}
    </span>
  );
}
