"use client";

import Link from "next/link";
import { useBreathe } from "@/components/breathe/use-breathe";
import { CHALLENGE_DAYS, challengeSummary, last30Days, weekProgress, WEEKLY_TARGET } from "@/lib/breathe/program";
import { localISODate } from "@/lib/dates";

/** A short Breathe for Life summary for the Progress and Plan pages. */
export function BreatheProgressCard() {
  const { ready, breathe } = useBreathe();
  if (!ready) return null;
  const today = localISODate();
  const week = weekProgress(breathe, today);
  const days30 = last30Days(breathe.sessions, today).filter((day) => day.practiced).length;
  const summary = challengeSummary(breathe, today);
  return (
    <section className="card stack" aria-labelledby="bf-progress-card">
      <h2 id="bf-progress-card">Breathe for Life</h2>
      <ul className="record-list">
        <li>
          This week: <strong>{week.practiceDays}</strong> of {WEEKLY_TARGET} recommended breathing sessions
        </li>
        <li>
          Last 30 days: <strong>{days30}</strong> days with a session
        </li>
        {summary ? (
          <li>
            30-day challenge:{" "}
            {summary.ended ? "finished. See your summary." : `day ${summary.day} of ${CHALLENGE_DAYS}, week ${summary.week}`}
          </li>
        ) : null}
      </ul>
      <p className="hint">A count of sessions you recorded. It is not a nitric oxide measurement or a health result.</p>
      <div className="actions">
        <Link className="btn btn-primary" href="/breathe/practice">
          Start Breathing Session
        </Link>
        <Link className="btn btn-secondary" href={summary ? "/breathe/challenge" : "/breathe"}>
          {summary ? "Open the challenge" : "Open Breathe for Life"}
        </Link>
      </div>
    </section>
  );
}
