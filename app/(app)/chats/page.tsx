import { MatchesHub } from "@/components/MatchesHub";

/**
 * Sohbetler tab. Shares the messaging hub with the Eşleşmeler tab — new matches
 * and active conversations live in one place; individual threads open at
 * /chats/[matchId].
 */
export default function ChatsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="glass sticky top-0 z-30 border-b border-white/[0.05] px-4 py-3.5">
        <h1 className="bg-grad-gold bg-clip-text font-serif text-2xl font-semibold tracking-wide text-transparent">
          Sohbetler
        </h1>
      </header>
      <MatchesHub />
    </div>
  );
}
