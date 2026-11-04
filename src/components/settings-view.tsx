"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountPanel } from "@/components/account-panel";
import { useSession } from "@/components/session-provider";
import { LoadingState } from "@/components/sources";
import { useAccount } from "@/lib/account-store";
import type { AppStatus } from "@/lib/status";

export function SettingsView() {
  const { ready, sample, setSample, clearUserData } = useSession();
  const account = useAccount();
  const [status, setStatus] = useState<AppStatus | null>(null);
  const [statusError, setStatusError] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/status", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("status");
        setStatus((await response.json()) as AppStatus);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStatusError(true);
      });
    return () => controller.abort();
  }, []);

  if (!ready) return <LoadingState label="Loading your session…" />;

  return (
    <div className="stack-lg narrow">
      <div>
        <p className="kicker">Settings</p>
        <h1>Account and privacy</h1>
      </div>
      <AccountPanel />
      <section className="card stack">
        <h2>Storage</h2>
        {statusError ? (
          <p role="alert">The app status could not be loaded.</p>
        ) : status ? (
          <>
            <p>{status.detail}</p>
            <p className="hint">Authentication: {status.authentication}. Storage: {status.persistence}.</p>
          </>
        ) : (
          <p role="status">Checking configuration…</p>
        )}
        <p>
          Signed-in answers are stored for that account under row level security. Without an account, they stay in this browser tab. Sample data is labeled and is not written into an account.
        </p>
        <Link href="/privacy">Read the privacy notes</Link>
      </section>
      <section className="card stack">
        <h2>Sample data</h2>
        <p>The sample is labeled and kept separate from answers you type. It is not a real person.</p>
        {sample ? (
          <button className="btn btn-secondary" type="button" onClick={() => setSample(false)}>
            Return to my session
          </button>
        ) : (
          <button className="btn btn-secondary" type="button" onClick={() => setSample(true)}>
            Preview with sample data
          </button>
        )}
      </section>
      <section className="card stack">
        <h2>{account.phase === "ready" ? "Clear saved answers" : "Delete data in this browser"}</h2>
        <p>
          {account.phase === "ready"
            ? "This clears the saved assessment, scenarios, goals, and check-ins in your account, plus the AI assistant conversation, Change Lab record, Your Life Matters reflections, and wellness notes stored in this tab. It does not delete the login."
            : "This clears the assessment, scenarios, goals, check-ins, AI assistant conversation, Change Lab record, Your Life Matters reflections, wellness check-ins, urge records, moment plans, if-then plans, and nature journal stored in this tab."}
        </p>
        {cleared ? (
          <p className="alert alert-ok" role="status">
            {account.phase === "ready" ? "Saved answers were cleared." : "Data in this tab was cleared."}
          </p>
        ) : null}
        {confirmClear ? (
          <div className="actions">
            <button
              className="btn btn-danger"
              type="button"
              onClick={() => {
                clearUserData();
                setConfirmClear(false);
                setCleared(true);
              }}
            >
              Confirm clear
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => setConfirmClear(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="btn btn-danger" type="button" onClick={() => setConfirmClear(true)}>
            {account.phase === "ready" ? "Clear saved answers" : "Clear data in this browser"}
          </button>
        )}
      </section>
    </div>
  );
}
