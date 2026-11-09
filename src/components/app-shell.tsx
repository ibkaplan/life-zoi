"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CareInviteWatcher } from "@/components/care-invite-watcher";
import { useSession } from "@/components/session-provider";
import { SiteNav } from "@/components/site-nav";
import { useAccount } from "@/lib/account-store";
import { useCompanion } from "@/lib/companion/store";
import { departmentFor } from "@/lib/departments";
import { FOOTER_LINKS } from "@/lib/navigation";
import { CRISIS_NOTICE, PROFESSIONAL_NOTICE, sources } from "@/lib/sources";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sample, ready } = useSession();
  const account = useAccount();
  const companion = useCompanion();
  const pathname = usePathname() ?? "/";

  return (
    <>
      <SiteNav />
      <main id="main" className="page app-main stack-lg" data-dept={departmentFor(pathname)}>
        <p className="banner" role="status">
          {account.phase === "loading"
            ? "Checking sign-in…"
            : account.phase === "ready"
              ? companion.saveMode === "device"
                ? "Signed in. Your assessment, habits, and check-ins are saved to your account. Daily activities, reading, and games are saved on this device until the account's daily-progress table is set up."
                : "Signed in. Your assessment, habits, plans, and daily progress are saved to your account. Sample data is never written to the account."
              : account.phase === "needs-mfa"
                ? "Enter the authenticator code on the Sign in page to finish sign-in. Saved answers stay closed until then."
                : account.phase === "off"
                  ? "Account sign-in is not set up on this site. Assessment answers stay in this browser tab until it closes. Daily activities, reading, and games stay in this browser on this device."
                  : "You are not signed in. Assessment answers stay in this browser tab until it closes. Daily activities, reading, and games stay in this browser on this device. Sign in to keep everything in your account."}
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
