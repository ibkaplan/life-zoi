"use client";

import Link from "next/link";
import { useAccount } from "@/lib/account-store";

export function StorageNote() {
  const account = useAccount();
  if (account.phase === "loading") return <p className="home-note">Checking sign-in…</p>;
  if (account.phase === "ready") {
    return (
      <p className="home-note">
        Signed in. Assessment answers, habits, and progress are saved with your account. Sample data is not saved to the account. lifeZoi does not diagnose or predict how long someone will live.
      </p>
    );
  }
  if (account.phase === "needs-mfa") {
    return (
      <p className="home-note">
        Finish sign-in with your authenticator code in <Link href="/settings">Settings</Link>. Saved answers stay closed until then.
      </p>
    );
  }
  if (account.phase === "off") {
    return (
      <p className="home-note">
        Account sign-in is not configured here. Answers stay in this browser tab until you close it. They are not a medical record.
      </p>
    );
  }
  return (
    <p className="home-note">
      You are not signed in. Answers stay in this browser tab until you close it or you sign in from <Link href="/settings">Settings</Link>. Sample data is not saved to an account.
    </p>
  );
}
