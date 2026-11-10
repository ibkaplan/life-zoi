"use client";

import Link from "next/link";
import { useMessages } from "@/components/locale-provider";
import { useAccount } from "@/lib/account-store";

export function StorageNote() {
  const account = useAccount();
  const m = useMessages();
  const s = m.storage;
  if (account.phase === "loading") return <p className="home-note">{m.common.checkingSignIn}</p>;
  if (account.phase === "ready") return <p className="home-note">{s.ready}</p>;
  if (account.phase === "needs-mfa") {
    return (
      <p className="home-note">
        {s.needsMfaBefore} <Link href="/settings">{s.settings}</Link>
        {s.needsMfaAfter}
      </p>
    );
  }
  if (account.phase === "off") return <p className="home-note">{s.off}</p>;
  return (
    <p className="home-note">
      {s.signedOutBefore} <Link href="/settings">{s.settings}</Link>
      {s.signedOutAfter}
    </p>
  );
}
