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
import { useMessages } from "@/components/locale-provider";
import { navLabel } from "@/lib/i18n/nav";
import { sources } from "@/lib/sources";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sample, ready } = useSession();
  const account = useAccount();
  const companion = useCompanion();
  const pathname = usePathname() ?? "/";
  const m = useMessages();

  return (
    <>
      <SiteNav />
      <main id="main" className="page app-main stack-lg" data-dept={departmentFor(pathname)}>
        <p className="banner" role="status">
          {account.phase === "loading"
            ? m.common.checkingSignIn
            : account.phase === "ready"
              ? companion.saveMode === "device"
                ? m.shell.bannerReadyDevice
                : m.shell.bannerReady
              : account.phase === "needs-mfa"
                ? m.shell.bannerNeedsMfa
                : account.phase === "off"
                  ? m.shell.bannerOff
                  : m.shell.bannerSignedOut}
        </p>
        {account.error ? (
          <p className="banner" role="alert">
            {account.error}
          </p>
        ) : null}
        {ready && sample ? (
          <p className="banner banner-sample" role="status">
            {m.shell.sampleBanner}
          </p>
        ) : null}
        <CareInviteWatcher />
        {children}
        <footer className="footer-note">
          <p>{m.shell.professionalNotice}</p>
          <p>
            {m.shell.crisisNotice}{" "}
            <a href={sources.samhsa988.url}>{m.shell.crisisLink}</a>
          </p>
          <nav className="footer-links" aria-label={m.shell.allPages}>
            {FOOTER_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                {navLabel(m, link)}
              </Link>
            ))}
          </nav>
        </footer>
      </main>
    </>
  );
}
