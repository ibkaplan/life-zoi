"use client";

import "@/components/daily/daily.css";
import Link from "next/link";
import { useState } from "react";
import { Art } from "@/components/companion/art";
import { FeelingMatches } from "@/components/health-day/feeling-matches";
import "@/components/imagery/imagery.css";
import { LzPhoto } from "@/components/imagery/lz-photo";
import { useLocale, useT } from "@/components/locale-provider";
import { useSession } from "@/components/session-provider";
import { LoadingState } from "@/components/sources";
import { addExplored, setFeeling, skipFeeling, type DailyTopic } from "@/lib/companion/state";
import { commitCompanion, useCompanion } from "@/lib/companion/store";
import {
  areaLabel,
  FEELING_CHOICES,
  pickToday,
  progressIndicators,
  tipFor,
  TOPICS,
  weeklyReport,
  type ProgressIndicators,
  type WeeklyReport,
} from "@/lib/daily/daily";
import { localISODate } from "@/lib/dates";
import { partOfDay } from "@/lib/health-day/health-day";
import { LOCALE_META } from "@/lib/i18n/config";
import type { Translate } from "@/lib/i18n/translate";
import { firstNameOf } from "@/lib/news/greeting";
import { DAILY_PHOTOS } from "@/lib/imagery/registry";

type Panel = "feel" | "advice" | "progress" | null;

function useDateText() {
  const { locale } = useLocale();
  return (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return iso;
    return new Intl.DateTimeFormat(LOCALE_META[locale].htmlLang, { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(
      new Date(Date.UTC(y, m - 1, d)),
    );
  };
}

function greeting(t: Translate, name: string | undefined): string {
  const hour = new Date().getHours();
  const part = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  if (name) {
    if (part === "morning") return t("Good morning, {name}!", { name });
    if (part === "afternoon") return t("Good afternoon, {name}!", { name });
    return t("Good evening, {name}!", { name });
  }
  if (part === "morning") return t("Good morning!");
  if (part === "afternoon") return t("Good afternoon!");
  return t("Good evening!");
}

/**
 * LifeZoi Daily: a friendly welcome, one suggestion from the saved assessment,
 * one tip, and three large buttons. Nothing here is required.
 * `variant="home"` is the block at the top of the members' home; `variant="page"`
 * is the full /daily page with the weekly report.
 */
export function LifeZoiDaily({ variant }: { variant: "home" | "page" }) {
  const { ready, session, sample } = useSession();
  const companion = useCompanion();
  const t = useT();
  const dateText = useDateText();
  const [panel, setPanel] = useState<Panel>(null);
  const [showMore, setShowMore] = useState(false);
  const [notSaved, setNotSaved] = useState(false);

  if (!ready || !companion.ready) return <LoadingState label={t("Loading LifeZoi Daily…")} />;

  const today = localISODate();
  const latest = session.history[0] ?? null;
  const name = sample ? undefined : firstNameOf(latest?.answers.displayName || session.draft.displayName);
  const feeling = companion.state.daily.feelings[today] ?? null;
  const skipped = companion.state.daily.skipped.includes(today);
  const pick = pickToday(latest?.answers ?? null, today, feeling);
  const tip = tipFor(today, pick.topic.id);
  const indicators = progressIndicators(session, companion.state, today);
  const HeadingTag = variant === "page" ? "h1" : "h2";

  const save = (change: Parameters<typeof commitCompanion>[0]) => {
    const ok = commitCompanion(change);
    setNotSaved(!ok);
  };
  const explore = (topic: DailyTopic) => save((state) => addExplored(state, today, topic));
  const toggle = (next: Exclude<Panel, null>) => {
    setPanel((current) => (current === next ? null : next));
    if (next === "advice" && panel !== "advice") explore(pick.topic.id);
  };
  const reply = FEELING_CHOICES.find((choice) => choice.id === feeling);

  return (
    <div className="lzd stack-lg">
      <section className="lzd-hero" aria-labelledby="lzd-title">
        <div className="lzd-hero-text">
          <p className="lzd-kicker">{t("LifeZoi Daily")}</p>
          <HeadingTag id="lzd-title" className="lzd-title">
            {t("Your Wellness Journey")}
          </HeadingTag>
          <p className="lzd-greeting">{greeting(t, name)}</p>
          <p className="lzd-lede">
            {pick.personalized
              ? t("Here is one idea for today, picked from your Lifestyle Assessment, and one short tip. No forms to fill in.")
              : t("Here is one idea for today and one short tip. No forms to fill in.")}
          </p>
        </div>
        <div className="lzd-hero-art">
          <LzPhoto id={variant === "page" ? DAILY_PHOTOS.calm : DAILY_PHOTOS.morning} variant="inset" />
        </div>
      </section>

      <div className="lzd-today">
        <article className="lzd-card lzd-idea" aria-labelledby="lzd-idea-title">
          <div className="lzd-idea-art">
            <Art name={pick.topic.art} />
          </div>
          <div className="lzd-idea-body">
            <p className="lzd-label">{t("Today's idea")}</p>
            <h3 id="lzd-idea-title">{t(pick.topic.title)}</h3>
            <p className="lzd-advice">{t(pick.advice)}</p>
            {pick.reason ? (
              <p className="lzd-why">
                <strong>{t("Why this?")}</strong> {t(pick.reason)}
              </p>
            ) : (
              <p className="lzd-why">
                {t("Take the Lifestyle Assessment when you have time, and these ideas will fit you better.")}{" "}
                <Link href="/assessment">{t("Open the assessment")}</Link>
              </p>
            )}
          </div>
        </article>

        <aside className="lzd-card lzd-tip" aria-labelledby="lzd-tip-title">
          <p className="lzd-label" id="lzd-tip-title">
            <span aria-hidden="true">💡</span> {t("Tip of the day")}
          </p>
          <p className="lzd-tip-text">{t(tip.text)}</p>
          <p className="lzd-source">
            {t("Source:")} <a href={tip.source.url}>{tip.source.name}</a>
          </p>
        </aside>
      </div>

      <section aria-label={t("Three easy choices")} className="lzd-actions">
        <button type="button" className="lzd-big lzd-big-feel" aria-expanded={panel === "feel"} aria-controls="lzd-panel-feel" onClick={() => toggle("feel")}>
          <span className="lzd-big-icon" aria-hidden="true">
            {reply?.face ?? "😊"}
          </span>
          <span className="lzd-big-text">{t("How Do I Feel Today?")}</span>
          <span className="lzd-big-sub">{feeling ? t("You said: {feeling}", { feeling: t(reply?.label ?? "") }) : t("One tap, or skip")}</span>
        </button>
        <button type="button" className="lzd-big lzd-big-advice" aria-expanded={panel === "advice"} aria-controls="lzd-panel-advice" onClick={() => toggle("advice")}>
          <span className="lzd-big-icon" aria-hidden="true">
            🌿
          </span>
          <span className="lzd-big-text">{t("Give Me Today's Advice")}</span>
          <span className="lzd-big-sub">{t("One idea, and more if you like")}</span>
        </button>
        <button type="button" className="lzd-big lzd-big-progress" aria-expanded={panel === "progress"} aria-controls="lzd-panel-progress" onClick={() => toggle("progress")}>
          <span className="lzd-big-icon" aria-hidden="true">
            📈
          </span>
          <span className="lzd-big-text">{t("Show My Progress")}</span>
          <span className="lzd-big-sub">{t("Three simple views")}</span>
        </button>
      </section>

      {notSaved && sample ? (
        <p className="lzd-note" role="status">
          {t("The sample is on, so nothing is saved.")}
        </p>
      ) : null}

      {panel === "feel" ? (
        <section id="lzd-panel-feel" className="lzd-card lzd-panel" aria-labelledby="lzd-feel-title">
          <h3 id="lzd-feel-title">{t("How do you feel today?")}</h3>
          <p className="lzd-hint">{t("This is optional. Tap once, or skip it.")}</p>
          <div className="lzd-feelings" role="group" aria-label={t("How do you feel today?")}>
            {FEELING_CHOICES.map((choice) => (
              <button
                key={choice.id}
                type="button"
                className={`lzd-feeling lzd-feeling-${choice.id}`}
                aria-pressed={feeling === choice.id}
                onClick={() => save((state) => setFeeling(state, today, choice.id))}
              >
                <span aria-hidden="true">{choice.face}</span>
                {t(choice.label)}
              </button>
            ))}
          </div>
          {reply ? (
            <p className="lzd-reply" role="status">
              {t(reply.reply)}
            </p>
          ) : skipped ? (
            <p className="lzd-reply" role="status">
              {t("Skipped for today. That is completely fine.")}
            </p>
          ) : null}
          {feeling ? (
            <>
              <p className="lzd-label">{t("Matched to how you feel")}</p>
              <FeelingMatches feeling={feeling} part={partOfDay(new Date().getHours())} />
            </>
          ) : null}
          <div className="lzd-row">
            {!feeling && !skipped ? (
              <button type="button" className="btn btn-secondary lzd-skip" onClick={() => { save((state) => skipFeeling(state, today)); setPanel(null); }}>
                {t("Skip for today")}
              </button>
            ) : null}
            {feeling ? (
              <button type="button" className="btn btn-secondary lzd-skip" onClick={() => setPanel("advice")}>
                {t("See today's advice")}
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      {panel === "advice" ? (
        <section id="lzd-panel-advice" className="lzd-card lzd-panel" aria-labelledby="lzd-advice-title">
          <h3 id="lzd-advice-title">{t("Today's advice")}</h3>
          {feeling === "low" ? <p className="lzd-hint">{t("You said you have low energy today, so these are gentler ideas.")}</p> : null}
          <div className="lzd-advice-main">
            <p className="lzd-label">{t(pick.topic.title)}</p>
            <p className="lzd-advice">{t(pick.advice)}</p>
            {feeling === "great" ? <p>{t("Feeling good? You can make it a little longer today if it feels right.")}</p> : null}
            <Link className="btn btn-primary lzd-go" href={pick.topic.href}>
              {t(pick.topic.linkLabel)}
            </Link>
          </div>
          <p className="lzd-hint">{t("You do not need to record anything. Doing it is what counts.")}</p>
          <button type="button" className="btn btn-secondary lzd-more-btn" aria-expanded={showMore} onClick={() => setShowMore((value) => !value)}>
            {showMore ? t("Show less") : t("Explore more ideas")}
          </button>
          {showMore ? (
            <ul className="lzd-more">
              {pick.more.map((item) => (
                <li key={item.topic.id} className="lzd-more-item">
                  <div className="lzd-more-art">
                    <Art name={item.topic.art} />
                  </div>
                  <div>
                    <h4>{t(item.topic.title)}</h4>
                    <p>{t(item.advice)}</p>
                    {item.reason ? <p className="lzd-why">{t(item.reason)}</p> : null}
                    <Link href={item.topic.href} onClick={() => explore(item.topic.id)}>
                      {t(item.topic.linkLabel)}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {panel === "progress" ? (
        <section id="lzd-panel-progress" className="lzd-panel-plain" aria-labelledby="lzd-progress-title">
          <h3 id="lzd-progress-title" className="lzd-panel-heading">
            {t("Your progress")}
          </h3>
          <Indicators indicators={indicators} dateText={dateText} />
          {variant === "home" ? (
            <Link className="btn btn-primary lzd-go" href="/daily#weekly">
              {t("See my weekly report")}
            </Link>
          ) : (
            <a className="btn btn-primary lzd-go" href="#weekly">
              {t("See my weekly report")}
            </a>
          )}
        </section>
      ) : null}

      <p className="lzd-note">
        <span aria-hidden="true">🌱 </span>
        {t("Nothing here is required. You never have to record meals, water, or walks. A day without a record is simply a day without a record.")}
      </p>

      {variant === "page" ? <WeeklyReportView report={weeklyReport(session, companion.state, today)} dateText={dateText} /> : null}
      {variant === "home" ? (
        <p className="lzd-open">
          <Link href="/daily">{t("Open the full LifeZoi Daily page")}</Link>
        </p>
      ) : null}
    </div>
  );
}

function Indicators({ indicators, dateText }: { indicators: ProgressIndicators; dateText: (iso: string) => string }) {
  const t = useT();
  const { assessment, lifestyle, engagement } = indicators;
  return (
    <div className="lzd-indicators">
      <article className="lzd-card lzd-ind lzd-ind-assessment">
        <p className="lzd-ind-icon" aria-hidden="true">
          📝
        </p>
        <h4>{t("Initial Wellness Assessment")}</h4>
        <p className="lzd-ind-what">{t("Your starting point, from your own answers.")}</p>
        {assessment.status === "done" ? (
          <>
            <p className="lzd-ind-value">{t("Completed on {date}", { date: dateText(assessment.completedAt) })}</p>
            {assessment.counted > 0 ? (
              <p>{t("{met} of {counted} habit areas match public guidance.", { met: assessment.met, counted: assessment.counted })}</p>
            ) : null}
            {assessment.reassessOn ? <p>{t("Next check-in planned for {date}.", { date: dateText(assessment.reassessOn) })}</p> : null}
            <Link href="/assessment">{t("Update my answers")}</Link>
          </>
        ) : assessment.status === "started" ? (
          <>
            <p className="lzd-ind-value">{t("Started, not finished yet")}</p>
            <Link href="/assessment">{t("Continue the assessment")}</Link>
          </>
        ) : (
          <>
            <p className="lzd-ind-value">{t("Not taken yet")}</p>
            <Link href="/assessment">{t("Take the assessment")}</Link>
          </>
        )}
      </article>

      <article className="lzd-card lzd-ind lzd-ind-lifestyle">
        <p className="lzd-ind-icon" aria-hidden="true">
          🌿
        </p>
        <h4>{t("Lifestyle Progress")}</h4>
        <p className="lzd-ind-what">{t("Changes in your habits, from comparing your saved assessments. Time in the app does not count here.")}</p>
        {lifestyle.status === "compared" ? (
          <>
            <p className="lzd-ind-value">{t("From {from} to {to}", { from: dateText(lifestyle.from), to: dateText(lifestyle.to) })}</p>
            {lifestyle.improved.length > 0 ? (
              <p>{t("Now in line with guidance: {areas}", { areas: lifestyle.improved.map((id) => t(areaLabel(id))).join(", ") })}</p>
            ) : null}
            {lifestyle.steady > 0 ? <p>{t("Kept steady: {count} areas", { count: lifestyle.steady })}</p> : null}
            {lifestyle.slipped.length > 0 ? (
              <p>{t("Worth a little more attention: {areas}", { areas: lifestyle.slipped.map((id) => t(areaLabel(id))).join(", ") })}</p>
            ) : null}
            {lifestyle.improved.length === 0 && lifestyle.slipped.length === 0 ? <p>{t("Your answers were about the same both times.")}</p> : null}
          </>
        ) : lifestyle.status === "one-assessment" ? (
          <>
            <p className="lzd-ind-value">{t("Not enough to compare yet")}</p>
            <p>{t("This shows changes once you update your assessment, for example in a month. We never guess.")}</p>
          </>
        ) : (
          <>
            <p className="lzd-ind-value">{t("Nothing to compare yet")}</p>
            <p>{t("This starts after your first assessment.")}</p>
          </>
        )}
      </article>

      <article className="lzd-card lzd-ind lzd-ind-engagement">
        <p className="lzd-ind-icon" aria-hidden="true">
          ✨
        </p>
        <h4>{t("Daily Engagement")}</h4>
        <p className="lzd-ind-what">{t("Your time in LifeZoi in the last 7 days. It is not a health measurement.")}</p>
        {engagement.activeDays > 0 ? (
          <>
            <p className="lzd-ind-value">{t("{days} of the last 7 days", { days: engagement.activeDays })}</p>
            <p>{t("Things you used or marked in LifeZoi: {count}", { count: engagement.actions })}</p>
          </>
        ) : (
          <p className="lzd-ind-value">{t("Nothing recorded in the last 7 days")}</p>
        )}
        <p className="lzd-hint">{t("Days without a record are not missed days. Many healthy things happen away from the screen.")}</p>
      </article>
      <p className="lzd-hint lzd-devices">
        {t("LifeZoi does not connect to watches or other health devices. If that is ever added, it will only happen after you allow it.")}
      </p>
    </div>
  );
}

function WeeklyReportView({ report, dateText }: { report: WeeklyReport; dateText: (iso: string) => string }) {
  const t = useT();
  const feelingTotal = report.feelings.great + report.feelings.okay + report.feelings.low;
  return (
    <section id="weekly" className="lzd-week stack" aria-labelledby="lzd-week-title">
      <div className="lzd-week-head">
        <p className="lzd-kicker">{t("Weekly wellness report")}</p>
        <h2 id="lzd-week-title">{t("Your last 7 days")}</h2>
        <p className="lzd-hint">
          {t("{start} to {end}. Built only from what you recorded in LifeZoi.", { start: dateText(report.window.start), end: dateText(report.window.end) })}
        </p>
      </div>

      {report.empty ? (
        <p className="lzd-card lzd-week-empty">
          {t("Nothing was recorded in LifeZoi this week, so there is nothing to sum up. That is fine. It does not mean you did nothing, only that nothing was written down.")}
        </p>
      ) : null}

      <div className="lzd-week-grid">
        <article className="lzd-card">
          <h3>
            <span aria-hidden="true">✅ </span>
            {t("Activities completed")}
          </h3>
          {report.activities.length > 0 ? (
            <ul className="lzd-list">
              {report.activities.map((item) => (
                <li key={item.id}>
                  <span>{t(item.label)}</span>
                  <strong>{item.count}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p>{t("No activities were recorded this week.")}</p>
          )}
        </article>

        <article className="lzd-card">
          <h3>
            <span aria-hidden="true">📚 </span>
            {t("Wellness topics explored")}
          </h3>
          {report.topics.length > 0 ? (
            <ul className="lzd-chips">
              {report.topics.map((id) => (
                <li key={id}>{t(TOPICS[id].title)}</li>
              ))}
            </ul>
          ) : (
            <p>{t("No daily topics were opened this week.")}</p>
          )}
          {report.libraryOpened > 0 ? <p>{t("Videos, music, or books opened: {count}", { count: report.libraryOpened })}</p> : null}
        </article>

        <article className="lzd-card">
          <h3>
            <span aria-hidden="true">📏 </span>
            {t("Progress where measurable")}
          </h3>
          {report.assessmentUpdated ? (
            <p>
              {report.assessmentUpdated.improved.length > 0
                ? t("You updated your assessment. Now in line with guidance: {areas}", {
                    areas: report.assessmentUpdated.improved.map((id) => t(areaLabel(id))).join(", "),
                  })
                : t("You updated your assessment this week.")}
            </p>
          ) : null}
          {report.weights ? (
            report.weights.last ? (
              <p>
                {t("Weight you entered: {first} on {firstDate}, and {last} on {lastDate}.", {
                  first: `${report.weights.first.value} ${report.weights.first.unit}`,
                  firstDate: dateText(report.weights.first.date),
                  last: `${report.weights.last.value} ${report.weights.last.unit}`,
                  lastDate: dateText(report.weights.last.date),
                })}
              </p>
            ) : (
              <p>
                {t("Weight you entered: {first} on {firstDate}.", {
                  first: `${report.weights.first.value} ${report.weights.first.unit}`,
                  firstDate: dateText(report.weights.first.date),
                })}
              </p>
            )
          ) : null}
          {feelingTotal > 0 ? (
            <p>
              {t("How you felt on the days you answered: Great {great}, Okay {okay}, Low Energy {low}.", {
                great: report.feelings.great,
                okay: report.feelings.okay,
                low: report.feelings.low,
              })}
            </p>
          ) : null}
          {!report.assessmentUpdated && !report.weights && feelingTotal === 0 ? <p>{t("Nothing measurable was recorded this week. We do not guess.")}</p> : null}
        </article>

        <article className="lzd-card lzd-week-next">
          <h3>
            <span aria-hidden="true">🎯 </span>
            {t("Areas to focus on next week")}
          </h3>
          {report.focusNext.length > 0 ? (
            <ul className="lzd-next">
              {report.focusNext.map((item) => (
                <li key={item.topic.id}>
                  <strong>{t(item.topic.title)}</strong>
                  <span>{t(item.reason)}</span>
                  <Link href={item.topic.href}>{t(item.topic.linkLabel)}</Link>
                </li>
              ))}
            </ul>
          ) : report.suggestAssessment ? (
            <p>
              {t("Take the Lifestyle Assessment, and we will suggest areas that fit you.")} <Link href="/assessment">{t("Open the assessment")}</Link>
            </p>
          ) : (
            <p>{t("Your answers are in line with guidance in the areas we look at. Keep doing what works for you.")}</p>
          )}
        </article>
      </div>
    </section>
  );
}
