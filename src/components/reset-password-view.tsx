"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { EmailHelpForm, NewPasswordForm } from "@/components/password-forms";
import { useMessages } from "@/components/locale-provider";
import { fmt } from "@/lib/i18n/config";
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
  const m = useMessages();
  const r = m.reset;
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
    body = <p role="status">{r.checking}</p>;
  } else if (account.phase === "off") {
    body = <p>{r.off}</p>;
  } else if (saved) {
    body = (
      <>
        <p className="alert alert-ok" role="status">
          {r.changed}
        </p>
        <div className="actions">
          <Link className="btn btn-primary" href="/dashboard">
            {r.goHome}
          </Link>
          <Link className="btn btn-ghost" href="/settings">
            {m.common.accountSettings}
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
        <p>{r.mfa}</p>
        <label className="field" htmlFor="reset-mfa-code">
          <span>{m.common.sixDigitCode}</span>
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
            {m.common.verifyCode}
          </button>
          <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => void signOutAccount()}>
            {m.common.cancel}
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
        <p>{fmt(r.signedInAs, { email: account.email ?? m.common.yourAccount })}</p>
        <NewPasswordForm onSaved={() => setSaved(true)} />
      </>
    );
  } else {
    body = (
      <>
        <p className="alert alert-error" role="alert">
          {link.problem ??
            (link.fromLink
              ? r.linkFailed
              : r.openLink)}
        </p>
        <EmailHelpForm mode="reset" />
      </>
    );
  }

  return (
    <div className="stack-lg narrow">
      <div>
        <p className="kicker">{m.signIn.kicker}</p>
        <h1>{r.title}</h1>
      </div>
      <section className="card stack">{body}</section>
      <p className="hint">
        {r.footer} <Link href="/settings">{r.backToSettings}</Link>
      </p>
    </div>
  );
}
