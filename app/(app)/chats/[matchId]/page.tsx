import { ChatRoom } from "@/components/ChatRoom";

export default function ChatPage({
  params,
}: {
  params: { matchId: string };
}) {
  return <ChatRoom matchId={params.matchId} />;
}
