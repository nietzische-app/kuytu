import type { LucideIcon } from "lucide-react";

/** Simple placeholder for tabs not yet built out in the MVP. */
export function ComingSoon({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-kuytu-gold/25 bg-kuytu-gold/5 text-kuytu-gold">
        <Icon size={28} />
      </div>
      <h1 className="font-serif text-2xl font-semibold text-kuytu-text">{title}</h1>
      <p className="max-w-xs text-sm text-kuytu-text/60">{subtitle}</p>
    </div>
  );
}
