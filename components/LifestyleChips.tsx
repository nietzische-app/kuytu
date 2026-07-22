"use client";

import {
  Briefcase,
  Cigarette,
  GraduationCap,
  PawPrint,
  Ruler,
  Sparkles,
  Wine,
  type LucideIcon,
} from "lucide-react";
import type { Lifestyle } from "@/lib/types";

interface Chip {
  icon: LucideIcon;
  label: string;
}

/** Builds the ordered chip list from a lifestyle object (skips empties). */
export function lifestyleChips(ls: Lifestyle): Chip[] {
  const chips: Chip[] = [];
  if (ls.jobTitle) chips.push({ icon: Briefcase, label: ls.jobTitle });
  if (ls.height) chips.push({ icon: Ruler, label: `${ls.height} cm` });
  if (ls.education) chips.push({ icon: GraduationCap, label: ls.education });
  if (ls.zodiac) chips.push({ icon: Sparkles, label: ls.zodiac });
  if (ls.smoking) chips.push({ icon: Cigarette, label: ls.smoking });
  if (ls.alcohol) chips.push({ icon: Wine, label: ls.alcohol });
  if (ls.pets) chips.push({ icon: PawPrint, label: ls.pets });
  return chips;
}

/**
 * Renders lifestyle attributes as soft badges. `dark` styles them for use over
 * a photo; otherwise they sit on the light card surface.
 */
export function LifestyleBadges({
  lifestyle,
  max = 6,
  dark = false,
}: {
  lifestyle: Lifestyle;
  max?: number;
  dark?: boolean;
}) {
  const chips = lifestyleChips(lifestyle).slice(0, max);
  if (chips.length === 0) return null;

  const cls = dark
    ? "border-white/25 bg-black/35 text-white backdrop-blur-md"
    : "border-kuytu-border bg-kuytu-card-raised text-kuytu-text/80";

  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map(({ icon: Icon, label }) => (
        <span
          key={label}
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}
        >
          <Icon size={13} strokeWidth={2.4} />
          {label}
        </span>
      ))}
    </div>
  );
}

/** A single-select pill group used across onboarding + the profile editor. */
export function ChipSelect({
  options,
  value,
  onChange,
  allowClear = true,
}: {
  options: readonly string[];
  value: string | null;
  onChange: (next: string | null) => void;
  allowClear?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(active && allowClear ? null : opt)}
            className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors ${
              active
                ? "border-kuytu-accent bg-kuytu-accent/15 text-kuytu-accent-deep shadow-[0_0_10px_rgba(212,163,115,0.25)]"
                : "border-kuytu-border bg-kuytu-card text-kuytu-text/70 hover:border-kuytu-accent/50"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
