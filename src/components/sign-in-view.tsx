"use client";

import Link from "next/link";
import { AccountPanel } from "@/components/account-panel";
import { useAccount } from "@/lib/account-store";
import { MEMBER_LINKS } from "@/lib/navigation";

export function SignInView() {
  const account = useAccount();

  return (
    <div className="stack-lg narrow">
      <div>
        <p className="kicker">Account</p>
        <h1>{account.phase === "ready" ? "You are signed in" : "Sign in"}</h1>
      </div>
      {account.phase === "ready" ? (
        <section className="card stack">
          <p>Signed in as {account.email ?? "your account"}. Your space is in the menu at the top of every page.</p>
          <div className="actions">
            {MEMBER_LINKS.slice(0, 2).map((link) => (
              <Link key={link.href} className="btn btn-primary" href={link.href}>
                {link.label}
              </Link>
            ))}
            <Link className="btn btn-ghost" href="/settings">
              Account settings
            </Link>
          </div>
        </section>
      ) : (
        <AccountPanel />
      )}
    </div>
  );
}
