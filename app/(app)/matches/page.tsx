import { MatchesHub } from "@/components/MatchesHub";

/**
 * Eşleşmeler — the same messaging hub as the Sohbetler tab (matches + recent
 * conversations). Not in the primary nav, kept as a stable route.
 */
export default function MatchesPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="px-5 pt-4 pb-3">
        <h1 className="text-[2rem] font-extrabold tracking-tight text-kuytu-text">
          Eşleşmeler
        </h1>
      </header>
      <MatchesHub />
    </div>
  );
}
