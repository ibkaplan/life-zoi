"use client";

import { useState } from "react";
import {
  beginAuthenticatorSetup,
  cancelAuthenticatorSetup,
  confirmAuthenticatorSetup,
  deleteSignedInAccount,
  retryAccountLoad,
  signInWithPassword,
  signOutAccount,
  signUpWithPassword,
  useAccount,
  verifySignInCode,
} from "@/lib/account-store";
import { authenticatorQrMarkup } from "@/lib/mfa";
import { EmailHelpForm, NewPasswordForm } from "@/components/password-forms";

export function AccountPanel() {
  const account = useAccount();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [confirmEmail, setConfirmEmail] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [help, setHelp] = useState<"reset" | "confirm" | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  async function run(action: () => Promise<string | null>) {
    setBusy(true);
    setMessage("");
    setConfirmEmail(false);
    const error = await action();
    setMessage(error ?? "");
    setBusy(false);
  }

  if (account.phase === "loading") {
    return (
      <section className="card stack">
        <h2>Account</h2>
        <p role="status">Checking sign-in…</p>
      </section>
    );
  }

  if (account.phase === "off") {
    return (
      <section className="card stack">
        <h2>Account</h2>
        <p>Account sign-in is not configured in this environment. Answers stay in this browser tab.</p>
      </section>
    );
  }

  return (
    <section className="card stack">
      <h2>Account</h2>
      {account.phase === "ready" ? (
        <>
          <p>
            Signed in as {account.email ?? "your account"}. Assessment answers, habits, and progress save to this account.
            {account.isAdmin ? " This is the admin account." : ""}
          </p>
          {account.factorVerified ? (
            <p>An authenticator app is on. The next sign-in will ask for a 6-digit code.</p>
          ) : (
            <p>You can add an authenticator app. Google Authenticator and other TOTP apps work. No paid add-on is used.</p>
          )}
          {account.enrollment ? (
            <div className="stack">
              <p>Scan this QR code or enter the secret in your authenticator app, then confirm the 6-digit code.</p>
              {authenticatorQrMarkup(account.enrollment.qr) ? (
                <div
                  className="auth-qr"
                  role="img"
                  aria-label="QR code for the authenticator app"
                  dangerouslySetInnerHTML={{ __html: authenticatorQrMarkup(account.enrollment.qr) }}
                />
              ) : (
                <p>The QR code could not be shown. Enter the secret in your authenticator app.</p>
              )}
              <p className="secret-value">{account.enrollment.secret}</p>
              <label className="field" htmlFor="authenticator-confirm">
                <span>6-digit code</span>
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
                  Confirm authenticator
                </button>
                <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => void cancelAuthenticatorSetup()}>
                  Cancel
                </button>
              </div>
            </div>
          ) : account.factorVerified ? null : (
            <button className="btn btn-secondary" type="button" disabled={busy} onClick={() => void run(beginAuthenticatorSetup)}>
              Set up authenticator app
            </button>
          )}
          {changingPassword ? (
            <NewPasswordForm heading="Change password" onDone={() => setChangingPassword(false)} />
          ) : null}
          <div className="actions">
            {changingPassword ? null : (
              <button className="btn btn-secondary" type="button" disabled={busy} onClick={() => setChangingPassword(true)}>
                Change password
              </button>
            )}
            <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => void signOutAccount()}>
              Sign out
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
                  Confirm delete account
                </button>
                <button className="btn btn-ghost" type="button" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </button>
              </>
            ) : (
              <button className="btn btn-danger" type="button" onClick={() => setConfirmDelete(true)}>
                Delete account
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
          <p>Enter the 6-digit code from your authenticator app. Saved answers stay closed until this code is accepted.</p>
          <label className="field" htmlFor="sign-in-code">
            <span>6-digit code</span>
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
              Verify code
            </button>
            <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => void signOutAccount()}>
              Sign out
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
          <p>Create an account or sign in with email and a password. Passwords stay with Supabase Auth.</p>
          {account.phase === "error" ? (
            <button className="btn btn-secondary" type="button" onClick={() => retryAccountLoad()}>
              Try loading saved answers again
            </button>
          ) : null}
          <label className="field" htmlFor="account-email">
            <span>Email</span>
            <input
              id="account-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="field" htmlFor="account-password">
            <span>Password</span>
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
              Sign in
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  const result = await signUpWithPassword(email, password);
                  setConfirmEmail(result.confirmEmail);
                  return result.error;
                })
              }
            >
              Create account
            </button>
          </div>
          <div className="actions">
            <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => setHelp("reset")}>
              Forgot password?
            </button>
            <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => setHelp("confirm")}>
              Resend confirmation email
            </button>
          </div>
        </form>
      ) : null}

      {confirmEmail && !help ? (
        <p className="alert alert-ok" role="status">
          Check your email and confirm this account, then sign in. Email confirmation stays on.
        </p>
      ) : null}
      {message ? (
        <p className="alert alert-error" role="alert">
          {message}
        </p>
      ) : null}
      {account.error ? (
        <p className="alert alert-error" role="alert">
          {account.error}
        </p>
      ) : null}
    </section>
  );
}
