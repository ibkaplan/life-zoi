"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useMessages } from "@/components/locale-provider";
import { Logo } from "@/components/logo";
import { useAccount } from "@/lib/account-store";
import { sources } from "@/lib/sources";

/**
 * Header for visitors. It shows only the logo, the language picker, and Log in.
 * No feature is linked here: members get the full navigation after signing in.
 */
export function PublicHeader() {
  const pathname = usePathname() ?? "/";
  const account = useAccount();
  const m = useMessages();
  const a = m.access;
  return (
    <header className="page site-header public-header">
      <div className="site-brand">
        <Logo />
      </div>
      <div className="site-account">
        <LanguageSwitcher />
        {account.phase === "ready" ? (
          <Link className="site-signin" href="/">
            {a.mySpace}
          </Link>
        ) : pathname === "/sign-in" ? null : (
          <Link className="site-signin" href="/sign-in">
            {a.logIn}
          </Link>
        )}
      </div>
    </header>
  );
}

export function PublicFooter() {
  const m = useMessages();
  return (
    <footer className="page footer-note public-footer">
      <p>{m.shell.professionalNotice}</p>
      <p>
        {m.shell.crisisNotice} <a href={sources.samhsa988.url}>{m.shell.crisisLink}</a>
      </p>
      <nav className="footer-links" aria-label={m.access.publicLinks}>
        <Link href="/">{m.access.home}</Link>
        <Link href="/sign-in">{m.access.logIn}</Link>
        <Link href="/privacy">{m.access.privacy}</Link>
      </nav>
    </footer>
  );
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicHeader />
      <main id="main" className="page public-main stack-lg">
        {children}
      </main>
      <PublicFooter />
    </>
  );
}
