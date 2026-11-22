"use client";

import "@/components/feedback/feedback.css";
import Link from "next/link";
import { useAccount } from "@/lib/account-store";
import { useT } from "@/components/locale-provider";
import { useFeedbackBoard } from "@/components/feedback/client";
import { AnnouncementCard, ReviewCard } from "@/components/feedback/cards";
import { FeedbackIllustration } from "@/components/feedback/illustration";
import { ReviewForm } from "@/components/feedback/review-form";
import { RatingSummaryCard } from "@/components/feedback/stars";
import { StorageNote } from "@/components/feedback/storage-note";

/** /feedback: the welcome, the rating summary, the review form, and the ways to take part. */
export function FeedbackHome() {
  const t = useT();
  const account = useAccount();
  const { state, reload } = useFeedbackBoard();
  const board = state.phase === "ready" ? state.board : null;

  return (
    <div className="stack-lg fb">
      <section className="fb-hero">
        <div className="fb-hero-text">
          <p className="kicker">{t("Reviews & Feedback")}</p>
          <h1>{t("Your Voice Matters!")}</h1>
          <p className="lede">
            {t("We want to hear from you. Tell us what you love about LifeZoi, what we can improve, and what you would like us to add. Your feedback helps us build a better wellness experience for everyone.")}
          </p>
          <p className="fb-motto">{t("We listen. We improve. We grow together.")}</p>
          <div className="actions">
            <a className="btn btn-primary fb-btn fb-btn-big" href="#fb-form-title">{t("Leave a Review")}</a>
            <Link className="btn btn-secondary fb-btn fb-btn-big" href="/feedback/suggest">{t("Share a suggestion")}</Link>
          </div>
        </div>
        <FeedbackIllustration className="fb-hero-art" />
      </section>

      {account.phase === "ready" && account.isAdmin ? (
        <p className="fb-admin-link">
          <Link className="btn btn-secondary" href="/admin/feedback">{t("Open the review management dashboard")}</Link>
        </p>
      ) : null}

      {state.phase === "failed" ? <p className="fb-error" role="alert">{t(state.error)}</p> : null}
      {board ? <StorageNote storage={board.storage} /> : null}

      <div className="fb-grid-2">
        {board ? <RatingSummaryCard summary={board.summary} /> : <p className="fb-card" role="status">{t("Loading reviews…")}</p>}
        <nav className="fb-ways" aria-label={t("Ways to take part")}>
          <Link className="fb-way" href="/feedback/members-say">
            <span className="fb-way-icon" aria-hidden="true">★</span>
            <span>
              <strong>{t("What our members say")}</strong>
              <span>{t("Read genuine reviews from LifeZoi members.")}</span>
            </span>
          </Link>
          <Link className="fb-way" href="/feedback/suggest">
            <span className="fb-way-icon fb-way-teal" aria-hidden="true">💡</span>
            <span>
              <strong>{t("LifeZoi listens to our members")}</strong>
              <span>{t("Suggest a feature, request content, or report something confusing.")}</span>
            </span>
          </Link>
          <Link className="fb-way" href="/feedback/listened">
            <span className="fb-way-icon fb-way-gold" aria-hidden="true">✦</span>
            <span>
              <strong>{t("You asked, we listened!")}</strong>
              <span>{t("See what we changed because of your feedback.")}</span>
            </span>
          </Link>
        </nav>
      </div>

      {board ? <ReviewForm disabledUntil={board.nextReviewAt} onSent={() => void reload()} /> : null}

      {board && board.announcements.length > 0 ? (
        <section className="stack" aria-labelledby="fb-latest-listened">
          <h2 id="fb-latest-listened">{t("You asked, we listened!")}</h2>
          <AnnouncementCard item={board.announcements[0]} compact />
          <p><Link href="/feedback/listened">{t("See every change")}</Link></p>
        </section>
      ) : null}

      {board && board.reviews.length > 0 ? (
        <section className="stack" aria-labelledby="fb-latest-reviews">
          <h2 id="fb-latest-reviews">{t("Latest reviews")}</h2>
          <div className="fb-review-grid">
            {board.reviews.slice(0, 3).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
          <p><Link href="/feedback/members-say">{t("Read all reviews")}</Link></p>
        </section>
      ) : null}
    </div>
  );
}
