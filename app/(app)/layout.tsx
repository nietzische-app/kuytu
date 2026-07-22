import { BottomNav } from "@/components/BottomNav";

/**
 * The app shell: a centered, phone-width column with a fixed bottom nav.
 * Every primary tab renders inside this frame so the PWA feels like a native
 * app regardless of viewport width.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-kuytu-black">
      {/* Content area — leaves room for the fixed bottom nav (64px + safe area). */}
      <main className="flex flex-1 flex-col pb-16">{children}</main>
      <BottomNav />
    </div>
  );
}
