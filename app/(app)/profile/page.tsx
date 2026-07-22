import { ProfileScreen } from "@/components/ProfileScreen";

export default function ProfilePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="glass sticky top-0 z-30 border-b border-white/[0.05] px-4 py-3.5">
        <h1 className="bg-grad-gold bg-clip-text font-serif text-2xl font-semibold tracking-wide text-transparent">
          Profil
        </h1>
      </header>
      <ProfileScreen />
    </div>
  );
}
