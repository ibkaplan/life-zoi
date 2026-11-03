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
import { DIGNITY_NOTE, purposeReflection } from "@/lib/purpose";

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
          lifeZoi helps you look at everyday habits, explore a hypothetical change in WHAT IF?, and keep a simple record of what you try. It does not diagnose illness or predict how long anyone will live.
        </p>
      </section>
      <article className="card assistant-card stack">
        <p className="kicker">AI Health Assistant</p>
        <h2>Meet Your Personal AI Health Assistant</h2>
        <p>Get answers, explore healthier habits, and receive guidance as you work toward your wellness goals.</p>
        <p className="hint">Development replies stay on this server. No paid AI service is contacted, and assessment answers are not sent.</p>
        <Link className="btn assistant-send" href="/ai-assistant">
          Start a Conversation
        </Link>
      </article>
      <article className="card stack">
        <p className="kicker">LifeZoi Change Lab</p>
        <h2>Your personal health and lifestyle experiment</h2>
        <p>
          Start with a baseline, choose one small habit, and compare what you entered before and after. The record stays in this browser.
        </p>
        <div className="home-actions">
          <Link className="btn btn-primary" href="/change-lab">Open Change Lab</Link>
          <Link className="btn btn-secondary" href="/lab-results">Understand an example lab report</Link>
        </div>
      </article>
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
      <article className="card stack">
        <p className="kicker">Your Life Matters</p>
        <h2>Your life is more than your lifetime</h2>
        <p>Health, purpose, and kindness sit together here. This reflection is separate from medical suggestions.</p>
        <Link className="btn btn-primary" href="/life-matters">Open Your Life Matters</Link>
      </article>
      {latest?.answers.purposeHope ? (
        <section className="card stack" aria-labelledby="purpose-hope-title">
          <h2 id="purpose-hope-title">What you hope health can support</h2>
          <p>{purposeReflection(latest.answers.purposeHope)}</p>
          <p>{DIGNITY_NOTE}</p>
          <p className="hint">This note is separate from the lifestyle suggestions below. It is not a risk score and it does not judge worth.</p>
        </section>
      ) : null}
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
      <section className="stack">
        <h2>Learn and plan</h2>
        <div className="grid-2">
          {[
            ["/outlook", "Life outlook", "A population table, kept separate from your personal profile."],
            ["/plan", "Improvement plan", "A few weekly priorities and a 30, 90, or 180 day reminder."],
            ["/wellness-coach", "Wellness coach", "Hydration, food, and practical habit cues."],
            ["/academy", "Academy", "Food education and movement ideas with gentler options."],
            ["/choices", "Daily choices", "Why a habit matters, and what is still uncertain."],
            ["/urges", "Urges", "Name a craving, pause only when it is safe, and choose."],
            ["/nature", "Nature", "Daylight and time outside. Nature is not medicine."],
            ["/habits", "Challenges", "Shared 7-day and 30-day journeys."],
          ].map(([href, title, text]) => (
            <Link key={href} className="card learn-link" href={href}>
              <h3>{title}</h3>
              <p>{text}</p>
            </Link>
          ))}
        </div>
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
