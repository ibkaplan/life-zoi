"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Logo } from "@/components/logo";
import { useSession } from "@/components/session-provider";
import { CRISIS_NOTICE, PROFESSIONAL_NOTICE } from "@/lib/sources";
import { sources } from "@/lib/sources";

const links = [
  { href: "/dashboard", label: "Dashboard", short: "Home" },
  { href: "/profile", label: "My Profile", short: "Profile" },
  { href: "/assessment", label: "Lifestyle Assessment", short: "Assess" },
  { href: "/what-if", label: "WHAT IF?", short: "What if" },
  { href: "/progress", label: "Progress", short: "Progress" },
  { href: "/settings", label: "Settings", short: "Settings" },
];

function current(pathname: string, href: string) {
  if (href === "/what-if") return pathname.startsWith("/what-if");
  return pathname === href;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { sample, ready } = useSession();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const open = menuPath === pathname;
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const root = panelRef.current;
    const focusable = root?.querySelectorAll<HTMLElement>("a, button");
    focusable?.[0]?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuPath(null);
      if (event.key !== "Tab" || !root) return;
      const items = [...root.querySelectorAll<HTMLElement>("a, button")];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open]);

  const primary = links.filter((link) =>
    ["/dashboard", "/assessment", "/what-if", "/progress"].includes(link.href),
  );

  return (
    <>
      <header className="page topbar">
        <Logo href="/dashboard" />
        <nav className="nav-desktop" aria-label="Main">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={current(pathname, link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          className="menu-button"
          type="button"
          aria-expanded={open}
          aria-controls="more-menu"
          onClick={() => setMenuPath(pathname)}
        >
          Menu
        </button>
      </header>
      <main id="main" className="page app-main stack-lg">
        <p className="banner" role="status">
          Development mode. lifeZoi is not signed in and does not have secure storage.
          Answers stay in this browser tab and are removed when the tab closes.
        </p>
        {ready && sample ? (
          <p className="banner banner-sample" role="status">
            Sample data. This is an example, not your information, and it is not saved as your record.
          </p>
        ) : null}
        {children}
        <footer className="footer-note">
          <p>{PROFESSIONAL_NOTICE}</p>
          <p>
            {CRISIS_NOTICE}{" "}
            <a href={sources.samhsa988.url}>SAMHSA: 988 Suicide & Crisis Lifeline</a>
          </p>
        </footer>
      </main>
      <nav className="bottom-nav" aria-label="Primary">
        {primary.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={current(pathname, link.href) ? "page" : undefined}
          >
            <span>{link.short}</span>
          </Link>
        ))}
        <button type="button" aria-expanded={open} onClick={() => setMenuPath(pathname)}>
          <span>More</span>
        </button>
      </nav>
      {open ? (
        <div className="dialog-backdrop" onClick={() => setMenuPath(null)}>
          <div
            className="menu-panel"
            id="more-menu"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            ref={panelRef}
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id={titleId}>More</h2>
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
            <button type="button" onClick={() => setMenuPath(null)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
