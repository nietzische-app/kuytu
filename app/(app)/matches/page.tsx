import { MatchesHub } from "@/components/MatchesHub";

export default function MatchesPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="px-4 py-4">
        <h1 className="font-serif text-2xl font-semibold tracking-wide text-kuytu-gold">
          Eşleşmeler
        </h1>
      </header>
      <MatchesHub />
    </div>
  );
}
