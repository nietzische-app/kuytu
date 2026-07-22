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
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col border-kuytu-border bg-kuytu-bg md:border-x md:shadow-[0_0_60px_-30px_rgba(24,24,27,0.25)]">
      {/* Content area — leaves room for the fixed bottom nav (64px + safe area). */}
      <main className="flex flex-1 flex-col pb-[4.5rem]">{children}</main>
      <BottomNav />
    </div>
  );
}
