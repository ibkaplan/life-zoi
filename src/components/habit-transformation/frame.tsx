"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KICKER, SECTIONS } from "@/lib/habit-transformation/catalog";
import { useHabitJourney } from "@/components/habit-transformation/use-habit-journey";

function current(pathname: string, href: string) {
  if (href === "/habit-transformation") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HabitFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { storageNote } = useHabitJourney();
  return (
    <div className="stack-lg">
      <div className="stack">
        <p className="kicker">{KICKER}</p>
        <nav className="habit-nav" aria-label="Habit Transformation">
          {SECTIONS.map((section) => (
            <Link key={section.href} href={section.href} aria-current={current(pathname, section.href) ? "page" : undefined}>
              {section.label}
            </Link>
          ))}
        </nav>
        <p className="hint">{storageNote}</p>
      </div>
      {children}
    </div>
  );
}
