"use client";

import Link from "next/link";
import { useState } from "react";
import {
  beginAuthenticatorSetup,
  cancelAuthenticatorSetup,
  confirmAuthenticatorSetup,
  deleteSignedInAccount,
  retryAccountLoad,
  signInWithPassword,
  signOutAccount,
  useAccount,
  verifySignInCode,
} from "@/lib/account-store";
import { authenticatorQrMarkup } from "@/lib/mfa";
import { EmailHelpForm, NewPasswordForm } from "@/components/password-forms";
import { useMessages, useT } from "@/components/locale-provider";
import { fmt } from "@/lib/i18n/config";

export function AccountPanel() {
  const account = useAccount();
  const m = useMessages();
  const tr = useT();
  const a = m.accountPanel;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [help, setHelp] = useState<"reset" | "confirm" | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  async function run(action: () => Promise<string | null>) {
    setBusy(true);
    setMessage("");
    const error = await action();
    setMessage(error ?? "");
    setBusy(false);
  }

  if (account.phase === "loading") {
    return (
      <section className="card stack">
        <h2>{a.title}</h2>
        <p role="status">{m.common.checkingSignIn}</p>
      </section>
    );
  }

  if (account.phase === "off") {
    return (
      <section className="card stack">
        <h2>{a.title}</h2>
        <p>{a.off}</p>
      </section>
    );
  }

  return (
    <section className="card stack">
      <h2>{a.title}</h2>
      {account.phase === "ready" ? (
        <>
          <p>
            {fmt(a.signedInAs, { email: account.email ?? m.common.yourAccount })}
            {account.isAdmin ? a.admin : ""}
          </p>
          {account.isAdmin ? (
            <div className="actions">
              <Link className="btn btn-secondary" href="/admin/invitations">
                {m.access.adminLink}
              </Link>
            </div>
          ) : null}
          {account.factorVerified ? (
            <p>{a.mfaOn}</p>
          ) : (
            <p>{a.mfaOffer}</p>
          )}
          {account.enrollment ? (
            <div className="stack">
              <p>{a.scan}</p>
              {authenticatorQrMarkup(account.enrollment.qr) ? (
                <div
                  className="auth-qr"
                  role="img"
                  aria-label={a.qrLabel}
                  dangerouslySetInnerHTML={{ __html: authenticatorQrMarkup(account.enrollment.qr) }}
                />
              ) : (
                <p>{a.qrFailed}</p>
              )}
              <p className="secret-value">{account.enrollment.secret}</p>
              <label className="field" htmlFor="authenticator-confirm">
                <span>{m.common.sixDigitCode}</span>
                <input
                  id="authenticator-confirm"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                />
              </label>
              <div className="actions">
                <button
                  className="btn btn-primary"
                  type="button"
                  disabled={busy}
                  onClick={() => void run(() => confirmAuthenticatorSetup(code))}
                >
                  {a.confirmAuthenticator}
                </button>
                <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => void cancelAuthenticatorSetup()}>
                  {m.common.cancel}
                </button>
              </div>
            </div>
          ) : account.factorVerified ? null : (
            <button className="btn btn-secondary" type="button" disabled={busy} onClick={() => void run(beginAuthenticatorSetup)}>
              {a.setupAuthenticator}
            </button>
          )}
          {changingPassword ? (
            <NewPasswordForm heading={a.changePassword} onDone={() => setChangingPassword(false)} />
          ) : null}
          <div className="actions">
            {changingPassword ? null : (
              <button className="btn btn-secondary" type="button" disabled={busy} onClick={() => setChangingPassword(true)}>
                {a.changePassword}
              </button>
            )}
            <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => void signOutAccount()}>
              {m.common.signOut}
            </button>
            {confirmDelete ? (
              <>
                <button
                  className="btn btn-danger"
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run(async () => {
                      const error = await deleteSignedInAccount();
                      if (!error) setConfirmDelete(false);
                      return error;
                    })
                  }
                >
                  {a.confirmDelete}
                </button>
                <button className="btn btn-ghost" type="button" onClick={() => setConfirmDelete(false)}>
                  {m.common.cancel}
                </button>
              </>
            ) : (
              <button className="btn btn-danger" type="button" onClick={() => setConfirmDelete(true)}>
                {a.deleteAccount}
              </button>
            )}
          </div>
        </>
      ) : null}

      {account.phase === "needs-mfa" ? (
        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            void run(() => verifySignInCode(code));
          }}
        >
          <p>{a.mfaPrompt}</p>
          <label className="field" htmlFor="sign-in-code">
            <span>{m.common.sixDigitCode}</span>
            <input
              id="sign-in-code"
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
              {m.common.signOut}
            </button>
          </div>
        </form>
      ) : null}

      {(account.phase === "signed-out" || account.phase === "error") && help ? (
        <EmailHelpForm initialEmail={email} mode={help} onDone={() => setHelp(null)} />
      ) : null}

      {(account.phase === "signed-out" || account.phase === "error") && !help ? (
        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            void run(() => signInWithPassword(email, password));
          }}
        >
          <p>{a.signInIntro}</p>
          {account.phase === "error" ? (
            <button className="btn btn-secondary" type="button" onClick={() => retryAccountLoad()}>
              {a.retry}
            </button>
          ) : null}
          <label className="field" htmlFor="account-email">
            <span>{m.common.email}</span>
            <input
              id="account-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="field" htmlFor="account-password">
            <span>{m.common.password}</span>
            <input
              id="account-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <div className="actions">
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {m.common.signIn}
            </button>
          </div>
          <div className="actions">
            <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => setHelp("reset")}>
              {a.forgot}
            </button>
          </div>
        </form>
      ) : null}

      {message ? (
        <p className="alert alert-error" role="alert">
          {tr(message)}
        </p>
      ) : null}
      {account.error ? (
        <p className="alert alert-error" role="alert">
          {tr(account.error)}
        </p>
      ) : null}
    </section>
  );
}
