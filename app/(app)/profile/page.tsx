import { ProfileScreen } from "@/components/ProfileScreen";

export default function ProfilePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="px-5 pt-4 pb-2">
        <h1 className="text-[2rem] font-extrabold tracking-tight text-kuytu-text">
          Profil
        </h1>
      </header>
      <ProfileScreen />
    </div>
  );
}
