"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "@/components/session-provider";
import { LoadingState } from "@/components/sources";
import { localISODate } from "@/lib/dates";
import { habitDelta, improvementPlan, reassessDue } from "@/lib/improvement";
import type { ReassessDays } from "@/lib/types";

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
      <p className="lede">Every healthier choice is a step forward. A short-term change is not proof that illness was prevented, and it is not a count of years.</p>
      <section className="card stack">
        <h2>A few priorities</h2>
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
                setMessage(result ?? `Reminder set for ${days} days. It stays in this browser tab.`);
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
