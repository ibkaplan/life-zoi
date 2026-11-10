"use client";

import Link from "next/link";
import { commitBreathe, useBreathe } from "@/components/breathe/use-breathe";
import { generalNewLife, last30Days, lifeChanges, weekCalendar, weekProgress, WEEKDAY_NAMES, WEEKLY_TARGET } from "@/lib/breathe/program";
import { toggleDay } from "@/lib/breathe/state";
import { formatLongDate, localISODate } from "@/lib/dates";

/** This week, with the four recommended days and what was practiced. */
export function WeekCalendar({ editable = true }: { editable?: boolean }) {
  const { breathe, sample } = useBreathe();
  const today = localISODate();
  const days = weekCalendar(breathe, today);
  const progress = weekProgress(breathe, today);
  return (
    <section className="card stack" aria-labelledby="bf-week">
      <h2 id="bf-week">This week</h2>
      <p className="bf-progress-line" role="status">
        <strong>
          {Math.min(progress.practiceDays, 7)} of {WEEKLY_TARGET}
        </strong>{" "}
        recommended sessions this week{progress.met ? ". Weekly goal reached. Extra days are welcome." : "."}
      </p>
      <div className="bf-meter" aria-hidden="true">
        {Array.from({ length: WEEKLY_TARGET }, (_, i) => (
          <span key={i} data-on={i < progress.practiceDays} />
        ))}
      </div>
      <ol className="bf-week">
        {days.map((day) => (
          <li key={day.date} data-recommended={day.recommended} data-done={day.sessions > 0} data-today={day.isToday}>
            <span className="bf-week-name">{day.name.slice(0, 3)}</span>
            <span className="bf-week-mark" aria-hidden="true">
              {day.sessions > 0 ? "✓" : day.recommended ? "○" : ""}
            </span>
            <span className="sr-only">
              {day.name}
              {day.recommended ? ", a recommended day" : ""}
              {day.sessions > 0 ? `, ${day.sessions} session${day.sessions > 1 ? "s" : ""} done` : ""}
              {day.isToday ? ", today" : ""}
            </span>
            {day.isToday ? <span className="bf-week-today">Today</span> : null}
          </li>
        ))}
      </ol>
      <p className="hint">Circles are your recommended days. Practicing on any day counts, and daily practice is fine if you enjoy it.</p>
      {editable ? (
        <details>
          <summary>Choose my practice days</summary>
          <div className="lz-tabs" role="group" aria-label="Practice days">
            {WEEKDAY_NAMES.map((name, weekday) => (
              <button
                key={name}
                type="button"
                className="lz-tab"
                disabled={sample}
                aria-pressed={breathe.days.includes(weekday)}
                onClick={() => commitBreathe((s) => toggleDay(s, weekday))}
              >
                {name.slice(0, 3)}
              </button>
            ))}
          </div>
          <p className="hint">Four days a week is the suggested minimum. Choose days that fit your routine.</p>
        </details>
      ) : null}
    </section>
  );
}

/** A strip of the last 30 days. A blank day is not a failure. */
export function ConsistencyStrip() {
  const { breathe } = useBreathe();
  const today = localISODate();
  const days = last30Days(breathe.sessions, today);
  const count = days.filter((d) => d.practiced).length;
  return (
    <section className="card stack" aria-labelledby="bf-30">
      <h2 id="bf-30">Your last 30 days</h2>
      <p>
        You practiced on <strong>{count}</strong> of the last 30 days. A blank day is not a failure, and there is no streak to lose.
      </p>
      <ol className="bf-strip">
        {days.map((day) => (
          <li key={day.date} data-on={day.practiced} title={formatLongDate(day.date)}>
            <span className="sr-only">
              {formatLongDate(day.date)}: {day.practiced ? "practiced" : "no session"}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** My Current Life and My New Life: the habits being changed, and why they may help. */
export function LifeChangesPanel({ heading = "My current life, my new life" }: { heading?: string }) {
  const { answers, breathe } = useBreathe();
  const habits = breathe.challenge?.before ?? null;
  const personal = lifeChanges(answers, habits);
  const list = personal.length > 0 ? personal : generalNewLife();
  return (
    <section className="card stack" aria-labelledby="bf-life">
      <h2 id="bf-life">{heading}</h2>
      {personal.length === 0 ? (
        <p className="hint">
          {answers || habits
            ? "Your answers do not point to a specific change here, so these are general ideas."
            : "These are general ideas. "}
          {!answers ? (
            <>
              <Link href="/assessment">Fill out your assessment</Link> or answer the questions in the <Link href="/breathe/challenge">30-day challenge</Link> to make this personal.
            </>
          ) : null}
        </p>
      ) : (
        <p className="hint">From your assessment and your answers in Breathe for Life. Only what you reported is used.</p>
      )}
      <div className="bf-life">
        {list.map((item) => (
          <article key={item.id} className="bf-life-row">
            {personal.length > 0 ? (
              <p className="bf-life-now">
                <span className="bf-life-label">My current life</span>
                {item.current}
              </p>
            ) : null}
            <p className="bf-life-new">
              <span className="bf-life-label">My new life</span>
              {item.next}
            </p>
            <p className="hint">{item.why}</p>
          </article>
        ))}
      </div>
      <p className="hint">
        These habits may support blood vessel and breathing health as part of a healthy lifestyle. lifeZoi does not claim they raise nitric oxide in the body by any particular amount, and it does not measure nitric oxide.
      </p>
    </section>
  );
}
