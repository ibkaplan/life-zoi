"use client";

import Link from "next/link";
import "@/components/journey/journey.css";
import { usePageFormat } from "@/components/page-format";
import { useSession } from "@/components/session-provider";
import { LoadingState } from "@/components/sources";
import { journeySteps } from "@/lib/journey";
import { assessmentHasAnswers } from "@/lib/labels";

/** Step 1 of the guided start: a friendly welcome and the four steps, with the next one highlighted. */
export function StartView() {
  const { ready, session, sample } = useSession();
  const { t } = usePageFormat();
  if (!ready) return <LoadingState label={t("Loading your session…")} />;
  const saved = !sample && session.history.length > 0;
  const steps = journeySteps({ assessmentSaved: saved, draftStarted: !sample && assessmentHasAnswers(session.draft) });
  const next = steps.find((step) => step.state === "current") ?? steps[1];

  return (
    <div className="stack-lg jr">
      <section className="jr-hero">
        <p className="kicker">{t("Your LifeZoi journey")}</p>
        <h1>{t("Welcome to LifeZoi! Let's build your personal health and longevity plan.")}</h1>
        <p className="lede">
          {t("Four calm steps. You answer what you are comfortable with, LifeZoi explains it in plain words, and you get a plan where every step opens something you can do today.")}
        </p>
        <Link className="btn btn-primary jr-hero-go" href={next.href}>
          {t(next.cta)} <span aria-hidden="true">→</span>
        </Link>
      </section>

      <ol className="jr-steps" aria-label={t("Your four steps")}>
        {steps.map((step, index) => (
          <li key={step.id} className="jr-step" data-state={step.state}>
            <span className="jr-step-mark" aria-hidden="true">
              {step.state === "done" ? "✓" : index + 1}
            </span>
            <div className="jr-step-body">
              <h2>{t(step.title)}</h2>
              <p>{t(step.text)}</p>
              <p className="jr-step-state">
                {step.state === "done" ? t("Done") : step.state === "current" ? t("Ready for you") : t("After the questionnaire")}
              </p>
              {step.id !== "welcome" && step.state !== "next" ? (
                <Link className={step.state === "current" ? "btn btn-primary" : "btn btn-secondary"} href={step.href}>
                  {t(step.cta)}
                </Link>
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      <section className="card stack jr-promises">
        <h2>{t("What to expect")}</h2>
        <ul>
          <li>{t("Every question can be skipped, except a few short ones about daily habits.")}</li>
          <li>{t("LifeZoi is for education and everyday habits. It does not diagnose, does not change medicines, and does not predict how long anyone will live.")}</li>
          <li>{t("When you are signed in, your answers are saved to your own account and you can see them on any device. Otherwise they stay in this browser tab.")}</li>
          <li>{t("Your questionnaire answers are not sent to any AI service.")}</li>
        </ul>
      </section>

      <p>
        <Link className="btn btn-secondary" href="/dashboard">
          {t("Go to my Dashboard")}
        </Link>
      </p>
    </div>
  );
}
