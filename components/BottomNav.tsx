"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Heart,
  MessageCircle,
  User,
  AlignCenter,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Icons that read better filled when active. */
  fillWhenActive?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/profile", label: "Profil", icon: User },
  { href: "/discover", label: "Keşfet", icon: Compass },
  { href: "/people", label: "Kişiler", icon: AlignCenter },
  { href: "/liked-you", label: "Beğenenler", icon: Heart, fillWhenActive: true },
  { href: "/chats", label: "Sohbetler", icon: MessageCircle, fillWhenActive: true },
];

/**
 * Fixed white bottom navigation with a hairline top border. The active tab
 * gets a charcoal, champagne-accented icon; inactive tabs sit in neutral gray.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-kuytu-border bg-kuytu-card shadow-nav">
      <div className="mx-auto flex max-w-md items-stretch justify-around pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map(({ href, label, icon: Icon, fillWhenActive }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className="group relative flex h-[4.5rem] flex-1 flex-col items-center justify-center gap-1 pt-1"
            >
              <Icon
                size={24}
                strokeWidth={active ? 2.6 : 2}
                className={`transition-colors ${
                  active ? "text-kuytu-text" : "text-kuytu-muted"
                }`}
                fill={active && fillWhenActive ? "currentColor" : "none"}
              />
              <span
                className={`text-[11px] transition-colors ${
                  active
                    ? "font-bold text-kuytu-text"
                    : "font-medium text-kuytu-muted"
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
