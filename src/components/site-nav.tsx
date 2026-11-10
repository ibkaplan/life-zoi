"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeaderMusicButton } from "@/components/background-music/header-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useMessages } from "@/components/locale-provider";
import { Logo } from "@/components/logo";
import { signOutAccount, useAccount } from "@/lib/account-store";
import { navLabel } from "@/lib/i18n/nav";
import { isCurrentLink, MEMBER_LINKS, PUBLIC_LINKS } from "@/lib/navigation";

/** One header for every page. The public links never change; signed-in people also get "My space". */
export function SiteNav() {
  const pathname = usePathname() ?? "/";
  const account = useAccount();
  const m = useMessages();
  const signedIn = account.phase === "ready";

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
            <Link href="/settings" aria-current={isCurrentLink(pathname, "/settings") ? "page" : undefined}>
              {m.common.account}
            </Link>
            <button type="button" onClick={() => void signOutAccount()}>
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
        {PUBLIC_LINKS.map((link) => (
          <Link key={link.href} href={link.href} aria-current={isCurrentLink(pathname, link.href) ? "page" : undefined}>
            {navLabel(m, link)}
          </Link>
        ))}
      </nav>
      {signedIn ? (
        <nav className="site-subnav" aria-label={m.shell.mySpace}>
          <span className="site-subnav-label">{m.shell.mySpace}</span>
          {MEMBER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} aria-current={isCurrentLink(pathname, link.href) ? "page" : undefined}>
              {navLabel(m, link)}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
