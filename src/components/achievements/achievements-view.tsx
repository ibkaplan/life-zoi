"use client";

import "@/components/achievements/achievements.css";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useLocale, useT } from "@/components/locale-provider";
import { useSession } from "@/components/session-provider";
import { LoadingState } from "@/components/sources";
import { formatDay, useToday } from "@/components/growth-academy/shared";
import { useAccount } from "@/lib/account-store";
import { activityDays, anyActiveDays, AREAS, currentRun, daysThisWeek, runHistory, weekGrid, type AreaInfo } from "@/lib/achievements/activity";
import { badgeStatuses, nextBadges, recentBadges, type BadgeStatus } from "@/lib/achievements/badges";
import { getCalorieServerSnapshot, getCalorieSnapshot, subscribeCalories } from "@/lib/calories/store";
import { useCompanion } from "@/lib/companion/store";
import { useAcademy } from "@/lib/growth-academy/store";
import { useHealthDiary } from "@/lib/health-diary/store";
import type { Translate } from "@/lib/i18n/translate";

/**
 * My Streaks & Achievements: days in a row and calm badges across all of
 * LifeZoi, read from what the person already saved. A pause is never shown
 * as a loss, and nothing here asks the person to keep a run going.
 */
export function AchievementsView() {
  const t = useT();
  const { locale } = useLocale();
  const today = useToday();
  const { ready, sample } = useSession();
  const account = useAccount();
  const userId = account.phase === "ready" ? account.userId : null;
  const companion = useCompanion();
  const academy = useAcademy();
  const calories = useSyncExternalStore(subscribeCalories, getCalorieSnapshot, getCalorieServerSnapshot);
  const diary = useHealthDiary(userId, sample);

  if (!ready || !companion.ready || !academy.ready) return <LoadingState label={t("Loading your activity…")} />;

  const days = activityDays({ companion: companion.state, academy: academy.state, calories, readings: diary.readings }, today);
  const all = anyActiveDays(days);
  const run = currentRun(all, today);
  const { longest } = runHistory(all);
  const week = daysThisWeek(all, today);
  const statuses = badgeStatuses(days);
  const earned = statuses.filter((badge) => badge.earnedOn);
  const recent = recentBadges(statuses);
  const next = nextBadges(statuses);
  const grid = weekGrid(all, today);
  const activeToday = all.includes(today);
  const academyBadges = Object.keys(academy.state.achievements).length;

  return (
    <div className="ach stack-lg">
      <section className="ach-hero" aria-labelledby="ach-title">
        <p className="ach-kicker">{t("Progress")}</p>
        <h1 id="ach-title">{t("My Streaks & Achievements")}</h1>
        <p className="ach-lede">
          {t("Every part of LifeZoi in one place: the days you did something for your health, and calm badges along the way. Any day counts, and a pause never takes anything away.")}
        </p>
        {sample ? <p className="ach-note">{t("This is the labeled sample. Your own activity will appear here once you use LifeZoi.")}</p> : null}
        <dl className="ach-stats">
          <Stat label={t("Days in a row now")} value={String(run)} />
          <Stat label={t("Longest run")} value={String(longest)} />
          <Stat label={t("Active days this week")} value={t("{done} of 7", { done: week })} />
          <Stat label={t("Active days in total")} value={String(all.length)} />
          <Stat label={t("Badges earned")} value={t("{done} of {total}", { done: earned.length, total: statuses.length })} />
        </dl>
        <p className="ach-message" role="status">
          {runMessage(t, run, activeToday, all.length)}
        </p>
      </section>

      {recent.length > 0 ? (
        <section className="stack" aria-labelledby="ach-recent">
          <h2 id="ach-recent">{t("Recently earned")}</h2>
          <ul className="ach-badges">
            {recent.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} locale={locale} t={t} />
            ))}
          </ul>
        </section>
      ) : null}

      {next.length > 0 ? (
        <section className="stack" aria-labelledby="ach-next">
          <h2 id="ach-next">{t("Coming up, whenever you like")}</h2>
          <ul className="ach-badges">
            {next.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} locale={locale} t={t} />
            ))}
          </ul>
        </section>
      ) : null}

      <section className="stack" aria-labelledby="ach-areas">
        <h2 id="ach-areas">{t("Each part of LifeZoi")}</h2>
        <p className="ach-lede">{t("Days are counted on any days you chose. Nothing needs to be done every day.")}</p>
        <div className="ach-areas">
          {AREAS.map((area) => (
            <AreaCard key={area.id} area={area} dates={days[area.id]} today={today} locale={locale} t={t} statuses={statuses} />
          ))}
        </div>
        {diary.status === "not-ready" || diary.status === "offline" ? (
          <p className="ach-note">{t("Health diary readings could not be read just now, so they are not counted here yet.")}</p>
        ) : null}
      </section>

      <section className="stack" aria-labelledby="ach-calendar">
        <h2 id="ach-calendar">{t("The last twelve weeks")}</h2>
        <p className="ach-lede">{t("A filled day had at least one activity. An empty day is simply a rest day.")}</p>
        <div className="ach-cal" role="table" aria-label={t("Active days, the last twelve weeks")}>
          <div className="ach-cal-row ach-cal-head" role="row">
            <span role="columnheader" className="ach-cal-week">
              {t("Week of")}
            </span>
            {weekdayNames(locale).map((name) => (
              <span key={name} role="columnheader" className="ach-cal-name">
                {name}
              </span>
            ))}
          </div>
          {grid.map((row) => (
            <div key={row.monday} className="ach-cal-row" role="row">
              <span role="rowheader" className="ach-cal-week">
                {shortDay(row.monday, locale)}
              </span>
              {row.days.map((day, index) =>
                day ? (
                  <span
                    key={day.date}
                    role="cell"
                    className={`ach-cal-day${day.active ? " is-active" : ""}${day.date === today ? " is-today" : ""}`}
                    title={formatDay(day.date, locale)}
                    aria-label={`${formatDay(day.date, locale)}: ${day.active ? t("active") : t("rest day")}`}
                  />
                ) : (
                  <span key={`${row.monday}-${index}`} role="cell" className="ach-cal-day is-future" aria-hidden="true" />
                ),
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="stack" aria-labelledby="ach-all">
        <h2 id="ach-all">{t("All badges")}</h2>
        <ul className="ach-badges">
          {statuses
            .filter((badge) => badge.group === "together")
            .map((badge) => (
              <BadgeCard key={badge.id} badge={badge} locale={locale} t={t} />
            ))}
        </ul>
      </section>

      <section className="ach-card stack" aria-labelledby="ach-more">
        <h2 id="ach-more">{t("More achievements")}</h2>
        <p className="ach-lede">{t("Some parts of LifeZoi keep their own record with more detail.")}</p>
        <div className="ach-row">
          <Link className="btn btn-secondary" href="/training-academy/journey">
            {academyBadges > 0 ? t("My Growth Journey: {count} Academy achievements", { count: academyBadges }) : t("My Growth Journey")}
          </Link>
          <Link className="btn btn-secondary" href="/brain-quiz">
            {t("My Brain Journey")}
          </Link>
          <Link className="btn btn-secondary" href="/progress">
            {t("Progress")}
          </Link>
        </div>
      </section>

      <p className="ach-note">
        {t("Worked out in this browser from what you already saved. Nothing new is stored and nothing is sent anywhere. “Clear my data” in Settings clears these too.")}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="ach-stat">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function runMessage(t: Translate, run: number, activeToday: boolean, total: number): string {
  if (total === 0) return t("Your first active day can be any day you like. A short walk, a few breaths, or a quiz all count.");
  if (run === 0) return t("Welcome back. Whenever you do something for yourself today, a new run begins.");
  if (!activeToday) return t("{count} days in a row so far. Today is still open, with no rush.", { count: run });
  if (run === 1) return t("You did something for your health today. That counts.");
  return t("{count} days in a row, including today. Lovely, steady care.", { count: run });
}

function BadgeCard({ badge, locale, t }: { badge: BadgeStatus; locale: string; t: Translate }) {
  const earned = Boolean(badge.earnedOn);
  return (
    <li className={`ach-badge${earned ? " is-earned" : ""}`}>
      <span className="ach-badge-icon" aria-hidden="true">
        {badge.icon}
      </span>
      <span className="ach-badge-body">
        <strong>{t(badge.title)}</strong>
        <span>{t(badge.text)}</span>
        <span className="ach-badge-meta">
          {earned
            ? t("Earned {date}", { date: formatDay(badge.earnedOn, locale) })
            : badge.goal > 1
              ? t("{done} of {total} so far", { done: badge.progress, total: badge.goal })
              : t("Not yet")}
        </span>
      </span>
    </li>
  );
}

function AreaCard({ area, dates, today, locale, t, statuses }: { area: AreaInfo; dates: string[]; today: string; locale: string; t: Translate; statuses: BadgeStatus[] }) {
  const run = currentRun(dates, today);
  const week = daysThisWeek(dates, today);
  const last = dates.at(-1) ?? "";
  const badges = statuses.filter((badge) => badge.area === area.id);
  return (
    <article className="ach-card ach-area" aria-labelledby={`ach-area-${area.id}`}>
      <div className="ach-area-head">
        <span className="ach-badge-icon" aria-hidden="true">
          {area.icon}
        </span>
        <h3 id={`ach-area-${area.id}`}>{t(area.title)}</h3>
      </div>
      <p className="ach-small">{t(area.text)}</p>
      {dates.length === 0 ? (
        <p className="ach-small">{t("Nothing noted yet. Start whenever it suits you.")}</p>
      ) : (
        <dl className="ach-mini">
          <div>
            <dt>{t("Days in total")}</dt>
            <dd>{dates.length}</dd>
          </div>
          <div>
            <dt>{t("This week")}</dt>
            <dd>{week}</dd>
          </div>
          <div>
            <dt>{t("In a row now")}</dt>
            <dd>{run}</dd>
          </div>
          <div>
            <dt>{t("Last time")}</dt>
            <dd>{last === today ? t("Today") : formatDay(last, locale)}</dd>
          </div>
        </dl>
      )}
      <ul className="ach-chips" aria-label={t("Badges")}>
        {badges.map((badge) => (
          <li key={badge.id} className={badge.earnedOn ? "is-earned" : ""} title={t(badge.text)}>
            <span aria-hidden="true">{badge.earnedOn ? "★" : "☆"} </span>
            {t(badge.title)}
            <span className="sr-only">{badge.earnedOn ? `, ${t("Earned {date}", { date: formatDay(badge.earnedOn, locale) })}` : `, ${t("Not yet")}`}</span>
          </li>
        ))}
      </ul>
      <Link className="btn btn-secondary ach-area-link" href={area.href}>
        {t(area.cta)}
      </Link>
    </article>
  );
}

function weekdayNames(locale: string): string[] {
  const format = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  // 2024-01-01 was a Monday.
  return Array.from({ length: 7 }, (_, i) => format.format(new Date(Date.UTC(2024, 0, 1 + i))));
}

function shortDay(iso: string, locale: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d)));
}
