"use client";

import { useState } from "react";
import { useMessages, useT } from "@/components/locale-provider";
import {
  requestPasswordReset,
  resendConfirmationEmail,
  updateAccountPassword,
  type AccountNotice,
} from "@/lib/account-store";

function Notice({ notice }: { notice: AccountNotice | null }) {
  const t = useT();
  if (!notice) return null;
  return notice.ok ? (
    <p className="alert alert-ok" role="status">
      {t(notice.message)}
    </p>
  ) : (
    <p className="alert alert-error" role="alert">
      {t(notice.message)}
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
  const m = useMessages();

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
          ? m.password.resetIntro
          : m.password.confirmIntro}
      </p>
      <label className="field" htmlFor={id}>
        <span>{m.common.email}</span>
        <input id={id} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <div className="actions">
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {mode === "reset" ? m.password.sendReset : m.password.sendConfirm}
        </button>
        {onDone ? (
          <button className="btn btn-ghost" type="button" onClick={onDone}>
            {m.password.backToSignIn}
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
  const m = useMessages();
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
      <p className="hint">{m.password.rules}</p>
      <label className="field" htmlFor="new-password">
        <span>{m.password.newPassword}</span>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <label className="field" htmlFor="new-password-confirm">
        <span>{m.password.repeat}</span>
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
          {m.password.save}
        </button>
        {onDone ? (
          <button className="btn btn-ghost" type="button" onClick={onDone}>
            {m.common.cancel}
          </button>
        ) : null}
      </div>
      <Notice notice={notice} />
    </form>
  );
}
