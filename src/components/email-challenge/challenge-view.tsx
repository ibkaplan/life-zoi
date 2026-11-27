"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "@/components/email-challenge/challenge.css";
import { useLocale } from "@/components/locale-provider";
import { CHALLENGE_DAYS } from "@/lib/email-challenge/content";

type Status = { sending: boolean; storage: string; member: { joined: boolean; daysSent: number } | null };
type Phase = "idle" | "saving" | "check-inbox" | "joined" | "stopped";

/** The public 7-day challenge page: the seven tasks, and a sign-up with explicit consent. */
export function ChallengeView() {
  const { locale, t } = useLocale();
  const [status, setStatus] = useState<Status | null>(null);
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [consent, setConsent] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/challenge", { cache: "no-store", signal: controller.signal })
      .then((response) => (response.ok ? (response.json() as Promise<Status>) : null))
      .then((value) => {
        if (!value) return;
        setStatus(value);
        if (value.member?.joined) setPhase("joined");
      })
      .catch(() => null);
    return () => controller.abort();
  }, []);

  const member = status?.member ?? null;

  async function join(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!consent) {
      setError(t("Tick the box to agree to the emails first."));
      return;
    }
    setPhase("saving");
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const response = await fetch("/api/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent, locale, timeZone, website }),
      });
      const body = (await response.json().catch(() => ({}))) as { state?: Phase; error?: string };
      if (!response.ok) {
        setError(t(body.error ?? "Your sign-up could not be saved. Try again later."));
        setPhase("idle");
        return;
      }
      setPhase(body.state === "joined" ? "joined" : "check-inbox");
    } catch {
      setError(t("Your sign-up could not be saved. Try again later."));
      setPhase("idle");
    }
  }

  async function leave() {
    setError(null);
    const response = await fetch("/api/challenge", { method: "DELETE" }).catch(() => null);
    if (response?.ok) setPhase("stopped");
    else setError(t("That did not work. Try again later."));
  }

  return (
    <div className="stack-lg">
      <section className="ch-hero">
        <p className="kicker">{t("Free · 7 days · one email a day")}</p>
        <h1>{t("The LifeZoi 7-day challenge")}</h1>
        <p className="lede">
          {t("One short, everyday task a day for a week: water, walking, breathing, food, sleep, people, and a look back. Each one takes a few minutes and can be made smaller.")}
        </p>
        <a className="btn btn-primary" href="#join" style={{ justifySelf: "start" }}>
          {t("Join the challenge")}
        </a>
      </section>

      <section className="stack" aria-labelledby="ch-days-title">
        <h2 id="ch-days-title">{t("The seven days")}</h2>
        <p className="ch-small">{t("You can follow along right here, with or without the emails.")}</p>
        <ol className="ch-days">
          {CHALLENGE_DAYS.map((item) => {
            const text = item[locale];
            return (
              <li key={item.day} className="ch-day">
                <span className="ch-day-num">{t("Day {day}", { day: item.day })}</span>
                <h3>{text.title}</h3>
                <p>{text.task}</p>
                <p className="ch-small">{text.why}</p>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="card stack" id="join" aria-labelledby="ch-join-title">
        <h2 id="ch-join-title">{t("Get one task by email each day")}</h2>

        {status && !status.sending ? (
          <p className="ch-status" role="status">
            {t("Emails are not switched on yet. You can sign up now; nothing is sent until LifeZoi starts sending, and then you will get a confirmation email first.")}
          </p>
        ) : null}

        {phase === "check-inbox" ? (
          <p className="ch-status" role="status">
            {t("Thank you. Check your inbox for a confirmation email. The challenge starts only after you confirm, and you can stop it at any time.")}
          </p>
        ) : phase === "joined" ? (
          <div className="stack">
            <p className="ch-status" role="status">
              {member && member.daysSent > 0
                ? t("You are in the challenge. Emails sent so far: {count} of 7.", { count: member.daysSent })
                : t("You are in the challenge. The emails go to your account address.")}
            </p>
            <p>
              <button type="button" className="btn btn-secondary" onClick={leave}>
                {t("Stop the challenge emails")}
              </button>
            </p>
          </div>
        ) : phase === "stopped" ? (
          <p className="ch-status" role="status">
            {t("Done. No more challenge emails will be sent, and your address was deleted.")}
          </p>
        ) : (
          <form className="ch-form" onSubmit={join} noValidate>
            {member ? (
              <p>{t("The emails will go to the address of your LifeZoi account.")}</p>
            ) : (
              <label className="field">
                <span>{t("Your email address")}</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
            )}
            <label className="ch-hidden" aria-hidden="true">
              Website
              <input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
            </label>
            <label className="ch-consent">
              <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
              <span>
                {t("Yes, send me the LifeZoi 7-day challenge: one email a day for seven days. I can stop at any time with the link in every email.")}
              </span>
            </label>
            {error ? (
              <p className="field-error" role="alert">
                {error}
              </p>
            ) : null}
            <button type="submit" className="btn btn-primary" disabled={phase === "saving"}>
              {phase === "saving" ? t("Saving…") : t("Join the challenge")}
            </button>
          </form>
        )}

        <div className="stack ch-small">
          <h3>{t("What happens to your address")}</h3>
          <ul>
            <li>{t("LifeZoi keeps only your email address, language, time zone, and when you agreed. No health information is asked for or stored.")}</li>
            <li>{t("It is used only for these seven emails. It is not shared, sold, or sent to any AI service.")}</li>
            <li>{t("Every email has a one-click stop link. Stopping deletes your address. After day 7 it is deleted too, and an address that is never confirmed is deleted after 14 days.")}</li>
            <li>{t("The tasks are everyday habits for education. They are not medical advice. If you have a health condition, check with your doctor first.")}</li>
          </ul>
          <p>
            <Link href="/privacy">{t("Read the privacy page")}</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
