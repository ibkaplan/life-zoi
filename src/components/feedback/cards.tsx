"use client";

/* eslint-disable @next/next/no-img-element -- announcement images are small files from the site's own public folder */
import { useLocale, useT } from "@/components/locale-provider";
import { StarRow } from "@/components/feedback/stars";
import { formatDay } from "@/components/feedback/client";
import { RATING_LABELS, type PublicAnnouncement, type PublicReview } from "@/lib/feedback/types";

/** A published review. Text is shown exactly as the member wrote it. */
export function ReviewCard({ review }: { review: PublicReview }) {
  const t = useT();
  const { locale } = useLocale();
  const name = review.name ?? t("A LifeZoi member");
  return (
    <article className="fb-review">
      <header className="fb-review-head">
        <span className="fb-avatar" aria-hidden="true">{review.name ? review.name.slice(0, 1).toLocaleUpperCase(locale) : "★"}</span>
        <div>
          <p className="fb-review-name">{name}</p>
          <p className="fb-review-date">
            <time dateTime={review.createdAt}>{formatDay(review.createdAt, locale)}</time>
          </p>
        </div>
      </header>
      <div className="fb-review-rating">
        <StarRow value={review.rating} />
        <span className="fb-review-rating-label">{t(RATING_LABELS[review.rating])}</span>
      </div>
      {review.likedText ? (
        <div className="fb-review-part">
          <p className="fb-review-part-title">{t("What I liked most")}</p>
          <p className="fb-review-text">{review.likedText}</p>
        </div>
      ) : null}
      {review.improveText ? (
        <div className="fb-review-part">
          <p className="fb-review-part-title">{t("What could be better")}</p>
          <p className="fb-review-text">{review.improveText}</p>
        </div>
      ) : null}
      {review.thoughts ? (
        <div className="fb-review-part">
          <p className="fb-review-part-title">{t("Other thoughts")}</p>
          <p className="fb-review-text">{review.thoughts}</p>
        </div>
      ) : null}
      {!review.likedText && !review.improveText && !review.thoughts ? <p className="hint">{t("Rating only, without a written review.")}</p> : null}
    </article>
  );
}

export function AnnouncementCard({ item, compact = false }: { item: PublicAnnouncement; compact?: boolean }) {
  const t = useT();
  const { locale } = useLocale();
  return (
    <article className={compact ? "fb-announce fb-announce-compact" : "fb-announce"}>
      {item.imagePath && !compact ? <img className="fb-announce-img" src={item.imagePath} alt="" loading="lazy" /> : null}
      <div className="fb-announce-body">
        <p className="fb-announce-kicker">
          <span aria-hidden="true">✦ </span>
          {t("You asked, we listened!")}
        </p>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <p className="fb-announce-meta">
          <time dateTime={item.implementedOn}>{t("Added on {date}", { date: formatDay(item.implementedOn, locale) })}</time>
          {item.category ? <span className="fb-tag">{item.category}</span> : null}
        </p>
      </div>
    </article>
  );
}
