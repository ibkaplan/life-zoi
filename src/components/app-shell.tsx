"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { CareInviteWatcher } from "@/components/care-invite-watcher";
import { Logo } from "@/components/logo";
import { useSession } from "@/components/session-provider";
import { useAccount } from "@/lib/account-store";
import { CRISIS_NOTICE, PROFESSIONAL_NOTICE } from "@/lib/sources";
import { sources } from "@/lib/sources";

const primaryLinks = [
  { href: "/dashboard", label: "Home", short: "Home" },
  { href: "/my-day", label: "My Day", short: "My Day" },
  { href: "/life-matters", label: "Your Life Matters", short: "Matters" },
  { href: "/outlook", label: "Life outlook", short: "Outlook" },
  { href: "/what-if", label: "WHAT IF?", short: "What if" },
  { href: "/academy/meals", label: "Nutrition", short: "Food" },
  { href: "/food-plan", label: "Food & wellness", short: "Meals" },
  { href: "/academy/move", label: "Movement", short: "Move" },
  { href: "/library", label: "Health Library", short: "Library" },
  { href: "/nature", label: "Nature", short: "Nature" },
  { href: "/habit-transformation", label: "Habit Transformation", short: "Habits" },
  { href: "/progress", label: "Progress", short: "Progress" },
  { href: "/profile", label: "Profile", short: "Profile" },
];

const moreLinks = [
  { href: "/assessment", label: "Lifestyle assessment", short: "Assess" },
  { href: "/plan", label: "Improvement plan", short: "Plan" },
  { href: "/wellness-coach", label: "Wellness coach", short: "Coach" },
  { href: "/academy", label: "Academy", short: "Academy" },
  { href: "/choices", label: "Daily choices", short: "Choices" },
  { href: "/urges", label: "Urges", short: "Urges" },
  { href: "/habits", label: "Challenges", short: "Habits" },
  { href: "/ai-assistant", label: "Wellness Assistant", short: "Assist" },
  { href: "/community", label: "Community", short: "People" },
  { href: "/emotional-wellness", label: "Emotional Wellness", short: "Feelings" },
  { href: "/share-the-care", label: "Share the Care", short: "Share" },
  { href: "/settings", label: "Settings", short: "Settings" },
];

const exploreLinks = [
  { href: "/change-lab", label: "Change Lab", short: "Change" },
  { href: "/lab-results", label: "Understand My Lab Results", short: "Labs" },
  { href: "/sugar-detective", label: "Sugar Detective", short: "Sugar" },
  { href: "/food-labels", label: "Food Intelligence", short: "Labels" },
  { href: "/balance-challenge", label: "Balance and Brain Challenge", short: "Balance" },
  { href: "/brain-quiz", label: "Brain & Habit Quiz", short: "Quiz" },
];

const links = [...primaryLinks, ...moreLinks, ...exploreLinks];

const prefixes = [
  "/what-if",
  "/wellness-coach",
  "/academy/meals",
  "/academy/move",
  "/library",
  "/choices",
  "/habits",
  "/urges",
  "/nature",
  "/brain-quiz",
  "/habit-transformation",
  "/food-plan",
  "/emotional-wellness",
  "/share-the-care",
];

function current(pathname: string, href: string) {
  if (prefixes.some((prefix) => href === prefix)) return pathname === href || pathname.startsWith(`${href}/`);
  return pathname === href;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { sample, ready } = useSession();
  const account = useAccount();
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

  const primary = primaryLinks.filter((link) =>
    ["/dashboard", "/outlook", "/what-if", "/habit-transformation", "/nature", "/progress"].includes(link.href),
  );

  return (
    <>
      <header className="page topbar">
        <Logo href="/dashboard" />
        <nav className="nav-desktop" aria-label="Main">
          {primaryLinks.map((link) => (
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
          {account.phase === "loading"
            ? "Checking sign-in…"
            : account.phase === "ready"
              ? "Signed in. Saved assessment answers, habits, and progress are stored with this account. Sample data is not written to the account."
              : account.phase === "needs-mfa"
                ? "Enter the authenticator code in Settings to finish sign-in. Saved answers stay closed until then."
                : account.phase === "off"
                  ? "Account sign-in is not configured. Answers stay in this browser tab and are removed when the tab closes."
                  : "You are not signed in. Answers stay in this browser tab until you sign in. Sample data is not written to an account."}
        </p>
        {account.error ? (
          <p className="banner" role="alert">
            {account.error}
          </p>
        ) : null}
        {ready && sample ? (
          <p className="banner banner-sample" role="status">
            Sample data. This is an example, not your information, and it is not saved as your record.
          </p>
        ) : null}
        <CareInviteWatcher />
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
