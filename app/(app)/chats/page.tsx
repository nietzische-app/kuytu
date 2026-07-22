import { MessageSquare } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";

export default function ChatsPage() {
  return (
    <ComingSoon
      icon={MessageSquare}
      title="Sohbetler"
      subtitle="Başlayan sohbetlerin bu sekmede toplanacak."
    />
  );
}
