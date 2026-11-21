"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { useLocale, useMessages } from "@/components/locale-provider";
import { fmt } from "@/lib/i18n/config";
import { useAccount } from "@/lib/account-store";

type Invite = {
  id: string;
  email: string;
  source: "admin" | "share_care";
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
  revokedAt: string | null;
  joined: boolean;
  expired: boolean;
};

type ListState = { phase: "loading" } | { phase: "ready"; invites: Invite[] } | { phase: "not-set-up" } | { phase: "failed" };

/**
 * Administrator page. The server checks the administrator's sign-in on every
 * request; this page only shows what the server returns.
 */
export function AdminInvitationsView() {
  const account = useAccount();
  const m = useMessages();
  const { locale } = useLocale();
  const a = m.access;
  const fieldId = useId();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [list, setList] = useState<ListState>({ phase: "loading" });
  const isAdmin = account.phase === "ready" && account.isAdmin;

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/invitations", { cache: "no-store" });
      const body = (await response.json().catch(() => ({}))) as { invites?: Invite[]; code?: string };
      if (response.ok && Array.isArray(body.invites)) return setList({ phase: "ready", invites: body.invites });
      setList(body.code === "not-set-up" ? { phase: "not-set-up" } : { phase: "failed" });
    } catch {
      setList({ phase: "failed" });
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    void fetch("/api/admin/invitations", { cache: "no-store" })
      .then(async (response) => {
        const body = (await response.json().catch(() => ({}))) as { invites?: Invite[]; code?: string };
        if (cancelled) return;
        if (response.ok && Array.isArray(body.invites)) return setList({ phase: "ready", invites: body.invites });
        setList(body.code === "not-set-up" ? { phase: "not-set-up" } : { phase: "failed" });
      })
      .catch(() => {
        if (!cancelled) setList({ phase: "failed" });
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const date = (iso: string) => new Date(iso).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });

  const status = (invite: Invite) => {
    if (invite.revokedAt) return a.statusRevoked;
    if (invite.joined) return a.statusJoined;
    if (invite.usedAt) return a.statusSent;
    if (invite.expired) return a.statusExpired;
    return a.statusWaiting;
  };

  if (account.phase === "loading") {
    return <p className="card" role="status">{m.common.checkingSignIn}</p>;
  }
  if (!isAdmin) {
    return (
      <div className="stack-lg narrow">
        <h1>{a.adminTitle}</h1>
        <p className="card">{a.adminOnly}</p>
      </div>
    );
  }

  return (
    <div className="stack-lg narrow">
      <div>
        <p className="kicker">{a.adminKicker}</p>
        <h1>{a.adminTitle}</h1>
        <p className="lede">{a.adminIntro}</p>
      </div>
      <section className="card stack">
        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            setBusy(true);
            setNotice(null);
            const sentTo = email.trim();
            void fetch("/api/admin/invitations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: sentTo }),
              cache: "no-store",
            })
              .then(async (response) => {
                const body = (await response.json().catch(() => ({}))) as { code?: string };
                if (response.ok && body.code === "sent") {
                  setNotice({ ok: true, text: fmt(a.adminSent, { email: sentTo }) });
                  setEmail("");
                  await load();
                } else if (body.code === "exists") setNotice({ ok: false, text: a.adminExists });
                else if (body.code === "email") setNotice({ ok: false, text: a.registerEmail });
                else if (body.code === "not-set-up") setNotice({ ok: false, text: a.adminNotSetUp });
                else setNotice({ ok: false, text: a.adminFailed });
              })
              .catch(() => setNotice({ ok: false, text: a.adminFailed }))
              .finally(() => setBusy(false));
          }}
        >
          <label className="field" htmlFor={fieldId}>
            <span>{m.common.email}</span>
            <input id={fieldId} type="email" autoComplete="off" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <div className="actions">
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {a.adminSend}
            </button>
          </div>
          {notice ? (
            <p className={notice.ok ? "alert alert-ok" : "alert alert-error"} role={notice.ok ? "status" : "alert"}>
              {notice.text}
            </p>
          ) : null}
        </form>
      </section>
      <section className="card stack">
        <h2>{a.adminListTitle}</h2>
        {list.phase === "loading" ? <p role="status">{a.adminLoading}</p> : null}
        {list.phase === "not-set-up" ? <p>{a.adminNotSetUp}</p> : null}
        {list.phase === "failed" ? <p role="alert">{a.adminListFailed}</p> : null}
        {list.phase === "ready" && list.invites.length === 0 ? <p>{a.adminEmpty}</p> : null}
        {list.phase === "ready" && list.invites.length > 0 ? (
          <ul className="admin-invites">
            {list.invites.map((invite) => (
              <li key={invite.id} className="admin-invite">
                <div>
                  <strong>{invite.email}</strong>
                  <span>
                    {invite.source === "admin" ? a.sourceAdmin : a.sourceCare} · {date(invite.createdAt)} · {status(invite)}
                  </span>
                </div>
                {!invite.revokedAt && !invite.joined ? (
                  <button
                    className="btn btn-ghost"
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setBusy(true);
                      void fetch("/api/admin/invitations", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: invite.id }),
                        cache: "no-store",
                      })
                        .then(() => load())
                        .finally(() => setBusy(false));
                    }}
                  >
                    {a.adminRevoke}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
