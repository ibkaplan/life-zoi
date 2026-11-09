"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { EmailHelpForm, NewPasswordForm } from "@/components/password-forms";
import { signOutAccount, useAccount, verifySignInCode } from "@/lib/account-store";
import { hasRecoveryParams, recoveryLinkProblem } from "@/lib/password-recovery";

type LinkState = { problem: string | null; fromLink: boolean };

// Read the URL once on arrival. The Supabase client may tidy it after it exchanges the code.
let arrival: LinkState | null = null;

function readArrival(): LinkState {
  if (!arrival) {
    const { search, hash } = window.location;
    arrival = { problem: recoveryLinkProblem(search, hash), fromLink: hasRecoveryParams(search, hash) };
  }
  return arrival;
}

function noSubscription() {
  return () => undefined;
}

export function ResetPasswordView() {
  const account = useAccount();
  const link = useSyncExternalStore(noSubscription, readArrival, () => null);
  const [saved, setSaved] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(
    () => () => {
      arrival = null;
    },
    [],
  );

  let body: React.ReactNode;
  if (account.phase === "loading" || link === null) {
    body = <p role="status">Checking the reset link…</p>;
  } else if (account.phase === "off") {
    body = <p>Account sign-in is not configured in this environment, so there is no password to reset.</p>;
  } else if (saved) {
    body = (
      <>
        <p className="alert alert-ok" role="status">
          Your password was changed. You are signed in on this browser.
        </p>
        <div className="actions">
          <Link className="btn btn-primary" href="/dashboard">
            Go to Home
          </Link>
          <Link className="btn btn-ghost" href="/settings">
            Account settings
          </Link>
        </div>
      </>
    );
  } else if (account.phase === "needs-mfa") {
    body = (
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          setBusy(true);
          setCodeError("");
          void verifySignInCode(code).then((error) => {
            setCodeError(error ?? "");
            setBusy(false);
          });
        }}
      >
        <p>This account uses an authenticator app. Enter its 6-digit code, then choose the new password.</p>
        <label className="field" htmlFor="reset-mfa-code">
          <span>6-digit code</span>
          <input
            id="reset-mfa-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
        </label>
        <div className="actions">
          <button className="btn btn-primary" type="submit" disabled={busy}>
            Verify code
          </button>
          <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => void signOutAccount()}>
            Cancel
          </button>
        </div>
        {codeError ? (
          <p className="alert alert-error" role="alert">
            {codeError}
          </p>
        ) : null}
      </form>
    );
  } else if (account.phase === "ready") {
    body = (
      <>
        <p>Signed in as {account.email ?? "your account"}. Choose a new password for this account.</p>
        <NewPasswordForm onSaved={() => setSaved(true)} />
      </>
    );
  } else {
    body = (
      <>
        <p className="alert alert-error" role="alert">
          {link.problem ??
            (link.fromLink
              ? "This reset link could not be opened. It may have expired, been used already, or been opened in a different browser from the one that asked for it."
              : "Open the reset link from your email to set a new password, or request a new link below.")}
        </p>
        <EmailHelpForm mode="reset" />
      </>
    );
  }

  return (
    <div className="stack-lg narrow">
      <div>
        <p className="kicker">Account</p>
        <h1>Set a new password</h1>
      </div>
      <section className="card stack">{body}</section>
      <p className="hint">
        Passwords stay with Supabase Auth. lifeZoi never sees or stores them. <Link href="/settings">Back to Settings</Link>
      </p>
    </div>
  );
}
