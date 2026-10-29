"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/components/session-provider";
import { LoadingState } from "@/components/sources";
import type { AppStatus } from "@/lib/status";

export function SettingsView() {
  const { ready, sample, setSample, clearUserData } = useSession();
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
        <h1>Privacy and this browser</h1>
      </div>
      <section className="card stack">
        <h2>Development mode</h2>
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
          Supabase is the planned place for accounts and saved data. The SQL for row-level security is in the repository, and it is not connected here. Adding environment variables does not sign you in.
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
        <h2>Delete data in this browser</h2>
        <p>This clears the assessment, scenarios, goals, and check-ins stored in this tab. It cannot delete a server account, because there is no account.</p>
        {cleared ? <p className="alert alert-ok" role="status">Data in this tab was cleared.</p> : null}
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
            Clear data in this browser
          </button>
        )}
      </section>
    </div>
  );
}
