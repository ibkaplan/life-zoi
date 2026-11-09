"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { signOutAccount, useAccount } from "@/lib/account-store";
import { isCurrentLink, MEMBER_LINKS, PUBLIC_LINKS } from "@/lib/navigation";

/** One header for every page. The public links never change; signed-in people also get "My space". */
export function SiteNav() {
  const pathname = usePathname() ?? "/";
  const account = useAccount();
  const signedIn = account.phase === "ready";

  return (
    <header className="page site-header">
      <div className="site-brand">
        <Logo />
      </div>
      <div className="site-account">
        {signedIn ? (
          <>
            <Link href="/settings" aria-current={isCurrentLink(pathname, "/settings") ? "page" : undefined}>
              Account
            </Link>
            <button type="button" onClick={() => void signOutAccount()}>
              Sign out
            </button>
          </>
        ) : account.phase === "needs-mfa" ? (
          <Link className="site-signin" href="/sign-in">
            Finish sign-in
          </Link>
        ) : account.phase === "loading" || account.phase === "off" ? null : (
          <Link className="site-signin" href="/sign-in" aria-current={pathname === "/sign-in" ? "page" : undefined}>
            Sign in
          </Link>
        )}
      </div>
      <nav className="site-nav" aria-label="Main">
        {PUBLIC_LINKS.map((link) => (
          <Link key={link.href} href={link.href} aria-current={isCurrentLink(pathname, link.href) ? "page" : undefined}>
            {link.label}
          </Link>
        ))}
      </nav>
      {signedIn ? (
        <nav className="site-subnav" aria-label="My space">
          <span className="site-subnav-label">My space</span>
          {MEMBER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} aria-current={isCurrentLink(pathname, link.href) ? "page" : undefined}>
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
