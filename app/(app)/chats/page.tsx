import { MatchesHub } from "@/components/MatchesHub";

/**
 * Sohbetler tab. Shares the messaging hub with the Eşleşmeler tab — new matches
 * and active conversations live in one place; individual threads open at
 * /chats/[matchId].
 */
export default function ChatsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="px-4 py-4">
        <h1 className="font-serif text-2xl font-semibold tracking-wide text-kuytu-gold">
          Sohbetler
        </h1>
      </header>
      <MatchesHub />
    </div>
  );
}
