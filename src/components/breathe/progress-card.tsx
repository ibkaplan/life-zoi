"use client";

import Link from "next/link";
import { useBreathe } from "@/components/breathe/use-breathe";
import { CHALLENGE_DAYS, challengeSummary, last30Days, weekProgress, WEEKLY_TARGET } from "@/lib/breathe/program";
import { localISODate } from "@/lib/dates";
import { useT } from "@/components/locale-provider";
import { Rich } from "@/components/companion/i18n";

/** A short Breathe for Life summary for the Progress and Plan pages. */
export function BreatheProgressCard() {
  const { ready, breathe } = useBreathe();
  const t = useT();
  if (!ready) return null;
  const today = localISODate();
  const week = weekProgress(breathe, today);
  const days30 = last30Days(breathe.sessions, today).filter((day) => day.practiced).length;
  const summary = challengeSummary(breathe, today);
  return (
    <section className="card stack" aria-labelledby="bf-progress-card">
      <h2 id="bf-progress-card">{t("Breathe for Life")}</h2>
      <ul className="record-list">
        <li>
          <Rich
            text={t("This week: <0>{done}</0> of {total} recommended breathing sessions", { done: week.practiceDays, total: WEEKLY_TARGET })}
            parts={[(label) => <strong>{label}</strong>]}
          />
        </li>
        <li>
          <Rich text={t("Last 30 days: <0>{days}</0> days with a session", { days: days30 })} parts={[(label) => <strong>{label}</strong>]} />
        </li>
        {summary ? (
          <li>
            {summary.ended
              ? t("30-day challenge: finished. See your summary.")
              : t("30-day challenge: day {day} of {total}, week {week}", { day: summary.day, total: CHALLENGE_DAYS, week: summary.week })}
          </li>
        ) : null}
      </ul>
      <p className="hint">{t("A count of sessions you recorded. It is not a nitric oxide measurement or a health result.")}</p>
      <div className="actions">
        <Link className="btn btn-primary" href="/breathe/practice">
          {t("Start Breathing Session")}
        </Link>
        <Link className="btn btn-secondary" href={summary ? "/breathe/challenge" : "/breathe"}>
          {summary ? t("Open the challenge") : t("Open Breathe for Life")}
        </Link>
      </div>
    </section>
  );
}
