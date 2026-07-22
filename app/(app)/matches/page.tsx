import { Heart } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";

export default function MatchesPage() {
  return (
    <ComingSoon
      icon={Heart}
      title="Eşleşmeler"
      subtitle="Eşleştiğin profiller ve 48 saatlik ilk mesaj süreleri yakında burada."
    />
  );
}
