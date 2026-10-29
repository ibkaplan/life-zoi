"use client";

import Link from "next/link";
import { RecommendationsPanel } from "@/components/recommendations-panel";
import { useSession } from "@/components/session-provider";
import { formatMonth, localISODate, monthKey } from "@/lib/dates";
import {
  ageLabels,
  assessmentHasAnswers,
  goalLabels,
  sleepQualityLabels,
} from "@/lib/labels";
import { LoadingState } from "@/components/sources";

export function DashboardView() {
  const { ready, session, sample } = useSession();
  if (!ready) return <LoadingState label="Loading your session…" />;

  const latest = session.history[0] ?? null;
  const draftStarted = assessmentHasAnswers(session.draft);
  const month = monthKey(localISODate());
  const monthCheckIns = session.checkIns.filter((item) => item.date.startsWith(month));
  const done = monthCheckIns.filter((item) => item.done).length;
  const name = latest?.answers.displayName || session.draft.displayName;

  return (
    <div className="stack-lg">
      <section className="stack">
        <p className="kicker">Dashboard</p>
        <h1>{name ? `Welcome, ${name}` : "Welcome"}</h1>
        <p className="lede">
          lifeZoi helps you look at everyday habits, explore a change in WHAT IF?, and keep a simple record of what you try. It does not diagnose illness or predict a lifespan.
        </p>
      </section>
      <div className="grid-2">
        <article className="card stack">
          <h2>Lifestyle assessment</h2>
          <p>
            {latest
              ? "You can update your answers any time. A new save keeps the earlier version in Progress."
              : draftStarted
                ? "Your assessment is started and not finished yet."
                : "The assessment is how lifeZoi learns what you want to reflect on. Until you answer, the overview stays empty."}
          </p>
          <Link className="btn btn-primary" href="/assessment">
            {latest ? "Update assessment" : draftStarted ? "Continue assessment" : "Start assessment"}
          </Link>
        </article>
        <article className="card stack">
          <h2>WHAT IF?</h2>
          <p>Compare your current routine with a possible change. The result is an educational illustration, with sources, not a personal forecast.</p>
          <Link className="btn btn-secondary" href="/what-if">
            Open WHAT IF?
          </Link>
        </article>
      </div>
      <section className="card stack">
        <h2>Lifestyle overview</h2>
        {latest ? (
          <dl className="review-list">
            {latest.answers.ageRange ? (
              <div>
                <dt>Age range</dt>
                <dd>{ageLabels[latest.answers.ageRange]}</dd>
              </div>
            ) : null}
            <div>
              <dt>Sleep</dt>
              <dd>
                About {latest.answers.sleepHours} hours
                {latest.answers.sleepQuality
                  ? `, ${sleepQualityLabels[latest.answers.sleepQuality]}`
                  : ""}
              </dd>
            </div>
            <div>
              <dt>Movement</dt>
              <dd>
                {latest.answers.activityDays} days a week, about {latest.answers.activityMinutes || "0"} minutes on those days
              </dd>
            </div>
            <div>
              <dt>Focus</dt>
              <dd>{latest.answers.goals.map((goal) => goalLabels[goal]).join(", ")}</dd>
            </div>
          </dl>
        ) : (
          <p>No completed assessment yet. lifeZoi will not fill this in for you.</p>
        )}
        {sample ? <p className="hint">Shown from sample data.</p> : null}
      </section>
      <section className="card stack">
        <h2>This month</h2>
        <p>{formatMonth(month)}</p>
        {monthCheckIns.length === 0 ? (
          <p>Check-ins you record will show up here by month. A quiet month is a fine place to start.</p>
        ) : (
          <p>
            You recorded {monthCheckIns.length} check-ins. {done} were marked done.
          </p>
        )}
        <Link href="/progress">Go to progress</Link>
      </section>
      <RecommendationsPanel answers={latest?.answers ?? null} />
    </div>
  );
}
