"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { AccountPanel } from "@/components/account-panel";
import { useMessages } from "@/components/locale-provider";
import { fmt } from "@/lib/i18n/config";
import { navLabel } from "@/lib/i18n/nav";
import { useAccount } from "@/lib/account-store";
import { safeNextPath } from "@/lib/auth/public-paths";
import type { NavLink } from "@/lib/navigation";

const NEXT_LINKS: readonly NavLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/my-day", label: "My Day" },
];

export function SignInView() {
  const account = useAccount();
  const m = useMessages();
  const a = m.access;
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"));
  const sawSignedOut = useRef(false);

  // After signing in on this page, continue to the page that asked for it (or My space).
  useEffect(() => {
    if (account.phase === "signed-out" || account.phase === "needs-mfa" || account.phase === "error") {
      sawSignedOut.current = true;
    }
    if (account.phase === "ready" && (sawSignedOut.current || next)) {
      // A full load, so the server sees the new sign-in cookie.
      window.location.assign(next ?? "/");
    }
  }, [account.phase, next]);

  return (
    <div className="stack-lg narrow">
      <div>
        <p className="kicker">{m.signIn.kicker}</p>
        <h1>{account.phase === "ready" ? m.signIn.signedInTitle : a.logInTitle}</h1>
      </div>
      {next && account.phase !== "ready" ? (
        <p className="alert" role="status">
          {a.signInToContinue}
        </p>
      ) : null}
      {account.phase === "ready" ? (
        <section className="card stack">
          <p>{fmt(m.signIn.signedInAs, { email: account.email ?? m.common.yourAccount })}</p>
          <div className="actions">
            {NEXT_LINKS.map((link) => (
              <Link key={link.href} className="btn btn-primary" href={link.href}>
                {navLabel(m, link)}
              </Link>
            ))}
            <Link className="btn btn-ghost" href="/settings">
              {m.common.accountSettings}
            </Link>
          </div>
        </section>
      ) : (
        <>
          <AccountPanel />
          <section className="card card-quiet stack">
            <h2>{a.newHereTitle}</h2>
            <p>{a.newHereText}</p>
            <div className="actions">
              <Link className="btn btn-secondary" href="/#invitation">
                {a.haveInvitation}
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
