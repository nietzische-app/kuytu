"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Heart, MessageSquare, User, type LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Icons that read better filled when active. */
  fillWhenActive?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/discover", label: "Keşfet", icon: Flame, fillWhenActive: true },
  { href: "/matches", label: "Eşleşmeler", icon: Heart, fillWhenActive: true },
  { href: "/chats", label: "Sohbetler", icon: MessageSquare },
  { href: "/profile", label: "Profil", icon: User },
];

/**
 * App-style fixed bottom navigation with frosted glassmorphism and a warm
 * champagne active state (glowing icon + top indicator).
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.06]">
      <div className="mx-auto flex max-w-md items-stretch justify-around pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map(({ href, label, icon: Icon, fillWhenActive }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className="group relative flex h-16 flex-1 flex-col items-center justify-center gap-1"
            >
              {/* Active indicator */}
              <span
                className={`absolute top-0 h-[3px] w-9 rounded-full bg-kuytu-gold transition-opacity duration-300 ${
                  active
                    ? "opacity-100 shadow-[0_0_10px_rgba(229,184,128,0.7)]"
                    : "opacity-0"
                }`}
              />
              <Icon
                size={23}
                strokeWidth={active ? 2.5 : 2}
                className={`transition-colors ${
                  active
                    ? "text-kuytu-gold drop-shadow-[0_0_8px_rgba(229,184,128,0.55)]"
                    : "text-kuytu-text/45 group-hover:text-kuytu-text/70"
                }`}
                fill={active && fillWhenActive ? "currentColor" : "none"}
              />
              <span
                className={`text-[11px] font-medium tracking-wide transition-colors ${
                  active ? "text-kuytu-gold" : "text-kuytu-text/45"
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
