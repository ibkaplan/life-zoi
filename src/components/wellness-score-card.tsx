"use client";

import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import { LOCALE_META } from "@/lib/i18n/config";
import { areaById, bandOf, SCORE_BANDS, wellnessScore, type HabitAreaId } from "@/lib/wellness-score";
import type { CheckIn, CompletedAssessment } from "@/lib/types";

const RING = 2 * Math.PI * 52;

/**
 * My Wellness Score & Progress: one block built only from saved assessments and
 * check-ins. With nothing saved it shows an empty state, never a made-up score.
 */
export function WellnessScoreCard({
  history,
  monthCheckIns,
  sample,
}: {
  history: readonly CompletedAssessment[];
  monthCheckIns: readonly CheckIn[];
  sample: boolean;
}) {
  const { t, locale } = useLocale();
  const score = wellnessScore(history);
  const lang = LOCALE_META[locale].htmlLang;
  const date = (iso: string) => {
    const parsed = new Date(iso);
    return Number.isNaN(parsed.getTime()) ? "" : parsed.toLocaleDateString(lang, { day: "numeric", month: "short" });
  };
  const done = monthCheckIns.filter((item) => item.done).length;
  const areaName = (id: HabitAreaId) => t(areaById(id).label);

  return (
    <section className="ws" aria-labelledby="ws-title">
      <div className="ws-head">
        <p className="ws-kicker">{t("Where you are, what improved, what is next")}</p>
        <h2 id="ws-title">{t("My Wellness Score & Progress")}</h2>
        <p className="ws-lede">
          {t("Your score counts how many of seven everyday habit areas from your lifestyle assessment are in line with public health guidance.")}
        </p>
      </div>

      {!score ? (
        <div className="ws-empty">
          <div className="ws-ring ws-ring-empty" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" className="ws-ring-track" />
            </svg>
            <span>?</span>
          </div>
          <div className="stack">
            <h3>{t("No score yet")}</h3>
            <p>{t("Your score appears after you complete the lifestyle assessment. LifeZoi never fills in a score for you.")}</p>
            <Link className="btn btn-primary ws-btn" href="/assessment">{t("Start the assessment")}</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="ws-top">
            <ScoreRing met={score.current.met.length} counted={score.current.counted} band={t(bandOf(score.current).label)} bandId={bandOf(score.current).id} />
            <div className="ws-top-side">
              <ScaleBar share={score.current.counted ? score.current.met.length / score.current.counted : 0} />
              <div className="ws-compare" aria-label={t("Previous score compared with current score")}>
                <div className="ws-compare-box">
                  <span className="ws-compare-label">{t("Previous")}</span>
                  <strong>{score.previous ? t("{met} of {counted}", { met: score.previous.met.length, counted: score.previous.counted }) : "—"}</strong>
                  <span className="ws-compare-date">{score.previous ? date(score.previous.completedAt) : t("No earlier assessment")}</span>
                </div>
                <span className="ws-arrow" aria-hidden="true">→</span>
                <div className="ws-compare-box ws-compare-now">
                  <span className="ws-compare-label">{t("Current")}</span>
                  <strong>{t("{met} of {counted}", { met: score.current.met.length, counted: score.current.counted })}</strong>
                  <span className="ws-compare-date">{date(score.current.completedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="ws-chart-block">
            <h3>{t("Your progress over time")}</h3>
            {score.history.length < 2 ? (
              <p className="hint">{t("Save the assessment again later, for example in 30 days, to see your progress here.")}</p>
            ) : null}
            <ol className="ws-chart">
              {score.history.map((snap) => {
                const share = snap.counted ? snap.met.length / snap.counted : 0;
                return (
                  <li key={snap.id} className={`ws-bar ws-band-${bandOf(snap).id}`}>
                    <span className="ws-bar-value">{t("{met} of {counted}", { met: snap.met.length, counted: snap.counted })}</span>
                    <span className="ws-bar-track" aria-hidden="true">
                      <span className="ws-bar-fill" style={{ height: `${Math.max(share, 0.04) * 100}%` }} />
                    </span>
                    <span className="ws-bar-date">{date(snap.completedAt)}</span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="ws-grid">
            <div className="ws-panel ws-good">
              <h3><span aria-hidden="true">✓ </span>{t("What improved")}</h3>
              {!score.previous ? (
                <p>{t("This is your first saved assessment. Changes will show here next time.")}</p>
              ) : score.improved.length > 0 ? (
                <ul className="ws-chips">{score.improved.map((id) => <li key={id}>{areaName(id)}</li>)}</ul>
              ) : (
                <p>{t("No area moved into the guidance range since your last assessment.")}</p>
              )}
              {score.current.met.length > 0 ? (
                <>
                  <p className="ws-sub">{t("In line with guidance now")}</p>
                  <ul className="ws-chips ws-chips-soft">{score.current.met.map((id) => <li key={id}>{areaName(id)}</li>)}</ul>
                </>
              ) : null}
            </div>
            <div className="ws-panel ws-attention">
              <h3><span aria-hidden="true">● </span>{t("Areas that need attention")}</h3>
              {score.current.attention.length > 0 ? (
                <ul className="ws-chips ws-chips-warm">{score.current.attention.map((id) => <li key={id}>{areaName(id)}</li>)}</ul>
              ) : (
                <p>{t("Every area you answered is in line with guidance. Keep going.")}</p>
              )}
              {score.slipped.length > 0 ? (
                <p className="ws-sub">{t("Changed since last time: {areas}", { areas: score.slipped.map(areaName).join(", ") })}</p>
              ) : null}
            </div>
            <div className="ws-panel ws-next">
              <h3><span aria-hidden="true">➜ </span>{t("What to do next")}</h3>
              {score.current.attention.length > 0 ? (
                <>
                  <p><strong>{areaName(score.current.attention[0])}:</strong> {t(areaById(score.current.attention[0]).next)}</p>
                  <Link className="btn btn-primary ws-btn" href={areaById(score.current.attention[0]).href}>{t("Learn how")}</Link>
                </>
              ) : (
                <p>{t("Keep your routine and update your assessment in a month.")}</p>
              )}
              <Link className="btn btn-secondary ws-btn" href="/assessment">{t("Update assessment")}</Link>
            </div>
          </div>
        </>
      )}

      <div className="ws-checkins">
        <span className="ws-checkins-icon" aria-hidden="true">📅</span>
        <p>
          {monthCheckIns.length === 0
            ? t("No check-ins this month yet.")
            : t("This month: {done} of {count} check-ins marked done.", { done, count: monthCheckIns.length })}
        </p>
        <Link href="/progress">{t("Open Progress")}</Link>
      </div>

      <p className="ws-note">
        {t("This score counts your own answers. It is not a medical test, a diagnosis, or a prediction.")}
        {sample ? ` ${t("Shown from sample data.")}` : ""}
      </p>
    </section>
  );
}

function ScoreRing({ met, counted, band, bandId }: { met: number; counted: number; band: string; bandId: string }) {
  const t = useLocale().t;
  const share = counted ? met / counted : 0;
  return (
    <div className={`ws-ring ws-band-${bandId}`} role="img" aria-label={t("Current score: {met} of {counted} habit areas. {band}.", { met, counted, band })}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          <linearGradient id="ws-ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#B98EE5" />
            <stop offset="55%" stopColor="#6A3DA8" />
            <stop offset="100%" stopColor="#2F8F83" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="52" className="ws-ring-track" />
        <circle
          cx="60"
          cy="60"
          r="52"
          className="ws-ring-fill"
          strokeDasharray={`${RING * share} ${RING}`}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <span className="ws-ring-text" aria-hidden="true">
        <strong>{met}</strong>
        <span>{t("of {counted}", { counted })}</span>
      </span>
      <span className="ws-ring-band" aria-hidden="true">{band}</span>
    </div>
  );
}

function ScaleBar({ share }: { share: number }) {
  const t = useLocale().t;
  return (
    <div className="ws-scale">
      <div className="ws-scale-bar" aria-hidden="true">
        <span className="ws-scale-marker" style={{ left: `${Math.min(Math.max(share, 0), 1) * 100}%` }} />
      </div>
      <ul className="ws-scale-labels">
        {SCORE_BANDS.map((band) => (
          <li key={band.id}>{t(band.label)}</li>
        ))}
      </ul>
    </div>
  );
}
