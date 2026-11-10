"use client";

import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import { MorningWelcome } from "@/components/background-music/morning-welcome";
import { RecommendationsPanel } from "@/components/recommendations-panel";
import { fmt, LOCALE_META } from "@/lib/i18n/config";
import { useSession } from "@/components/session-provider";
import { formatMonth, localISODate, monthKey } from "@/lib/dates";
import { assessmentHasAnswers } from "@/lib/labels";
import { LoadingState } from "@/components/sources";
import { DIGNITY_NOTE, purposeReflection } from "@/lib/purpose";

export function DashboardView() {
  const { ready, session, sample } = useSession();
  const { locale, messages: m } = useLocale();
  const d = m.dashboard;
  const l = m.labels;
  if (!ready) return <LoadingState label={m.common.loadingSession} />;

  const latest = session.history[0] ?? null;
  const draftStarted = assessmentHasAnswers(session.draft);
  const month = monthKey(localISODate());
  const monthCheckIns = session.checkIns.filter((item) => item.date.startsWith(month));
  const done = monthCheckIns.filter((item) => item.done).length;
  const name = latest?.answers.displayName || session.draft.displayName;

  return (
    <div className="stack-lg">
      <MorningWelcome />
      <section className="stack">
        <p className="kicker">{d.kicker}</p>
        <h1>{name ? fmt(d.welcomeName, { name }) : d.welcome}</h1>
        <p className="lede">{d.lede}</p>
      </section>
      <article className="card assistant-card stack">
        <p className="kicker">{d.assistantKicker}</p>
        <h2>{d.assistantTitle}</h2>
        <p>{d.assistantText}</p>
        <p className="hint">{d.assistantHint}</p>
        <Link className="btn assistant-send" href="/ai-assistant">
          {d.assistantOpen}
        </Link>
      </article>
      <article className="card stack">
        <p className="kicker">{d.labKicker}</p>
        <h2>{d.labTitle}</h2>
        <p>{d.labText}</p>
        <div className="home-actions">
          <Link className="btn btn-primary" href="/change-lab">{d.labOpen}</Link>
          <Link className="btn btn-secondary" href="/lab-results">{d.labExample}</Link>
        </div>
      </article>
      <div className="grid-2">
        <article className="card stack">
          <h2>{d.assessmentTitle}</h2>
          <p>
            {latest
              ? d.assessmentLatest
              : draftStarted
                ? d.assessmentStarted
                : d.assessmentEmpty}
          </p>
          <Link className="btn btn-primary" href="/assessment">
            {latest ? d.update : draftStarted ? d.continueAssessment : d.start}
          </Link>
        </article>
        <article className="card stack">
          <h2>WHAT IF?</h2>
          <p>{d.whatIfText}</p>
          <Link className="btn btn-secondary" href="/what-if">
            {d.whatIfOpen}
          </Link>
        </article>
      </div>
      <article className="card stack">
        <p className="kicker">{d.mattersKicker}</p>
        <h2>{d.mattersTitle}</h2>
        <p>{d.mattersText}</p>
        <Link className="btn btn-primary" href="/life-matters">{d.mattersOpen}</Link>
      </article>
      {latest?.answers.purposeHope ? (
        <section className="card stack" aria-labelledby="purpose-hope-title">
          <h2 id="purpose-hope-title">{d.hopeTitle}</h2>
          <p>{purposeReflection(latest.answers.purposeHope)}</p>
          <p>{DIGNITY_NOTE}</p>
          <p className="hint">{d.hopeHint}</p>
        </section>
      ) : null}
      <section className="card stack">
        <h2>{d.overview}</h2>
        {latest ? (
          <dl className="review-list">
            {latest.answers.ageRange ? (
              <div>
                <dt>{d.ageRange}</dt>
                <dd>{l.age[latest.answers.ageRange]}</dd>
              </div>
            ) : null}
            <div>
              <dt>{d.sleep}</dt>
              <dd>
                {fmt(d.sleepValue, { hours: latest.answers.sleepHours })}
                {latest.answers.sleepQuality
                  ? `, ${l.sleepQuality[latest.answers.sleepQuality]}`
                  : ""}
              </dd>
            </div>
            <div>
              <dt>{d.movement}</dt>
              <dd>
                {fmt(d.movementValue, { days: latest.answers.activityDays, minutes: latest.answers.activityMinutes || "0" })}
              </dd>
            </div>
            <div>
              <dt>{d.focus}</dt>
              <dd>{latest.answers.goals.map((goal) => l.goal[goal]).join(", ")}</dd>
            </div>
          </dl>
        ) : (
          <p>{d.noAssessment}</p>
        )}
        {sample ? <p className="hint">{d.fromSample}</p> : null}
      </section>
      <section className="stack">
        <h2>{d.learn}</h2>
        <div className="grid-2">
          {Object.entries(d.learnLinks).map(([href, { title, text }]) => (
            <Link key={href} className="card learn-link" href={href}>
              <h3>{title}</h3>
              <p>{text}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="card stack">
        <h2>{d.month}</h2>
        <p>{formatMonth(month, LOCALE_META[locale].htmlLang)}</p>
        {monthCheckIns.length === 0 ? (
          <p>{d.monthEmpty}</p>
        ) : (
          <p>{fmt(d.monthCount, { count: monthCheckIns.length, done })}</p>
        )}
        <Link href="/progress">{d.goProgress}</Link>
      </section>
      <RecommendationsPanel answers={latest?.answers ?? null} />
    </div>
  );
}
