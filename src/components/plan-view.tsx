"use client";

import Link from "next/link";
import { useState } from "react";
import { Art } from "@/components/companion/art";
import { ActivityCard } from "@/components/companion/activity-card";
import { GoalsEditor } from "@/components/companion/goals-editor";
import { SaveNote } from "@/components/companion/shared";
import { CurrentNewLife } from "@/components/movement-breaks/views";
import { useProfile } from "@/components/companion/use-profile";
import { useSession } from "@/components/session-provider";
import { planContext, planSections, SECTION_IDS, SECTION_INFO, WEEKLY_TARGETS } from "@/lib/companion/day-plan";
import { commitCompanion } from "@/lib/companion/store";
import { GUIDANCE_MODES, type GuidanceMode } from "@/lib/companion/state";
import { safetyFlags } from "@/lib/health-profile";
import { LoadingState } from "@/components/sources";
import { localISODate } from "@/lib/dates";
import { habitDelta, improvementPlan, reassessDue } from "@/lib/improvement";
import type { ReassessDays } from "@/lib/types";

const MODE_TEXT: Record<GuidanceMode, { title: string; text: string }> = {
  daily: { title: "Daily guidance", text: "A fresh plan for each day in My Day, with times you can change." },
  weekly: { title: "Weekly guidance", text: "A few targets for the week. You choose the days." },
  anytime: { title: "Anytime guidance", text: "Everything is here to open whenever you like. No schedule." },
};

function ModeChooser() {
  const { companion, sample } = useProfile();
  return (
    <section className="card stack">
      <h2>How would you like to receive your recommendations?</h2>
      {!companion.mode ? <p>Choose one. You can change it at any time.</p> : <p className="hint">You can change this at any time.</p>}
      <div className="lz-modes" role="group" aria-label="Guidance mode">
        {GUIDANCE_MODES.map((mode) => (
          <button
            key={mode}
            type="button"
            className="lz-mode"
            aria-pressed={companion.mode === mode}
            disabled={sample}
            onClick={() => commitCompanion((state) => ({ ...state, mode, modeChosenOn: localISODate() }))}
          >
            <strong>{MODE_TEXT[mode].title}</strong>
            <span>{MODE_TEXT[mode].text}</span>
          </button>
        ))}
      </div>
      {companion.mode === "daily" ? (
        <Link className="btn btn-teal" href="/my-day">
          Open today in My Day
        </Link>
      ) : null}
    </section>
  );
}

function PlanSections() {
  const { companion, answers } = useProfile();
  const flags = answers ? safetyFlags(answers) : null;
  const ctx = planContext(companion, flags, answers?.wellnessGoals ?? []);
  const sections = planSections(ctx);
  const weekly = companion.mode === "weekly";
  const thisWeek = companion.plans.find((plan) => plan.weekStart <= localISODate() && plan.suggestions.some((item) => item.status === "accepted" || item.status === "modified"));
  return (
    <section className="stack" aria-labelledby="plan-sections">
      <h2 id="plan-sections">Your nine areas</h2>
      {weekly && thisWeek ? (
        <div className="card stack">
          <h3>This week you chose</h3>
          <ul>
            {thisWeek.suggestions
              .filter((item) => item.status === "accepted" || item.status === "modified")
              .map((item) => (
                <li key={item.id}>
                  <strong>{item.area}:</strong> {item.edited || item.text}
                </li>
              ))}
          </ul>
        </div>
      ) : null}
      {SECTION_IDS.map((id) => {
        const info = SECTION_INFO[id];
        const list = sections[id];
        return (
          <details key={id} className="lz-section" data-section={id}>
            <summary>
              <span>{info.title}</span>
            </summary>
            <div className="lz-section-body">
              <div className="lz-hero-row">
                <p>{info.intro}</p>
                <Art name={info.art} />
              </div>
              {weekly ? <p className="alert">This week: {WEEKLY_TARGETS[id]}</p> : null}
              {id === "goals" ? <GoalsEditor /> : null}
              {id === "emotional" ? (
                <p className="hint">
                  These are everyday wellbeing ideas, not therapy. If you are struggling, <Link href="/emotional-wellness">Emotional Wellness</Link> lists places to get support.
                </p>
              ) : null}
              {list.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} activityId={`plan-${id}-${activity.id}`} />
              ))}
            </div>
          </details>
        );
      })}
    </section>
  );
}

export function PlanView() {
  const { ready, sample, session, setReassessment } = useSession();
  const [message, setMessage] = useState<string | null>(null);
  if (!ready) return <LoadingState label="Loading your plan…" />;
  const latest = session.history[0]?.answers ?? null;
  const previous = session.history[1]?.answers ?? null;
  const actions = improvementPlan(latest);
  const deltas = latest ? habitDelta(latest, previous) : [];
  const today = localISODate();
  const due = reassessDue(session.reassessOn, session.reassessDays, today);

  return (
    <div className="learn stack-lg">
      <p className="kicker">My Life Improvement Plan</p>
      <h1>Your progress matters</h1>
      <p className="script brand-line">Make Life Better.</p>
      <p className="lede">Every healthier choice is a step forward. A short-term change is not proof that illness was prevented, and it is not a count of years.</p>
      <SaveNote />
      {!latest ? (
        <p className="alert">
          Your plan is general until you <Link href="/assessment">fill out your assessment</Link>. Then it follows your goals, level, food needs, and any limits you report.
        </p>
      ) : null}
      <ModeChooser />
      <PlanSections />
      <CurrentNewLife />
      <section className="card stack">
        <h2>A few priorities from your assessment</h2>
        <p>These weekly actions come from your latest answers. They are user-reported, not measured, and not hypothetical forecasts.</p>
        <ul className="record-list">
          {actions.map((action) => (
            <li key={action.area}>
              <strong>{action.area}</strong>
              <p>{action.weekly}</p>
              <p className="hint">Kind: {action.kind}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="card stack">
        <h2>Reassessment</h2>
        <p>Choose 30, 90, or 180 days. When that time has passed, compare a new assessment with the previous one. Missing the date is not a failure.</p>
        {session.reassessDays ? <p>Reminder set for {session.reassessDays} days from {session.reassessOn || "today"}.</p> : <p>No reminder yet.</p>}
        {due ? <p role="status">The reminder date has arrived. You can retake the assessment when you want.</p> : null}
        <div className="actions">
          {([30, 90, 180] as ReassessDays[]).map((days) => (
            <button
              key={days}
              className="btn btn-secondary"
              type="button"
              onClick={() => {
                const result = setReassessment(days);
                setMessage(result ?? `Reminder set for ${days} days.`);
              }}
            >
              Remind me in {days} days
            </button>
          ))}
        </div>
        {message ? <p role="status">{message}</p> : null}
        {sample ? <p className="hint">Sample data is read-only.</p> : null}
      </section>
      <section className="card stack">
        <h2>Previous and current habits</h2>
        {deltas.length === 0 ? (
          <p>Save at least two assessments to see what changed. Until then, nothing here is estimated or hypothetical.</p>
        ) : (
          <ul>
            {deltas.map((delta) => (
              <li key={delta.label}>
                {delta.label}: “{delta.before || "blank"}” then “{delta.after || "blank"}”. Kind: {delta.kind}.
              </li>
            ))}
          </ul>
        )}
        <p className="hint">Measured clinic values are not stored. Numbers you typed stay user-reported. WHAT IF? comparisons stay hypothetical on their own page.</p>
      </section>
      <Link className="btn btn-primary" href="/assessment">Update the assessment</Link>
    </div>
  );
}
