"use client";

import Link from "next/link";
import { useState } from "react";
import { BreatheHeroArt } from "@/components/breathe/art";
import { BreatheNav, HabitQuestions, ScalePicker } from "@/components/breathe/shared";
import { commitBreathe, useBreathe } from "@/components/breathe/use-breathe";
import { SaveNote } from "@/components/companion/shared";
import { BREATHE_DISCLAIMER, BREATHE_TITLE } from "@/lib/breathe/content";
import { CHALLENGE_DAYS, CHALLENGE_WEEKS, challengeSummary, compareHabits, describeChange, habitsFromAssessment, type ChallengeSummary } from "@/lib/breathe/program";
import { emptyHabits, finishChallenge, saveCheckIn, saveExtras, startChallenge, type BreatheChallenge, type BreatheHabits } from "@/lib/breathe/state";
import { addIsoDays, formatLongDate, localISODate } from "@/lib/dates";

const NO_MEASURE =
  "This challenge counts sessions and records how you say you feel. It does not measure nitric oxide: that would need a validated medical test.";

function StartForm({ previous }: { previous: BreatheChallenge | null }) {
  const { answers, sample } = useBreathe();
  const [habits, setHabits] = useState<BreatheHabits>(() => ({ ...emptyHabits(), ...(previous?.after ?? habitsFromAssessment(answers)) }));
  return (
    <section className="card stack" aria-labelledby="bf-start">
      <h2 id="bf-start">{previous ? "Start a new 30-day plan" : "Before you begin"}</h2>
      <p>
        A few quick questions about your habits now. At the end you answer them again, so you can compare. {answers ? "Some answers are filled in from your assessment; change them freely." : ""}
      </p>
      <HabitQuestions value={habits} onChange={setHabits} disabled={sample} />
      <button className="btn btn-primary bf-big" type="button" disabled={sample} onClick={() => commitBreathe((s) => startChallenge(s, localISODate(), habits))}>
        Start the 30-day challenge today
      </button>
      {sample ? <p className="hint">Sample data is on, so the challenge cannot be started.</p> : null}
    </section>
  );
}

function WeekPlan({ summary }: { summary: ChallengeSummary | null }) {
  return (
    <ol className="bf-weeks">
      {CHALLENGE_WEEKS.map((week) => {
        const done = summary && (summary.ended || summary.week >= week.week) ? summary.weeks[week.week - 1] : undefined;
        const current = summary && !summary.ended && summary.week === week.week;
        return (
          <li key={week.week} className="card stack" data-current={current || undefined}>
            <p className="kicker">
              Week {week.week}
              {week.week === 4 ? " (days 22 to 30)" : ""}
              {current ? " · this week" : ""}
            </p>
            <h3>{week.title}</h3>
            <p>{week.goal}</p>
            {done && summary ? (
              <p className="hint">
                {done.practiceDays} of {done.target} practice days{done.met ? ". Goal reached." : "."}
              </p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function TodayExtras({ challenge }: { challenge: BreatheChallenge }) {
  const { sample } = useBreathe();
  const today = localISODate();
  const row = challenge.extras.find((item) => item.date === today) ?? { date: today, walked: false, greens: false };
  return (
    <section className="card stack" aria-labelledby="bf-extras">
      <h2 id="bf-extras">Today&apos;s small steps</h2>
      <p className="hint">Optional. Mark what you did. Week 3 focuses on these, but they count any day.</p>
      <label className="check-row">
        <input type="checkbox" disabled={sample} checked={row.walked} onChange={(event) => commitBreathe((s) => saveExtras(s, { ...row, walked: event.target.checked }))} />
        <span>I went for a comfortable walk</span>
      </label>
      <label className="check-row">
        <input type="checkbox" disabled={sample} checked={row.greens} onChange={(event) => commitBreathe((s) => saveExtras(s, { ...row, greens: event.target.checked }))} />
        <span>I ate leafy greens, beetroot, or another nitrate-rich vegetable</span>
      </label>
      <p>
        <Link href="/breathe/foods">Meal ideas</Link> · <Link href="/my-day">My Day walk</Link>
      </p>
    </section>
  );
}

function CheckIn({ challenge }: { challenge: BreatheChallenge }) {
  const { sample } = useBreathe();
  const today = localISODate();
  const row = challenge.checkIns.find((item) => item.date === today) ?? { date: today, stress: null, relaxation: null };
  return (
    <section className="card stack" aria-labelledby="bf-checkin">
      <h2 id="bf-checkin">How are you feeling?</h2>
      <p className="hint">A quick check-in, once a week or whenever you like. Your own impression, not a measurement.</p>
      <ScalePicker legend="Stress today (1 calm, 5 very stressed)" value={row.stress} disabled={sample} onChange={(value) => commitBreathe((s) => saveCheckIn(s, { ...row, stress: value }))} />
      <ScalePicker legend="Relaxation today (1 hard, 5 easy)" value={row.relaxation} disabled={sample} onChange={(value) => commitBreathe((s) => saveCheckIn(s, { ...row, relaxation: value }))} />
    </section>
  );
}

function EndForm({ challenge }: { challenge: BreatheChallenge }) {
  const { sample } = useBreathe();
  const [habits, setHabits] = useState<BreatheHabits>(() => ({ ...challenge.before }));
  const [feeling, setFeeling] = useState("");
  return (
    <section className="card stack" aria-labelledby="bf-end">
      <h2 id="bf-end">You reached day 30</h2>
      <p>Answer the same questions as at the start, so you can see what changed.</p>
      <HabitQuestions value={habits} onChange={setHabits} disabled={sample} />
      <label className="field">
        <span>How do you feel after these 30 days?</span>
        <textarea rows={3} maxLength={280} value={feeling} disabled={sample} onChange={(event) => setFeeling(event.target.value)} />
      </label>
      <button className="btn btn-primary bf-big" type="button" disabled={sample} onClick={() => commitBreathe((s) => finishChallenge(s, localISODate(), habits, feeling))}>
        See my 30-day summary
      </button>
    </section>
  );
}

function Summary({ challenge, summary }: { challenge: BreatheChallenge; summary: ChallengeSummary }) {
  const rows = compareHabits(challenge.before, challenge.after);
  return (
    <section className="card stack" aria-labelledby="bf-summary">
      <h2 id="bf-summary">Your 30-day summary</h2>
      <ul className="bf-stats">
        <li>
          <strong>{summary.sessions}</strong> sessions ({summary.completeSessions} complete)
        </li>
        <li>
          <strong>{summary.practiceDays}</strong> days with practice
        </li>
        <li>
          <strong>{summary.minutes}</strong> minutes of breathing
        </li>
        <li>
          <strong>{summary.walkDays}</strong> walks and <strong>{summary.greensDays}</strong> days with greens marked
        </li>
      </ul>
      <h3>Weekly consistency</h3>
      <ul className="bf-bars">
        {summary.weeks.map((week) => (
          <li key={week.week}>
            <span>Week {week.week}</span>
            <span className="bf-bar-track" aria-hidden="true">
              <span style={{ width: `${Math.min(1, week.practiceDays / week.target) * 100}%` }} />
            </span>
            <span>
              {week.practiceDays} of {week.target}
            </span>
          </li>
        ))}
      </ul>
      <h3>Stress and relaxation, as you rated them</h3>
      <p>{describeChange("stress", summary.stressBefore, summary.stressLatest)}</p>
      <p>{describeChange("relaxation", summary.relaxBefore, summary.relaxLatest)}</p>
      {summary.feltAfterAverage !== null ? <p>After sessions, you rated your relaxation {summary.feltAfterAverage} out of 5 on average.</p> : null}
      {challenge.feeling ? (
        <blockquote className="bf-quote">
          <p>{challenge.feeling}</p>
        </blockquote>
      ) : null}
      <h3>Your habits at the start and now</h3>
      <div className="table-wrap">
        <table className="bf-table">
          <thead>
            <tr>
              <th scope="col">Habit</th>
              <th scope="col">Day 1</th>
              <th scope="col">Day 30</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td>{row.before}</td>
                <td>{row.after}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="hint">{NO_MEASURE} A change in a month is encouraging, but it is not proof that your health has changed.</p>
    </section>
  );
}

export function BreatheChallengeView() {
  const { ready, breathe } = useBreathe();
  const [restart, setRestart] = useState(false);
  if (!ready) return <p className="hint">Loading the challenge…</p>;
  const today = localISODate();
  const challenge = breathe.challenge;
  const summary = challengeSummary(breathe, today);
  const finished = Boolean(challenge?.finishedOn);
  const awaitingEnd = challenge && summary && summary.day > CHALLENGE_DAYS && !finished;
  return (
    <div className="stack-lg bf">
      <div className="lz-hero-row bf-hero">
        <div className="lz-hello">
          <p className="kicker">{BREATHE_TITLE} · 30-day challenge</p>
          <h1>The Nitric Oxide &amp; Breathing Challenge</h1>
          <p className="script brand-line">One small goal each week.</p>
          <p>Four weeks of gentle breathing, walking, and nitrate-rich foods. Four sessions a week is the goal. Missed days are fine: just carry on.</p>
        </div>
        <BreatheHeroArt />
      </div>
      <BreatheNav />
      <SaveNote />
      <p className="alert">{NO_MEASURE}</p>

      {!challenge ? (
        <>
          <WeekPlan summary={null} />
          <StartForm previous={null} />
        </>
      ) : null}

      {challenge && summary && !finished && !awaitingEnd ? (
        <>
          <section className="card stack" aria-labelledby="bf-today">
            <p className="kicker">
              Day {summary.day} of {CHALLENGE_DAYS} · started {formatLongDate(challenge.startedOn)}
              {challenge.round > 1 ? ` · round ${challenge.round}` : ""}
            </p>
            <h2 id="bf-today">Week {summary.week}: {CHALLENGE_WEEKS[summary.week - 1]?.title}</h2>
            <p>{CHALLENGE_WEEKS[summary.week - 1]?.goal}</p>
            <p role="status">
              <strong>{summary.weeks[summary.week - 1]?.practiceDays ?? 0} of 4</strong> practice days this challenge week · {summary.sessions} sessions so far
            </p>
            <Link className="btn btn-primary bf-big" href="/breathe/practice">
              Start Breathing Session
            </Link>
            <p className="hint">The challenge ends on {formatLongDate(addIsoDays(challenge.startedOn, CHALLENGE_DAYS - 1))}.</p>
          </section>
          <WeekPlan summary={summary} />
          <TodayExtras challenge={challenge} />
          <CheckIn challenge={challenge} />
        </>
      ) : null}

      {challenge && awaitingEnd ? (
        <>
          {summary ? <Summary challenge={challenge} summary={summary} /> : null}
          <EndForm challenge={challenge} />
        </>
      ) : null}

      {challenge && finished && summary ? (
        <>
          <Summary challenge={challenge} summary={summary} />
          {restart ? (
            <StartForm previous={challenge} />
          ) : (
            <section className="card stack">
              <h2>What next?</h2>
              <p>Keep the routine that worked for you, or start a new 30-day plan. Your next plan begins from the habits you have now.</p>
              <button className="btn btn-primary bf-big" type="button" onClick={() => setRestart(true)}>
                Start a new 30-day plan
              </button>
            </section>
          )}
        </>
      ) : null}

      {breathe.past.length > 0 ? (
        <section className="card stack">
          <h2>Earlier challenges</h2>
          <ul className="record-list">
            {breathe.past.map((item) => (
              <li key={`${item.startedOn}-${item.round}`}>
                Round {item.round}: {formatLongDate(item.startedOn)} to {formatLongDate(item.finishedOn)} · {item.sessions} sessions
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <p className="library-disclaimer">{BREATHE_DISCLAIMER}</p>
    </div>
  );
}
