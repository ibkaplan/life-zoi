"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
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

/** A small gold star beside Reviews & Feedback. Decorative; the label is the name. */
function SectionMark({ section }: { section: NavSection }) {
  if (section.key !== "reviews") return null;
  return (
    <svg className="nav-star" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path d="M12 2.8l2.75 5.6 6.15.9-4.45 4.33 1.05 6.12L12 16.87l-5.5 2.88 1.05-6.12L3.1 9.3l6.15-.9z" />
    </svg>
  );
}

/**
 * The pages of the current section on wide screens, always on one line.
 * Every page is measured in a hidden copy of the row; the pages that fit are shown, and the rest
 * go into a "More" list at the end, so a long section never wraps onto a second line.
 * The current page always stays visible.
 */
function WideSubnav({
  label,
  ariaLabel,
  moreLabel,
  pages,
  currentPage,
  pathname,
}: {
  label: string;
  ariaLabel: string;
  moreLabel: string;
  pages: { href: string; label: string }[];
  currentPage: string | null;
  pathname: string;
}) {
  const row = useRef<HTMLElement>(null);
  const measure = useRef<HTMLDivElement>(null);
  const more = useRef<HTMLDetailsElement>(null);
  const [fit, setFit] = useState(pages.length);

  // Close the More list after moving to another page, on Escape, or on a click outside it.
  useEffect(() => {
    if (more.current) more.current.open = false;
  }, [pathname]);

  useEffect(() => {
    const close = (event: Event) => {
      const list = more.current;
      if (!list?.open) return;
      if (event instanceof KeyboardEvent) {
        if (event.key !== "Escape") return;
        list.open = false;
        list.querySelector("summary")?.focus();
        return;
      }
      if (!list.contains(event.target as Node)) list.open = false;
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", close);
    };
  }, []);

  const pagesKey = pages.map((page) => `${page.href}=${page.label}`).join("|");

  useLayoutEffect(() => {
    const nav = row.current;
    const box = measure.current;
    if (!nav || !box) return;
    const compute = () => {
      const items = Array.from(box.querySelectorAll<HTMLElement>("[data-measure]"));
      const labelWidth = (box.querySelector<HTMLElement>("[data-measure-label]")?.offsetWidth ?? 0) + 8;
      const moreWidth = (box.querySelector<HTMLElement>("[data-measure-more]")?.offsetWidth ?? 0) + 8;
      const style = getComputedStyle(nav);
      const available = nav.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const widths = items.map((item) => item.offsetWidth + 3.2);
      const total = labelWidth + widths.reduce((sum, width) => sum + width, 0);
      if (total <= available) {
        setFit(pages.length);
        return;
      }
      let used = labelWidth + moreWidth;
      let count = 0;
      for (const width of widths) {
        if (used + width > available) break;
        used += width;
        count += 1;
      }
      setFit(Math.max(1, count));
    };
    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(nav);
    void document.fonts?.ready.then(compute);
    return () => observer.disconnect();
  }, [pagesKey, pages.length]);

  // Keep the current page visible: if it would fall into More, it takes the last visible place.
  const order = pages.map((_, index) => index);
  const currentIndex = pages.findIndex((page) => page.href === currentPage);
  if (fit < pages.length && currentIndex >= fit) {
    order.splice(currentIndex, 1);
    order.splice(fit - 1, 0, currentIndex);
  }
  const shown = order.slice(0, fit).map((index) => pages[index]);
  const hidden = order.slice(fit).map((index) => pages[index]);

  return (
    <nav ref={row} className="site-subnav site-subnav-wide" aria-label={ariaLabel}>
      <span className="site-subnav-label">{label}</span>
      {shown.map((page) => (
        <Link key={page.href} href={page.href} aria-current={currentPage === page.href ? "page" : undefined}>
          {page.label}
        </Link>
      ))}
      {hidden.length > 0 ? (
        <details ref={more} className="site-subnav-more-list">
          <summary>{moreLabel}</summary>
          <ul>
            {hidden.map((page) => (
              <li key={page.href}>
                <Link href={page.href} aria-current={currentPage === page.href ? "page" : undefined}>
                  {page.label}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
      <div ref={measure} className="site-subnav-measure" aria-hidden="true">
        <span className="site-subnav-label" data-measure-label>
          {label}
        </span>
        {pages.map((page) => (
          <span key={page.href} className="site-subnav-measure-item" data-measure>
            {page.label}
          </span>
        ))}
        <span className="site-subnav-measure-item site-subnav-measure-more" data-measure-more>
          {moreLabel} ▾
        </span>
      </div>
    </nav>
  );
}

/**
 * One header for every page.
 * Wide screens: the eleven main sections on one line, with short labels (the full name is the
 * tooltip and is used everywhere else), in a bar that wraps instead of scrolling if it must.
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
  const shortLabel = (section: NavSection) => m.sectionsShort[section.key];
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
                title={shortLabel(section) !== sectionLabel(section) ? sectionLabel(section) : undefined}
                aria-current={isCurrentSection(section) ? (pathname === section.href ? "page" : "true") : undefined}
              >
                <SectionMark section={section} />
                {shortLabel(section)}
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
                  <SectionMark section={section} />
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
          <WideSubnav
            key={current.key}
            label={sectionLabel(current)}
            ariaLabel={`${sectionLabel(current)}: ${m.shell.sectionPages}`}
            moreLabel={m.shell.morePages}
            pages={current.pages.map((page) => ({ href: page.href, label: navLabel(m, page) }))}
            currentPage={currentPage}
            pathname={pathname}
          />
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
