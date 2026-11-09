"use client";

import { useState } from "react";
import {
  requestPasswordReset,
  resendConfirmationEmail,
  updateAccountPassword,
  type AccountNotice,
} from "@/lib/account-store";

function Notice({ notice }: { notice: AccountNotice | null }) {
  if (!notice) return null;
  return notice.ok ? (
    <p className="alert alert-ok" role="status">
      {notice.message}
    </p>
  ) : (
    <p className="alert alert-error" role="alert">
      {notice.message}
    </p>
  );
}

/** Asks for a reset link or a new confirmation email. The answer does not say whether an account exists. */
export function EmailHelpForm({
  initialEmail = "",
  mode,
  onDone,
}: {
  initialEmail?: string;
  mode: "reset" | "confirm";
  onDone?: () => void;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<AccountNotice | null>(null);
  const id = mode === "reset" ? "reset-email" : "confirm-email";

  return (
    <form
      className="stack"
      onSubmit={(event) => {
        event.preventDefault();
        setBusy(true);
        setNotice(null);
        const send = mode === "reset" ? requestPasswordReset : resendConfirmationEmail;
        void send(email).then((result) => {
          setNotice(result);
          setBusy(false);
        });
      }}
    >
      <p>
        {mode === "reset"
          ? "Enter the email you signed up with. We will send a link to set a new password."
          : "Enter the email you signed up with. We will send the confirmation message again."}
      </p>
      <label className="field" htmlFor={id}>
        <span>Email</span>
        <input id={id} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <div className="actions">
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {mode === "reset" ? "Send reset link" : "Send confirmation again"}
        </button>
        {onDone ? (
          <button className="btn btn-ghost" type="button" onClick={onDone}>
            Back to sign in
          </button>
        ) : null}
      </div>
      <Notice notice={notice} />
    </form>
  );
}

/** Sets a new password for the signed-in account, or for the session a reset link opened. */
export function NewPasswordForm({
  heading,
  onDone,
  onSaved,
}: {
  heading?: string;
  onDone?: () => void;
  onSaved?: () => void;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<AccountNotice | null>(null);

  return (
    <form
      className="stack"
      onSubmit={(event) => {
        event.preventDefault();
        setBusy(true);
        setNotice(null);
        void updateAccountPassword(password, confirm).then((result) => {
          setNotice(result);
          setBusy(false);
          if (result.ok) {
            setPassword("");
            setConfirm("");
            onSaved?.();
          }
        });
      }}
    >
      {heading ? <h3>{heading}</h3> : null}
      <p className="hint">Use 8 to 72 characters. A longer phrase is easier to remember and harder to guess.</p>
      <label className="field" htmlFor="new-password">
        <span>New password</span>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <label className="field" htmlFor="new-password-confirm">
        <span>Type the new password again</span>
        <input
          id="new-password-confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
        />
      </label>
      <div className="actions">
        <button className="btn btn-primary" type="submit" disabled={busy}>
          Save new password
        </button>
        {onDone ? (
          <button className="btn btn-ghost" type="button" onClick={onDone}>
            Cancel
          </button>
        ) : null}
      </div>
      <Notice notice={notice} />
    </form>
  );
}
