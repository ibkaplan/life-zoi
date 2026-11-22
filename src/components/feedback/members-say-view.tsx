"use client";

import "@/components/feedback/feedback.css";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useT } from "@/components/locale-provider";
import { useFeedbackBoard } from "@/components/feedback/client";
import { ReviewCard } from "@/components/feedback/cards";
import { RatingSummaryCard } from "@/components/feedback/stars";
import { StorageNote } from "@/components/feedback/storage-note";
import { RATINGS } from "@/lib/feedback/types";

/** What our members say: genuine published reviews only, with the honest average. */
export function MembersSayView() {
  const t = useT();
  const { state } = useFeedbackBoard();
  const [stars, setStars] = useState<number | null>(null);
  const reviews = useMemo(() => {
    if (state.phase !== "ready") return [];
    return stars ? state.board.reviews.filter((review) => review.rating === stars) : state.board.reviews;
  }, [state, stars]);

  return (
    <div className="stack-lg fb">
      <section className="fb-hero fb-hero-slim">
        <div className="fb-hero-text">
          <p className="kicker">{t("Reviews & Feedback")}</p>
          <h1>{t("What our members say")}</h1>
          <p className="lede">{t("Genuine reviews from LifeZoi members, shown with their permission. Every rating counts in the average, including the critical ones.")}</p>
        </div>
      </section>

      {state.phase === "loading" ? <p className="fb-card" role="status">{t("Loading reviews…")}</p> : null}
      {state.phase === "failed" ? <p className="fb-error" role="alert">{t(state.error)}</p> : null}

      {state.phase === "ready" ? (
        <>
          <StorageNote storage={state.board.storage} />
          <RatingSummaryCard summary={state.board.summary} />
          {state.board.reviews.length > 0 ? (
            <div className="fb-filter" role="group" aria-label={t("Show reviews with")}>
              <button type="button" className="fb-filter-btn" aria-pressed={stars === null} onClick={() => setStars(null)}>
                {t("All")}
              </button>
              {[...RATINGS].reverse().map((n) => (
                <button key={n} type="button" className="fb-filter-btn" aria-pressed={stars === n} onClick={() => setStars(n)}>
                  {n} ★
                </button>
              ))}
            </div>
          ) : null}
          {reviews.length > 0 ? (
            <div className="fb-review-grid">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <section className="fb-card fb-empty">
              <h2>{state.board.reviews.length ? t("No reviews with this rating yet.") : t("Be the first to share your experience")}</h2>
              <p>{t("Reviews appear here after a LifeZoi team member reads them and the author has agreed to publication. We never show made-up testimonials.")}</p>
              <Link className="btn btn-primary fb-btn" href="/feedback#fb-form-title">{t("Leave a Review")}</Link>
            </section>
          )}
        </>
      ) : null}
    </div>
  );
}
