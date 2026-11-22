"use client";

import { useId } from "react";
import { useLocale, useT } from "@/components/locale-provider";
import type { Translate } from "@/lib/i18n/translate";
import { RATING_LABELS, RATINGS, type Rating, type RatingSummary } from "@/lib/feedback/types";

export function starsText(t: Translate, n: number): string {
  return n === 1 ? t("{count} Star", { count: n }) : t("{count} Stars", { count: n });
}

const STAR = "M12 2.8l2.75 5.6 6.15.9-4.45 4.33 1.05 6.12L12 16.87l-5.5 2.88 1.05-6.12L3.1 9.3l6.15-.9z";

/** One star. `fill` is 0 to 1, so 4.5 shows four full stars and half of the fifth. */
export function Star({ fill = 1, size = 22 }: { fill?: number; size?: number }) {
  const id = useId();
  const pct = `${Math.max(0, Math.min(1, fill)) * 100}%`;
  return (
    <svg className="fb-star" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={id}>
          <stop offset={pct} stopColor="var(--fb-star-on)" />
          <stop offset={pct} stopColor="var(--fb-star-off)" />
        </linearGradient>
      </defs>
      <path d={STAR} fill={`url(#${id})`} stroke="var(--fb-star-edge)" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

/** Read-only stars with a text equivalent for screen readers. */
export function StarRow({ value, size = 20 }: { value: number; size?: number }) {
  const t = useT();
  return (
    <span className="fb-star-row" role="img" aria-label={t("{value} out of 5 stars", { value: String(value) })}>
      {RATINGS.map((n) => (
        <Star key={n} size={size} fill={value - (n - 1)} />
      ))}
    </span>
  );
}

/**
 * The 1–5 star question. Five real radio buttons drawn as stars, so arrow keys,
 * Tab, and screen readers work the usual way.
 */
export function StarPicker({ value, onChange, labelledBy }: { value: Rating | null; onChange: (value: Rating) => void; labelledBy: string }) {
  const t = useT();
  const name = useId();
  return (
    <div className="fb-picker" role="radiogroup" aria-labelledby={labelledBy}>
      <div className="fb-picker-stars">
        {RATINGS.map((n) => (
          <label key={n} className="fb-picker-star" data-on={value !== null && n <= value ? "true" : undefined}>
            <input
              type="radio"
              className="sr-only"
              name={name}
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
            />
            <Star size={44} fill={value !== null && n <= value ? 1 : 0} />
            <span className="sr-only">
              {starsText(t, n)} — {t(RATING_LABELS[n])}
            </span>
          </label>
        ))}
      </div>
      <p className="fb-picker-label" aria-live="polite">
        {value ? `${starsText(t, value)} — ${t(RATING_LABELS[value])}` : t("Tap a star to choose")}
      </p>
    </div>
  );
}

/** Average, total, and the five-bar distribution. Shows an honest empty state with no reviews. */
export function RatingSummaryCard({ summary, title }: { summary: RatingSummary; title?: string }) {
  const t = useT();
  const { locale } = useLocale();
  const max = Math.max(1, ...RATINGS.map((n) => summary.counts[n]));
  const average = summary.average === null ? null : summary.average.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return (
    <section className="fb-summary" aria-labelledby="fb-summary-title">
      <div className="fb-summary-score">
        <h2 id="fb-summary-title" className="fb-summary-title">{title ?? t("Average LifeZoi rating")}</h2>
        {average ? (
          <>
            <p className="fb-summary-number">
              {average}
              <span className="fb-summary-outof"> / 5</span>
            </p>
            <StarRow value={summary.average ?? 0} size={26} />
            <p className="fb-summary-total">
              {summary.total === 1
                ? t("Based on {count} published review", { count: summary.total })
                : t("Based on {count} published reviews", { count: summary.total })}
            </p>
          </>
        ) : (
          <>
            <p className="fb-summary-empty">{t("No published reviews yet.")}</p>
            <p className="fb-summary-total">{t("The average appears here when the first genuine review is published. We never add sample ratings.")}</p>
          </>
        )}
      </div>
      <ul className="fb-bars" aria-label={t("Rating distribution")}>
        {[...RATINGS].reverse().map((n) => {
          const count = summary.counts[n];
          return (
            <li key={n} className="fb-bar-row">
              <span className="fb-bar-label">
                {n} <Star size={14} />
              </span>
              <span className="fb-bar-track" aria-hidden="true">
                <span className="fb-bar-fill" style={{ width: `${(count / max) * 100}%` }} />
              </span>
              <span className="fb-bar-count">
                <span className="sr-only">{starsText(t, n)}: </span>
                {count}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
