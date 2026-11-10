"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountPanel } from "@/components/account-panel";
import { LanguageChoice } from "@/components/language-choice";
import { useMessages, useT } from "@/components/locale-provider";
import { msg } from "@/lib/i18n/translate";
import { fmt } from "@/lib/i18n/config";
import { useSession } from "@/components/session-provider";
import { LoadingState } from "@/components/sources";
import { useAccount } from "@/lib/account-store";
import type { AppStatus } from "@/lib/status";

/** Plain words for the technical status values reported by /api/status. */
const STATUS_WORDS: Record<string, string> = {
  "not-configured": msg("not set up"),
  supabase: msg("Supabase account"),
  development: msg("this browser tab only"),
  account: msg("your account"),
};

export function SettingsView() {
  const { ready, sample, setSample, clearUserData } = useSession();
  const account = useAccount();
  const m = useMessages();
  const t = m.settings;
  const tr = useT();
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

  if (!ready) return <LoadingState label={m.common.loadingSession} />;

  return (
    <div className="stack-lg narrow">
      <div>
        <p className="kicker">{t.kicker}</p>
        <h1>{t.title}</h1>
      </div>
      <section className="card stack">
        <h2>{t.languageTitle}</h2>
        <p>{t.languageText}</p>
        <LanguageChoice />
      </section>
      <AccountPanel />
      <section className="card stack">
        <h2>{t.storage}</h2>
        {statusError ? (
          <p role="alert">{t.statusFailed}</p>
        ) : status ? (
          <>
            <p>{tr(status.detail)}</p>
            <p className="hint">{fmt(t.statusLine, { authentication: tr(STATUS_WORDS[status.authentication]), persistence: tr(STATUS_WORDS[status.persistence]) })}</p>
          </>
        ) : (
          <p role="status">{t.checking}</p>
        )}
        <p>{t.storageText}</p>
        <Link href="/privacy">{t.privacyLink}</Link>
      </section>
      <section className="card stack">
        <h2>{t.sampleTitle}</h2>
        <p>{t.sampleText}</p>
        {sample ? (
          <button className="btn btn-secondary" type="button" onClick={() => setSample(false)}>
            {t.sampleOff}
          </button>
        ) : (
          <button className="btn btn-secondary" type="button" onClick={() => setSample(true)}>
            {t.sampleOn}
          </button>
        )}
      </section>
      <section className="card stack">
        <h2>{account.phase === "ready" ? t.clearSavedTitle : t.clearBrowserTitle}</h2>
        <p>
          {account.phase === "ready"
            ? t.clearSavedText
            : t.clearBrowserText}
        </p>
        {cleared ? (
          <p className="alert alert-ok" role="status">
            {account.phase === "ready" ? t.clearedSaved : t.clearedBrowser}
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
              {t.confirmClear}
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => setConfirmClear(false)}>
              {m.common.cancel}
            </button>
          </div>
        ) : (
          <button className="btn btn-danger" type="button" onClick={() => setConfirmClear(true)}>
            {account.phase === "ready" ? t.clearSavedTitle : t.clearBrowserButton}
          </button>
        )}
      </section>
    </div>
  );
}
