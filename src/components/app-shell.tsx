"use client";

import Link from "next/link";
import { CareInviteWatcher } from "@/components/care-invite-watcher";
import { useSession } from "@/components/session-provider";
import { SiteNav } from "@/components/site-nav";
import { useAccount } from "@/lib/account-store";
import { FOOTER_LINKS } from "@/lib/navigation";
import { CRISIS_NOTICE, PROFESSIONAL_NOTICE, sources } from "@/lib/sources";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sample, ready } = useSession();
  const account = useAccount();

  return (
    <>
      <SiteNav />
      <main id="main" className="page app-main stack-lg">
        <p className="banner" role="status">
          {account.phase === "loading"
            ? "Checking sign-in…"
            : account.phase === "ready"
              ? "Signed in. Saved assessment answers, habits, and progress are stored with this account. Sample data is not written to the account."
              : account.phase === "needs-mfa"
                ? "Enter the authenticator code on the Sign in page to finish sign-in. Saved answers stay closed until then."
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
          <nav className="footer-links" aria-label="All pages">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </footer>
      </main>
    </>
  );
}
