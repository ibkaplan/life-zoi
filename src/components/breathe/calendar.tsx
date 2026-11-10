"use client";

import Link from "next/link";
import { commitBreathe, useBreathe } from "@/components/breathe/use-breathe";
import { generalNewLife, last30Days, lifeChanges, weekCalendar, weekProgress, WEEKDAY_NAMES, WEEKLY_TARGET } from "@/lib/breathe/program";
import { toggleDay } from "@/lib/breathe/state";
import { localISODate } from "@/lib/dates";
import { useT } from "@/components/locale-provider";
import { Rich, useDates } from "@/components/companion/i18n";
import { msg } from "@/lib/i18n/translate";

/** This week, with the four recommended days and what was practiced. */
export function WeekCalendar({ editable = true }: { editable?: boolean }) {
  const { breathe, sample } = useBreathe();
  const today = localISODate();
  const days = weekCalendar(breathe, today);
  const progress = weekProgress(breathe, today);
  const t = useT();
  const dates = useDates();
  return (
    <section className="card stack" aria-labelledby="bf-week">
      <h2 id="bf-week">{t("This week")}</h2>
      <p className="bf-progress-line" role="status">
        <strong>{t("{done} of {total}", { done: Math.min(progress.practiceDays, 7), total: WEEKLY_TARGET })}</strong>{" "}
        {progress.met ? t("recommended sessions this week. Weekly goal reached. Extra days are welcome.") : t("recommended sessions this week.")}
      </p>
      <div className="bf-meter" aria-hidden="true">
        {Array.from({ length: WEEKLY_TARGET }, (_, i) => (
          <span key={i} data-on={i < progress.practiceDays} />
        ))}
      </div>
      <ol className="bf-week">
        {days.map((day) => (
          <li key={day.date} data-recommended={day.recommended} data-done={day.sessions > 0} data-today={day.isToday}>
            <span className="bf-week-name">{dates.weekdayShort(day.date)}</span>
            <span className="bf-week-mark" aria-hidden="true">
              {day.sessions > 0 ? "✓" : day.recommended ? "○" : ""}
            </span>
            <span className="sr-only">
              {t(day.name)}
              {day.recommended ? t(", a recommended day") : ""}
              {day.sessions > 0 ? (day.sessions > 1 ? t(", {count} sessions done", { count: day.sessions }) : t(", {count} session done", { count: day.sessions })) : ""}
              {day.isToday ? t(", today") : ""}
            </span>
            {day.isToday ? <span className="bf-week-today">{t("Today")}</span> : null}
          </li>
        ))}
      </ol>
      <p className="hint">{t("Circles are your recommended days. Practicing on any day counts, and daily practice is fine if you enjoy it.")}</p>
      {editable ? (
        <details>
          <summary>{t("Choose my practice days")}</summary>
          <div className="lz-tabs" role="group" aria-label={t("Practice days")}>
            {WEEKDAY_NAMES.map((name, weekday) => (
              <button
                key={name}
                type="button"
                className="lz-tab"
                disabled={sample}
                aria-pressed={breathe.days.includes(weekday)}
                onClick={() => commitBreathe((s) => toggleDay(s, weekday))}
              >
                {days[weekday] ? dates.weekdayShort(days[weekday].date) : name.slice(0, 3)}
              </button>
            ))}
          </div>
          <p className="hint">{t("Four days a week is the suggested minimum. Choose days that fit your routine.")}</p>
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
  const t = useT();
  const dates = useDates();
  return (
    <section className="card stack" aria-labelledby="bf-30">
      <h2 id="bf-30">{t("Your last 30 days")}</h2>
      <p>
        <Rich
          text={t("You practiced on <0>{count}</0> of the last 30 days. A blank day is not a failure, and there is no streak to lose.", { count })}
          parts={[(label) => <strong>{label}</strong>]}
        />
      </p>
      <ol className="bf-strip">
        {days.map((day) => (
          <li key={day.date} data-on={day.practiced} title={dates.long(day.date)}>
            <span className="sr-only">
              {dates.long(day.date)}: {day.practiced ? t("practiced") : t("no session")}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** My Current Life and My New Life: the habits being changed, and why they may help. */
export function LifeChangesPanel({ heading = msg("My current life, my new life") }: { heading?: string }) {
  const { answers, breathe } = useBreathe();
  const t = useT();
  const habits = breathe.challenge?.before ?? null;
  const personal = lifeChanges(answers, habits);
  const list = personal.length > 0 ? personal : generalNewLife();
  return (
    <section className="card stack" aria-labelledby="bf-life">
      <h2 id="bf-life">{t(heading)}</h2>
      {personal.length === 0 ? (
        <p className="hint">
          {answers || habits ? t("Your answers do not point to a specific change here, so these are general ideas.") : `${t("These are general ideas.")} `}
          {!answers ? (
            <Rich
              text={t("<0>Fill out your assessment</0> or answer the questions in the <1>30-day challenge</1> to make this personal.")}
              parts={[(label) => <Link href="/assessment">{label}</Link>, (label) => <Link href="/breathe/challenge">{label}</Link>]}
            />
          ) : null}
        </p>
      ) : (
        <p className="hint">{t("From your assessment and your answers in Breathe for Life. Only what you reported is used.")}</p>
      )}
      <div className="bf-life">
        {list.map((item) => (
          <article key={item.id} className="bf-life-row">
            {personal.length > 0 ? (
              <p className="bf-life-now">
                <span className="bf-life-label">{t("My current life")}</span>
                {t(item.current)}
              </p>
            ) : null}
            <p className="bf-life-new">
              <span className="bf-life-label">{t("My new life")}</span>
              {t(item.next)}
            </p>
            <p className="hint">{t(item.why)}</p>
          </article>
        ))}
      </div>
      <p className="hint">
        {t(
          "These habits may support blood vessel and breathing health as part of a healthy lifestyle. lifeZoi does not claim they raise nitric oxide in the body by any particular amount, and it does not measure nitric oxide.",
        )}
      </p>
    </section>
  );
}
