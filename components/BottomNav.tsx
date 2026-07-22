"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Heart, MessageSquare, User, type LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Optional unread/new count badge. */
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/discover", label: "Keşfet", icon: Flame },
  { href: "/matches", label: "Eşleşmeler", icon: Heart },
  { href: "/chats", label: "Sohbetler", icon: MessageSquare },
  { href: "/profile", label: "Profil", icon: User },
];

/**
 * App-style fixed bottom navigation.
 * Uses generous 64px touch targets and a gold active state.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-kuytu-black/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-stretch justify-around pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className="relative flex h-16 flex-1 flex-col items-center justify-center gap-1"
            >
              <span className="relative">
                <Icon
                  size={24}
                  strokeWidth={active ? 2.5 : 2}
                  className={
                    active ? "text-kuytu-gold" : "text-white/50"
                  }
                  fill={active && (href === "/matches") ? "currentColor" : "none"}
                />
                {badge ? (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-kuytu-pass px-1 text-[10px] font-bold text-white">
                    {badge}
                  </span>
                ) : null}
              </span>
              <span
                className={`text-[11px] font-medium ${
                  active ? "text-kuytu-gold" : "text-white/50"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
