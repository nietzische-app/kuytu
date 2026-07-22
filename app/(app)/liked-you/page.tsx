import { SlidersHorizontal } from "lucide-react";
import { LikedYou } from "@/components/LikedYou";

/**
 * Beğenenler — people who liked you. Like any of them back to match instantly.
 */
export default function LikedYouPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="px-5 pt-4 pb-2">
        <div className="flex items-start justify-between">
          <h1 className="text-[2rem] font-extrabold tracking-tight text-kuytu-text">
            Beğenenler
          </h1>
          <button
            type="button"
            aria-label="Filtreler"
            className="mt-1 flex h-9 w-9 items-center justify-center rounded-full text-kuytu-text/70 transition-colors hover:text-kuytu-accent"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
        <p className="mt-1 max-w-xs text-[15px] leading-snug text-kuytu-muted">
          Onlar seni beğendi! Sen de beğenirsen anında eşleşin.
        </p>
      </header>
      <LikedYou />
    </div>
  );
}
