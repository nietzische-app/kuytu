import { Sparkles, SlidersHorizontal } from "lucide-react";
import { PeopleDeck } from "@/components/PeopleDeck";

/**
 * Kişiler — the main immersive swipe deck (one profile at a time with star /
 * heart actions).
 */
export default function PeoplePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-5 pt-4 pb-3">
        <h1 className="flex items-center gap-1.5 text-[2rem] font-extrabold tracking-tight text-kuytu-text">
          Kuytu
          <Sparkles
            size={18}
            className="text-kuytu-accent drop-shadow-[0_0_8px_rgba(212,163,115,0.55)]"
            fill="currentColor"
          />
        </h1>
        <button
          type="button"
          aria-label="Filtreler"
          className="flex h-10 w-10 items-center justify-center rounded-full text-kuytu-text transition-colors hover:text-kuytu-accent"
        >
          <SlidersHorizontal size={22} strokeWidth={2.2} />
        </button>
      </header>
      <PeopleDeck />
    </div>
  );
}
