"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { HeaderMusicButton } from "@/components/background-music/header-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useMessages } from "@/components/locale-provider";
import { Logo } from "@/components/logo";
import { signOutAccount, useAccount } from "@/lib/account-store";
import { navLabel } from "@/lib/i18n/nav";
import {
  currentPageIn,
  isCurrentLink,
  NAV_SECTIONS,
  PHONE_QUICK_SECTIONS,
  sectionFor,
  type NavSection,
} from "@/lib/navigation";

/** Simple line icons for the phone tab bar. Decorative; the label is the name. */
function TabIcon({ name }: { name: "home" | "dashboard" | "movement" | "menu" | "close" }) {
  const paths: Record<typeof name, React.ReactNode> = {
    home: <path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-5.5h-5V21H5a1 1 0 0 1-1-1z" />,
    dashboard: (
      <>
        <rect x="4" y="4" width="7" height="8" rx="1.5" />
        <rect x="13" y="4" width="7" height="5" rx="1.5" />
        <rect x="13" y="11" width="7" height="9" rx="1.5" />
        <rect x="4" y="14" width="7" height="6" rx="1.5" />
      </>
    ),
    movement: (
      <>
        <circle cx="13.5" cy="4.5" r="2" />
        <path d="m9 21 3-6.5 3 2.5v5M7.5 11.5 10 8l4 1 2.5 3.5M12 14.5l1-5.5" />
      </>
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="M6 6l12 12M18 6 6 18" />,
  };
  return (
    <svg className="tab-icon" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {paths[name]}
    </svg>
  );
}

/**
 * One header for every page.
 * Wide screens: the nine main sections in one bar that wraps instead of scrolling, so no item is cut off.
 * Phones and small tablets: a tab bar at the bottom of the screen with Home, Dashboard, Movement,
 * and Menu, which opens every section (and, when signed in, Account and Sign out).
 * Under the bar, the pages of the current section.
 */
export function SiteNav() {
  const pathname = usePathname() ?? "/";
  const account = useAccount();
  const m = useMessages();
  const signedIn = account.phase === "ready";
  const current = sectionFor(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const menuButton = useRef<HTMLButtonElement>(null);

  // Close the phone menu after moving to another page.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const sectionLabel = (section: NavSection) => m.sections[section.key];
  const isCurrentSection = (section: NavSection) => current?.key === section.key;
  const quick = NAV_SECTIONS.filter((section) => PHONE_QUICK_SECTIONS.includes(section.key));
  const currentPage = current ? currentPageIn(current, pathname) : null;

  return (
    <header className="page site-header">
      <div className="site-brand">
        <Logo />
      </div>
      <div className="site-account">
        <HeaderMusicButton />
        <LanguageSwitcher />
        {signedIn ? (
          <>
            <Link className="site-account-wide" href="/settings" aria-current={isCurrentLink(pathname, "/settings") ? "page" : undefined}>
              {m.common.account}
            </Link>
            <button className="site-account-wide" type="button" onClick={() => void signOutAccount()}>
              {m.common.signOut}
            </button>
          </>
        ) : account.phase === "needs-mfa" ? (
          <Link className="site-signin" href="/sign-in">
            {m.shell.finishSignIn}
          </Link>
        ) : account.phase === "loading" || account.phase === "off" ? null : (
          <Link className="site-signin" href="/sign-in" aria-current={pathname === "/sign-in" ? "page" : undefined}>
            {m.common.signIn}
          </Link>
        )}
      </div>

      <nav className="site-nav" aria-label={m.shell.mainNav}>
        <ul className="site-nav-wide">
          {NAV_SECTIONS.map((section) => (
            <li key={section.key}>
              <Link
                href={section.href}
                data-section={section.key}
                aria-current={isCurrentSection(section) ? (pathname === section.href ? "page" : "true") : undefined}
              >
                {sectionLabel(section)}
              </Link>
            </li>
          ))}
        </ul>
        <div className="site-nav-quick">
          {quick.map((section) => (
            <Link
              key={section.key}
              href={section.href}
              data-section={section.key}
              aria-current={isCurrentSection(section) ? (pathname === section.href ? "page" : "true") : undefined}
            >
              <TabIcon name={section.key as "home" | "dashboard" | "movement"} />
              <span>{sectionLabel(section)}</span>
            </Link>
          ))}
          <button
            ref={menuButton}
            type="button"
            className="site-menu-button"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <TabIcon name={menuOpen ? "close" : "menu"} />
            <span>{menuOpen ? m.shell.closeMenu : m.shell.menu}</span>
          </button>
        </div>
        <div id={menuId} className="site-menu" hidden={!menuOpen}>
          {signedIn ? (
            <div className="site-menu-account">
              <Link href="/settings" aria-current={isCurrentLink(pathname, "/settings") ? "page" : undefined}>
                {m.common.account}
              </Link>
              <button type="button" onClick={() => void signOutAccount()}>
                {m.common.signOut}
              </button>
            </div>
          ) : null}
          <p className="site-menu-title">{m.shell.allSections}</p>
          <ul className="site-menu-sections">
            {NAV_SECTIONS.map((section) => (
              <li key={section.key} className="site-menu-section" data-current={isCurrentSection(section) || undefined}>
                <Link
                  className="site-menu-main"
                  href={section.href}
                  data-section={section.key}
                  aria-current={pathname === section.href ? "page" : undefined}
                >
                  {sectionLabel(section)}
                </Link>
                {section.pages.length > 1 ? (
                  <ul className="site-menu-pages">
                    {section.pages
                      .filter((page) => page.href !== section.href)
                      .map((page) => (
                        <li key={page.href}>
                          <Link href={page.href} aria-current={pathname === page.href ? "page" : undefined}>
                            {navLabel(m, page)}
                          </Link>
                        </li>
                      ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {current && current.pages.length > 1 ? (
        <>
          <nav className="site-subnav site-subnav-wide" aria-label={`${sectionLabel(current)}: ${m.shell.sectionPages}`}>
            <span className="site-subnav-label">{sectionLabel(current)}</span>
            {current.pages.map((page) => (
              <Link key={page.href} href={page.href} aria-current={currentPage === page.href ? "page" : undefined}>
                {navLabel(m, page)}
              </Link>
            ))}
          </nav>
          <details key={current.key} className="site-subnav site-subnav-phone">
            <summary>
              <span className="site-subnav-label">{sectionLabel(current)}</span>
              <span className="site-subnav-current">
                {currentPage ? navLabel(m, current.pages.find((page) => page.href === currentPage)!) : m.shell.sectionPages}
              </span>
              <span className="site-subnav-more">{m.shell.sectionPages}</span>
            </summary>
            <nav aria-label={`${sectionLabel(current)}: ${m.shell.sectionPages}`}>
              {current.pages.map((page) => (
                <Link key={page.href} href={page.href} aria-current={currentPage === page.href ? "page" : undefined}>
                  {navLabel(m, page)}
                </Link>
              ))}
            </nav>
          </details>
        </>
      ) : null}
    </header>
  );
}
