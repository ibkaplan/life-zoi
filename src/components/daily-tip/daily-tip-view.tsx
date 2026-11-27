"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { localClock } from "@/lib/daily-tip/schedule";
import { AREA_LABELS, tipForDate } from "@/lib/daily-tip/tips";
import { DEFAULT_HOUR, SEND_HOURS } from "@/lib/daily-tip/types";
import { LOCALES, LOCALE_META, type Locale } from "@/lib/i18n/config";
import { msg } from "@/lib/i18n/translate";

type Subscription = {
  email: boolean;
  telegram: boolean;
  telegramLinked: boolean;
  locale: Locale;
  sendHour: number;
  timeZone: string;
  lastSentOn: string | null;
};

type Channels = { sending: "on" | "off"; email: boolean; telegram: boolean; telegramBot: string | null };

type State =
  | { phase: "loading" }
  | { phase: "failed"; error: string; notReady: boolean }
  | { phase: "ready"; subscription: Subscription | null; channels: Channels; accountEmail: string };

function deviceZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

async function call(method: "GET" | "POST", body?: unknown) {
  const response = await fetch("/api/daily-tip", {
    method,
    cache: "no-store",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: response.ok, json };
}

export function DailyTipView() {
  const { t, locale } = useLocale();
  const [state, setState] = useState<State>({ phase: "loading" });
  const [email, setEmail] = useState(true);
  const [telegram, setTelegram] = useState(false);
  const [tipLocale, setTipLocale] = useState<Locale>(locale);
  const [hour, setHour] = useState<number>(DEFAULT_HOUR);
  const [zone, setZone] = useState("UTC");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [telegramLink, setTelegramLink] = useState<string | null>(null);

  const today = useMemo(() => tipForDate(localClock(new Date(), zone).date), [zone]);

  const load = useCallback(async () => {
    setState({ phase: "loading" });
    try {
      const { ok, json } = await call("GET");
      if (!ok) {
        setState({ phase: "failed", error: String(json.error ?? msg("Daily tips could not be loaded. Try again later.")), notReady: json.storage === "not-ready" });
        return;
      }
      const subscription = (json.subscription as Subscription | null) ?? null;
      setState({ phase: "ready", subscription, channels: json.channels as Channels, accountEmail: String(json.accountEmail ?? "") });
      if (subscription) {
        setEmail(subscription.email);
        setTelegram(subscription.telegram);
        setTipLocale(subscription.locale);
        setHour(subscription.sendHour);
      }
    } catch {
      setState({ phase: "failed", error: msg("Daily tips could not be loaded. Try again later."), notReady: false });
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setZone(deviceZone());
      void load();
    });
  }, [load]);

  const apply = (json: Record<string, unknown>) => {
    setState((prev) => (prev.phase === "ready" ? { ...prev, subscription: (json.subscription as Subscription | null) ?? null } : prev));
  };

  async function act(body: Record<string, unknown>, success: string) {
    setBusy(true);
    setNote(null);
    try {
      const { ok, json } = await call("POST", body);
      if (!ok) {
        setNote({ kind: "error", text: String(json.error ?? msg("Your choices could not be saved. Try again later.")) });
        return null;
      }
      if ("subscription" in json) apply(json);
      setNote({ kind: "ok", text: success });
      return json;
    } catch {
      setNote({ kind: "error", text: msg("Your choices could not be saved. Try again later.") });
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!email && !telegram) {
      setNote({ kind: "error", text: msg("Choose email, Telegram, or both.") });
      return;
    }
    await act({ action: "save", prefs: { email, telegram, locale: tipLocale, sendHour: hour, timeZone: zone } }, msg("Saved. You can change this at any time."));
  }

  async function makeTelegramLink() {
    const json = await act({ action: "telegram-code" }, msg("Your link is ready. It works for 30 minutes."));
    if (json && typeof json.link === "string") setTelegramLink(json.link);
  }

  async function stop() {
    const json = await act({ action: "unsubscribe" }, msg("Done. LifeZoi will not send you daily tips, and your choices were deleted."));
    if (json) {
      setEmail(true);
      setTelegram(false);
      setTelegramLink(null);
    }
  }

  const hourLabel = (value: number) => `${String(value).padStart(2, "0")}:00`;

  return (
    <div className="stack-lg">
      <section className="stack">
        <p className="kicker">{t("LifeZoi Daily")}</p>
        <h1>{t("A daily tip by email or Telegram")}</h1>
        <p className="lede">
          {t("One short, practical idea a day about movement, sleep, food, water, mind, or people. Choose how and when it reaches you, and stop at any time.")}
        </p>
      </section>

      <section className="card stack" aria-labelledby="tip-today">
        <p className="kicker" id="tip-today">
          {t("Today's tip")} · {t(AREA_LABELS[today.area])}
        </p>
        <p className="lede">{t(today.text)}</p>
        <p className="hint">{t("This is what a daily message looks like. Everyone gets the same general tip on the same day. It is not based on your answers or health records.")}</p>
      </section>

      {state.phase === "loading" ? <p className="hint">{t("Loading your choices…")}</p> : null}

      {state.phase === "failed" ? (
        <section className={state.notReady ? "alert" : "alert alert-error"} role="alert">
          <p>{t(state.error)}</p>
          <button type="button" className="btn btn-secondary btn-small" onClick={() => void load()}>
            {t("Try again")}
          </button>
        </section>
      ) : null}

      {state.phase === "ready" ? (
        <>
          {state.channels.sending === "off" ? (
            <section className="alert alert" role="status">
              <p>
                {t("Sending is not switched on yet. You can save your choices now. Tips start once LifeZoi turns sending on, and this page will say so.")}
              </p>
            </section>
          ) : null}

          <section className="card stack">
            <h2>{t("How and when")}</h2>
            <form className="stack" onSubmit={save} noValidate>
              <fieldset className="stack">
                <legend>{t("Send my tip by")}</legend>
                <label className="check-row">
                  <input type="checkbox" checked={email} onChange={(event) => setEmail(event.target.checked)} />
                  <span>
                    {t("Email")}
                    {state.accountEmail ? <span className="hint"> · {t("to your sign-in address {email}", { email: state.accountEmail })}</span> : null}
                  </span>
                </label>
                <label className="check-row">
                  <input type="checkbox" checked={telegram} onChange={(event) => setTelegram(event.target.checked)} />
                  <span>
                    {t("Telegram")}
                    {!state.channels.telegram ? <span className="hint"> · {t("not connected to LifeZoi yet")}</span> : null}
                  </span>
                </label>
              </fieldset>

              <div className="grid-2">
                <label className="field" htmlFor="tip-language">
                  <span>{t("Language of the tip")}</span>
                  <select id="tip-language" value={tipLocale} onChange={(event) => setTipLocale(event.target.value as Locale)}>
                    {LOCALES.map((code) => (
                      <option key={code} value={code}>
                        {LOCALE_META[code].nativeName}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field" htmlFor="tip-hour">
                  <span>{t("Time of day")}</span>
                  <select id="tip-hour" value={hour} onChange={(event) => setHour(Number(event.target.value))}>
                    {SEND_HOURS.map((value) => (
                      <option key={value} value={value}>
                        {hourLabel(value)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="hint">{t("Time zone: {zone}, taken from this device. Save again from another device to change it.", { zone })}</p>

              <div className="actions">
                <button className="btn btn-primary" type="submit" disabled={busy}>
                  {state.subscription ? t("Save changes") : t("Start my daily tip")}
                </button>
                {state.subscription ? (
                  <button className="btn btn-secondary" type="button" disabled={busy} onClick={() => void stop()}>
                    {t("Stop daily tips")}
                  </button>
                ) : null}
              </div>
              {note ? (
                <p className={note.kind === "error" ? "alert alert-error" : "alert alert-ok"} role={note.kind === "error" ? "alert" : "status"}>
                  {t(note.text)}
                </p>
              ) : null}
            </form>
          </section>

          {state.subscription?.telegram ? (
            <section className="card stack">
              <h2>{t("Connect Telegram")}</h2>
              {!state.channels.telegram ? (
                <p className="hint">{t("LifeZoi's Telegram bot is not set up yet. Your choice is saved, and you can connect it here once the bot is ready.")}</p>
              ) : state.subscription.telegramLinked ? (
                <>
                  <p>{t("Telegram is connected. Tips go to your private chat with the LifeZoi bot.")}</p>
                  <div className="actions">
                    <button type="button" className="btn btn-secondary btn-small" disabled={busy} onClick={() => void act({ action: "telegram-unlink" }, msg("Telegram is disconnected."))}>
                      {t("Disconnect Telegram")}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <ol className="stack">
                    <li>{t("Make a private link below. It works for 30 minutes.")}</li>
                    <li>{t("Open it, and press Start in Telegram.")}</li>
                    <li>{t("Come back here and press “I pressed Start”.")}</li>
                  </ol>
                  <div className="actions">
                    {telegramLink ? (
                      <a className="btn btn-primary" href={telegramLink} target="_blank" rel="noopener noreferrer">
                        {t("Open Telegram")}
                      </a>
                    ) : (
                      <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void makeTelegramLink()}>
                        {t("Make my Telegram link")}
                      </button>
                    )}
                    {telegramLink ? (
                      <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => void act({ action: "telegram-check" }, msg("Telegram is connected."))}>
                        {t("I pressed Start")}
                      </button>
                    ) : null}
                  </div>
                </>
              )}
            </section>
          ) : null}
        </>
      ) : null}

      <details className="card stack">
        <summary>{t("What LifeZoi sends and keeps")}</summary>
        <ul className="stack">
          <li>{t("Only the general tip of the day and a link back to this page. Nothing about your health, answers, or readings.")}</li>
          <li>{t("Email goes only to the address you sign in with. LifeZoi does not keep a second copy of it for tips.")}</li>
          <li>{t("For Telegram, LifeZoi keeps the id of your chat with its bot, and nothing else from Telegram.")}</li>
          <li>{t("Stop daily tips deletes your choices. Deleting your account deletes them too.")}</li>
          <li>{t("Tips are general wellness ideas, not medical advice. Check with your doctor before a big change.")}</li>
        </ul>
        <p className="hint">
          <Link href="/daily">{t("Back to LifeZoi Daily")}</Link>
        </p>
      </details>
    </div>
  );
}
