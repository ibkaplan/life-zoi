"use client";

import Link from "next/link";
import { AccountPanel } from "@/components/account-panel";
import { useMessages } from "@/components/locale-provider";
import { fmt } from "@/lib/i18n/config";
import { navLabel } from "@/lib/i18n/nav";
import { useAccount } from "@/lib/account-store";
import type { NavLink } from "@/lib/navigation";

const NEXT_LINKS: readonly NavLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/my-day", label: "My Day" },
];

export function SignInView() {
  const account = useAccount();
  const m = useMessages();

  return (
    <div className="stack-lg narrow">
      <div>
        <p className="kicker">{m.signIn.kicker}</p>
        <h1>{account.phase === "ready" ? m.signIn.signedInTitle : m.signIn.title}</h1>
      </div>
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
        <AccountPanel />
      )}
    </div>
  );
}
