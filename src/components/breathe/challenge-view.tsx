"use client";

import Link from "next/link";
import { useState } from "react";
import { BreatheHeroArt } from "@/components/breathe/art";
import { BreatheNav, HabitQuestions, ScalePicker } from "@/components/breathe/shared";
import { commitBreathe, useBreathe } from "@/components/breathe/use-breathe";
import { SaveNote } from "@/components/companion/shared";
import { BREATHE_DISCLAIMER, BREATHE_TITLE } from "@/lib/breathe/content";
import { CHALLENGE_DAYS, CHALLENGE_WEEKS, challengeSummary, compareHabits, habitsFromAssessment, type ChallengeSummary } from "@/lib/breathe/program";
import { emptyHabits, finishChallenge, saveCheckIn, saveExtras, startChallenge, type BreatheChallenge, type BreatheHabits } from "@/lib/breathe/state";
import { addIsoDays, localISODate } from "@/lib/dates";
import { useT } from "@/components/locale-provider";
import { Rich, useDates } from "@/components/companion/i18n";
import { msg, type Translate } from "@/lib/i18n/translate";

const NO_MEASURE = msg(
  "This challenge counts sessions and records how you say you feel. It does not measure nitric oxide: that would need a validated medical test.",
);

/** describeChange() in the chosen language, one whole sentence per case. */
function changeText(label: "stress" | "relaxation", before: number | null, after: number | null, t: Translate): string {
  const stress = label === "stress";
  if (before === null || after === null) {
    return stress ? t("Rate your stress at the start and the end to see a comparison.") : t("Rate your relaxation at the start and the end to see a comparison.");
  }
  if (before === after) return stress ? t("Your stress rating stayed at {after} out of 5.", { after }) : t("Your relaxation rating stayed at {after} out of 5.", { after });
  const better = stress ? after < before : after > before;
  const values = { before, after };
  if (better) {
    return stress
      ? t("Your stress rating went from {before} to {after} out of 5. Well done for noticing.", values)
      : t("Your relaxation rating went from {before} to {after} out of 5. Well done for noticing.", values);
  }
  return stress
    ? t("Your stress rating went from {before} to {after} out of 5. Some weeks are harder than others, and that is normal.", values)
    : t("Your relaxation rating went from {before} to {after} out of 5. Some weeks are harder than others, and that is normal.", values);
}

/** A cell from compareHabits(): a saved label, or a rating such as "3 out of 5". */
function habitCell(value: string, t: Translate): string {
  const rating = /^(\d) out of 5$/.exec(value);
  return rating ? t("{value} out of 5", { value: Number(rating[1]) }) : t(value);
}

function StartForm({ previous }: { previous: BreatheChallenge | null }) {
  const { answers, sample } = useBreathe();
  const [habits, setHabits] = useState<BreatheHabits>(() => ({ ...emptyHabits(), ...(previous?.after ?? habitsFromAssessment(answers)) }));
  const t = useT();
  return (
    <section className="card stack" aria-labelledby="bf-start">
      <h2 id="bf-start">{previous ? t("Start a new 30-day plan") : t("Before you begin")}</h2>
      <p>
        {t("A few quick questions about your habits now. At the end you answer them again, so you can compare.")}{" "}
        {answers ? t("Some answers are filled in from your assessment; change them freely.") : ""}
      </p>
      <HabitQuestions value={habits} onChange={setHabits} disabled={sample} />
      <button className="btn btn-primary bf-big" type="button" disabled={sample} onClick={() => commitBreathe((s) => startChallenge(s, localISODate(), habits))}>
        {t("Start the 30-day challenge today")}
      </button>
      {sample ? <p className="hint">{t("Sample data is on, so the challenge cannot be started.")}</p> : null}
    </section>
  );
}

function WeekPlan({ summary }: { summary: ChallengeSummary | null }) {
  const t = useT();
  return (
    <ol className="bf-weeks">
      {CHALLENGE_WEEKS.map((week) => {
        const done = summary && (summary.ended || summary.week >= week.week) ? summary.weeks[week.week - 1] : undefined;
        const current = summary && !summary.ended && summary.week === week.week;
        return (
          <li key={week.week} className="card stack" data-current={current || undefined}>
            <p className="kicker">
              {t("Week {week}", { week: week.week })}
              {week.week === 4 ? t(" (days 22 to 30)") : ""}
              {current ? t(" · this week") : ""}
            </p>
            <h3>{t(week.title)}</h3>
            <p>{t(week.goal)}</p>
            {done && summary ? (
              <p className="hint">
                {done.met
                  ? t("{done} of {target} practice days. Goal reached.", { done: done.practiceDays, target: done.target })
                  : t("{done} of {target} practice days.", { done: done.practiceDays, target: done.target })}
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
  const t = useT();
  return (
    <section className="card stack" aria-labelledby="bf-extras">
      <h2 id="bf-extras">{t("Today's small steps")}</h2>
      <p className="hint">{t("Optional. Mark what you did. Week 3 focuses on these, but they count any day.")}</p>
      <label className="check-row">
        <input type="checkbox" disabled={sample} checked={row.walked} onChange={(event) => commitBreathe((s) => saveExtras(s, { ...row, walked: event.target.checked }))} />
        <span>{t("I went for a comfortable walk")}</span>
      </label>
      <label className="check-row">
        <input type="checkbox" disabled={sample} checked={row.greens} onChange={(event) => commitBreathe((s) => saveExtras(s, { ...row, greens: event.target.checked }))} />
        <span>{t("I ate leafy greens, beetroot, or another nitrate-rich vegetable")}</span>
      </label>
      <p>
        <Link href="/breathe/foods">{t("Meal ideas")}</Link> · <Link href="/my-day">{t("My Day walk")}</Link>
      </p>
    </section>
  );
}

function CheckIn({ challenge }: { challenge: BreatheChallenge }) {
  const { sample } = useBreathe();
  const today = localISODate();
  const row = challenge.checkIns.find((item) => item.date === today) ?? { date: today, stress: null, relaxation: null };
  const t = useT();
  return (
    <section className="card stack" aria-labelledby="bf-checkin">
      <h2 id="bf-checkin">{t("How are you feeling?")}</h2>
      <p className="hint">{t("A quick check-in, once a week or whenever you like. Your own impression, not a measurement.")}</p>
      <ScalePicker legend={t("Stress today (1 calm, 5 very stressed)")} value={row.stress} disabled={sample} onChange={(value) => commitBreathe((s) => saveCheckIn(s, { ...row, stress: value }))} />
      <ScalePicker legend={t("Relaxation today (1 hard, 5 easy)")} value={row.relaxation} disabled={sample} onChange={(value) => commitBreathe((s) => saveCheckIn(s, { ...row, relaxation: value }))} />
    </section>
  );
}

function EndForm({ challenge }: { challenge: BreatheChallenge }) {
  const { sample } = useBreathe();
  const [habits, setHabits] = useState<BreatheHabits>(() => ({ ...challenge.before }));
  const [feeling, setFeeling] = useState("");
  const t = useT();
  return (
    <section className="card stack" aria-labelledby="bf-end">
      <h2 id="bf-end">{t("You reached day 30")}</h2>
      <p>{t("Answer the same questions as at the start, so you can see what changed.")}</p>
      <HabitQuestions value={habits} onChange={setHabits} disabled={sample} />
      <label className="field">
        <span>{t("How do you feel after these 30 days?")}</span>
        <textarea rows={3} maxLength={280} value={feeling} disabled={sample} onChange={(event) => setFeeling(event.target.value)} />
      </label>
      <button className="btn btn-primary bf-big" type="button" disabled={sample} onClick={() => commitBreathe((s) => finishChallenge(s, localISODate(), habits, feeling))}>
        {t("See my 30-day summary")}
      </button>
    </section>
  );
}

function Summary({ challenge, summary }: { challenge: BreatheChallenge; summary: ChallengeSummary }) {
  const rows = compareHabits(challenge.before, challenge.after);
  const t = useT();
  const bold = (label: string) => <strong>{label}</strong>;
  return (
    <section className="card stack" aria-labelledby="bf-summary">
      <h2 id="bf-summary">{t("Your 30-day summary")}</h2>
      <ul className="bf-stats">
        <li>
          <Rich text={t("<0>{sessions}</0> sessions ({complete} complete)", { sessions: summary.sessions, complete: summary.completeSessions })} parts={[bold]} />
        </li>
        <li>
          <Rich text={t("<0>{days}</0> days with practice", { days: summary.practiceDays })} parts={[bold]} />
        </li>
        <li>
          <Rich text={t("<0>{minutes}</0> minutes of breathing", { minutes: summary.minutes })} parts={[bold]} />
        </li>
        <li>
          <Rich text={t("<0>{walks}</0> walks and <1>{greens}</1> days with greens marked", { walks: summary.walkDays, greens: summary.greensDays })} parts={[bold, bold]} />
        </li>
      </ul>
      <h3>{t("Weekly consistency")}</h3>
      <ul className="bf-bars">
        {summary.weeks.map((week) => (
          <li key={week.week}>
            <span>{t("Week {week}", { week: week.week })}</span>
            <span className="bf-bar-track" aria-hidden="true">
              <span style={{ width: `${Math.min(1, week.practiceDays / week.target) * 100}%` }} />
            </span>
            <span>
              {t("{done} of {total}", { done: week.practiceDays, total: week.target })}
            </span>
          </li>
        ))}
      </ul>
      <h3>{t("Stress and relaxation, as you rated them")}</h3>
      <p>{changeText("stress", summary.stressBefore, summary.stressLatest, t)}</p>
      <p>{changeText("relaxation", summary.relaxBefore, summary.relaxLatest, t)}</p>
      {summary.feltAfterAverage !== null ? <p>{t("After sessions, you rated your relaxation {value} out of 5 on average.", { value: summary.feltAfterAverage })}</p> : null}
      {challenge.feeling ? (
        <blockquote className="bf-quote">
          <p>{challenge.feeling}</p>
        </blockquote>
      ) : null}
      <h3>{t("Your habits at the start and now")}</h3>
      <div className="table-wrap">
        <table className="bf-table">
          <thead>
            <tr>
              <th scope="col">{t("Habit")}</th>
              <th scope="col">{t("Day 1")}</th>
              <th scope="col">{t("Day 30")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{t(row.label)}</th>
                <td>{habitCell(row.before, t)}</td>
                <td>{habitCell(row.after, t)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="hint">
        {t(NO_MEASURE)} {t("A change in a month is encouraging, but it is not proof that your health has changed.")}
      </p>
    </section>
  );
}

export function BreatheChallengeView() {
  const { ready, breathe } = useBreathe();
  const [restart, setRestart] = useState(false);
  const t = useT();
  const dates = useDates();
  if (!ready) return <p className="hint">{t("Loading the challenge…")}</p>;
  const today = localISODate();
  const challenge = breathe.challenge;
  const summary = challengeSummary(breathe, today);
  const finished = Boolean(challenge?.finishedOn);
  const awaitingEnd = challenge && summary && summary.day > CHALLENGE_DAYS && !finished;
  return (
    <div className="stack-lg bf">
      <div className="lz-hero-row bf-hero">
        <div className="lz-hello">
          <p className="kicker">
            {t(BREATHE_TITLE)} · {t("30-day challenge")}
          </p>
          <h1>{t("The Nitric Oxide & Breathing Challenge")}</h1>
          <p className="script brand-line">{t("One small goal each week.")}</p>
          <p>{t("Four weeks of gentle breathing, walking, and nitrate-rich foods. Four sessions a week is the goal. Missed days are fine: just carry on.")}</p>
        </div>
        <BreatheHeroArt />
      </div>
      <BreatheNav />
      <SaveNote />
      <p className="alert">{t(NO_MEASURE)}</p>

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
              {t("Day {day} of {total} · started {date}", { day: summary.day, total: CHALLENGE_DAYS, date: dates.long(challenge.startedOn) })}
              {challenge.round > 1 ? t(" · round {round}", { round: challenge.round }) : ""}
            </p>
            <h2 id="bf-today">
              {t("Week {week}: {title}", { week: summary.week, title: t(CHALLENGE_WEEKS[summary.week - 1]?.title ?? "") })}
            </h2>
            <p>{t(CHALLENGE_WEEKS[summary.week - 1]?.goal ?? "")}</p>
            <p role="status">
              <Rich
                text={t("<0>{done} of 4</0> practice days this challenge week · {sessions} sessions so far", {
                  done: summary.weeks[summary.week - 1]?.practiceDays ?? 0,
                  sessions: summary.sessions,
                })}
                parts={[(label) => <strong>{label}</strong>]}
              />
            </p>
            <Link className="btn btn-primary bf-big" href="/breathe/practice">
              {t("Start Breathing Session")}
            </Link>
            <p className="hint">{t("The challenge ends on {date}.", { date: dates.long(addIsoDays(challenge.startedOn, CHALLENGE_DAYS - 1)) })}</p>
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
              <h2>{t("What next?")}</h2>
              <p>{t("Keep the routine that worked for you, or start a new 30-day plan. Your next plan begins from the habits you have now.")}</p>
              <button className="btn btn-primary bf-big" type="button" onClick={() => setRestart(true)}>
                {t("Start a new 30-day plan")}
              </button>
            </section>
          )}
        </>
      ) : null}

      {breathe.past.length > 0 ? (
        <section className="card stack">
          <h2>{t("Earlier challenges")}</h2>
          <ul className="record-list">
            {breathe.past.map((item) => (
              <li key={`${item.startedOn}-${item.round}`}>
                {t("Round {round}: {from} to {to} · {sessions} sessions", {
                  round: item.round,
                  from: dates.long(item.startedOn),
                  to: dates.long(item.finishedOn),
                  sessions: item.sessions,
                })}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <p className="library-disclaimer">{t(BREATHE_DISCLAIMER)}</p>
    </div>
  );
}
