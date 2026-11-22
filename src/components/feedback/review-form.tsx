"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { useLocale, useT } from "@/components/locale-provider";
import { StarPicker } from "@/components/feedback/stars";
import { newRequestId, postJson } from "@/components/feedback/client";
import { DISPLAY_NAME_MAX, REVIEW_TEXT_MAX, REVIEW_THOUGHTS_MAX } from "@/lib/feedback/policy";
import { APP_SECTIONS, RECOMMEND_LABELS, RECOMMEND_OPTIONS, type Rating, type Recommend } from "@/lib/feedback/types";
import { markReviewSent } from "@/lib/feedback/invitation";

type Props = { disabledUntil: string | null; sentNotice: string | null; onSent: (notice: string) => void };

function SectionChips({ legend, value, onChange }: { legend: string; value: string[]; onChange: (next: string[]) => void }) {
  const t = useT();
  return (
    <fieldset className="fb-chips">
      <legend className="fb-chips-legend">{legend}</legend>
      <div className="fb-chip-list">
        {APP_SECTIONS.map((section) => {
          const on = value.includes(section.id);
          return (
            <label key={section.id} className="fb-chip" data-on={on ? "true" : undefined}>
              <input
                type="checkbox"
                className="sr-only"
                checked={on}
                onChange={() => onChange(on ? value.filter((id) => id !== section.id) : [...value, section.id])}
              />
              <span aria-hidden="true">{on ? "✓ " : ""}</span>
              {t(section.label)}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** The five questions plus a larger box. Only the star rating is needed; everything else is optional. */
export function ReviewForm({ disabledUntil, sentNotice, onSent }: Props) {
  const t = useT();
  const { locale } = useLocale();
  const ids = { rating: useId(), liked: useId(), improve: useId(), features: useId(), thoughts: useId(), name: useId(), recommend: useId() };
  const [requestId, setRequestId] = useState(newRequestId);
  const [rating, setRating] = useState<Rating | null>(null);
  const [likedText, setLikedText] = useState("");
  const [likedSections, setLikedSections] = useState<string[]>([]);
  const [improveText, setImproveText] = useState("");
  const [improveSections, setImproveSections] = useState<string[]>([]);
  const [featuresText, setFeaturesText] = useState("");
  const [recommend, setRecommend] = useState<Recommend | null>(null);
  const [thoughts, setThoughts] = useState("");
  const [publishConsent, setPublishConsent] = useState(false);
  const [showName, setShowName] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string; field?: string } | null>(null);

  if (disabledUntil) {
    return (
      <section className="fb-card fb-thanks" aria-labelledby="fb-thanks-title">
        <h2 id="fb-thanks-title">{t("Thank you for your review!")}</h2>
        {sentNotice ? <p className="fb-notice" role="status">{sentNotice}</p> : null}
        <p>
          {t("You can send another review after {date}. Until then, you can share ideas and report problems on the Suggestions page.", {
            date: new Date(disabledUntil).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" }),
          })}
        </p>
        <div className="actions">
          <Link className="btn btn-primary fb-btn" href="/feedback/suggest">{t("Share a suggestion")}</Link>
          <Link className="btn btn-secondary fb-btn" href="/feedback/members-say">{t("What our members say")}</Link>
        </div>
      </section>
    );
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!rating) {
      setResult({ ok: false, text: t("Choose from 1 to 5 stars first."), field: "rating" });
      document.getElementById(ids.rating)?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    setBusy(true);
    setResult(null);
    const sent = await postJson("/api/feedback", {
      action: "review",
      rating,
      likedText,
      likedSections,
      improveText,
      improveSections,
      featuresText,
      recommend,
      thoughts,
      publishConsent,
      showName: publishConsent && showName,
      displayName: publishConsent && showName ? displayName : "",
      locale,
      clientRequestId: requestId,
      website,
    });
    setBusy(false);
    if (sent.ok) {
      markReviewSent();
      setResult({ ok: true, text: t(sent.notice) });
      setRequestId(newRequestId());
      onSent(t(sent.notice));
      return;
    }
    setResult({ ok: false, text: t(sent.error), field: sent.field });
  }

  const count = (text: string, max: number) => (
    <span className="fb-count" aria-hidden="true">
      {text.length} / {max}
    </span>
  );

  return (
    <form className="fb-card fb-form" onSubmit={submit} noValidate aria-labelledby="fb-form-title">
      <div className="fb-form-head">
        <h2 id="fb-form-title">{t("Share your experience")}</h2>
        <p className="hint">{t("Only the star rating is needed. Everything else is optional and takes about two minutes.")}</p>
      </div>

      <div className="fb-question" id={ids.rating}>
        <p className="fb-q" id={`${ids.rating}-label`}>
          <span className="fb-q-number">1</span> {t("How would you rate LifeZoi?")}
        </p>
        <StarPicker value={rating} onChange={setRating} labelledBy={`${ids.rating}-label`} />
      </div>

      <div className="fb-question">
        <label className="fb-q" htmlFor={ids.liked}>
          <span className="fb-q-number">2</span> {t("What did you like most about LifeZoi?")}
        </label>
        <SectionChips legend={t("Your favorite sections (optional)")} value={likedSections} onChange={setLikedSections} />
        <textarea id={ids.liked} value={likedText} maxLength={REVIEW_TEXT_MAX} onChange={(e) => setLikedText(e.target.value)} placeholder={t("Your favorite sections and features…")} rows={3} />
        {count(likedText, REVIEW_TEXT_MAX)}
      </div>

      <div className="fb-question">
        <label className="fb-q" htmlFor={ids.improve}>
          <span className="fb-q-number">3</span> {t("What would you like us to improve?")}
        </label>
        <SectionChips legend={t("Sections that need work (optional)")} value={improveSections} onChange={setImproveSections} />
        <textarea id={ids.improve} value={improveText} maxLength={REVIEW_TEXT_MAX} onChange={(e) => setImproveText(e.target.value)} placeholder={t("Anything you found confusing, difficult, or inconvenient…")} rows={3} />
        {count(improveText, REVIEW_TEXT_MAX)}
      </div>

      <div className="fb-question">
        <label className="fb-q" htmlFor={ids.features}>
          <span className="fb-q-number">4</span> {t("What features would you like us to add?")}
        </label>
        <textarea id={ids.features} value={featuresText} maxLength={REVIEW_TEXT_MAX} onChange={(e) => setFeaturesText(e.target.value)} placeholder={t("New tools, wellness topics, educational materials, or services…")} rows={3} />
        <p className="hint">{t("This answer goes to the LifeZoi team as a suggestion. It is not shown on the public reviews.")}</p>
        {count(featuresText, REVIEW_TEXT_MAX)}
      </div>

      <fieldset className="fb-question">
        <legend className="fb-q" id={ids.recommend}>
          <span className="fb-q-number">5</span> {t("Would you recommend LifeZoi to a friend?")}
        </legend>
        <div className="fb-segment">
          {RECOMMEND_OPTIONS.map((option) => (
            <label key={option} className="fb-segment-option" data-on={recommend === option ? "true" : undefined}>
              <input type="radio" className="sr-only" name={ids.recommend} checked={recommend === option} onChange={() => setRecommend(option)} />
              {t(RECOMMEND_LABELS[option])}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="fb-question">
        <label className="fb-q" htmlFor={ids.thoughts}>{t("Anything else?")}</label>
        <textarea id={ids.thoughts} className="fb-big" value={thoughts} maxLength={REVIEW_THOUGHTS_MAX} onChange={(e) => setThoughts(e.target.value)} placeholder={t("Share any additional thoughts or suggestions...")} rows={6} />
        {count(thoughts, REVIEW_THOUGHTS_MAX)}
      </div>

      <fieldset className="fb-consent">
        <legend className="fb-q">{t("Who can see your review")}</legend>
        <label className="fb-check">
          <input type="checkbox" checked={publishConsent} onChange={(e) => setPublishConsent(e.target.checked)} />
          <span>
            {t("Yes, LifeZoi may show my rating and my answers to questions 2, 3, and the last box on What our members say, after a team member reads them.")}
          </span>
        </label>
        {publishConsent ? (
          <div className="fb-name-choice">
            <label className="fb-radio">
              <input type="radio" name={ids.name} checked={!showName} onChange={() => setShowName(false)} />
              <span>{t("Show it anonymously, as “A LifeZoi member”")}</span>
            </label>
            <label className="fb-radio">
              <input type="radio" name={ids.name} checked={showName} onChange={() => setShowName(true)} />
              <span>{t("Show my first name")}</span>
            </label>
            {showName ? (
              <label className="field fb-name-field" htmlFor={ids.name + "-input"}>
                <span>{t("First name to show")}</span>
                <input
                  id={ids.name + "-input"}
                  type="text"
                  autoComplete="given-name"
                  maxLength={DISPLAY_NAME_MAX}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  aria-invalid={result?.field === "displayName" || undefined}
                />
              </label>
            ) : null}
          </div>
        ) : (
          <p className="hint">{t("Without this tick, your review stays private: only the LifeZoi team reads it.")}</p>
        )}
        <p className="hint">{t("Please do not include health records, contact details, or other people's names. The team can see which account sent a review, to keep out spam; that is never shown publicly.")}</p>
      </fieldset>

      {/* Left empty by people. Scripts that fill every field are ignored. */}
      <div className="fb-trap" aria-hidden="true">
        <label>
          Website
          <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>

      {result ? (
        <p className={result.ok ? "fb-notice" : "fb-error"} role={result.ok ? "status" : "alert"}>
          {result.text}
        </p>
      ) : null}

      <div className="actions">
        <button className="btn btn-primary fb-btn fb-btn-big" type="submit" disabled={busy}>
          {busy ? t("Sending…") : t("Send my review")}
        </button>
      </div>
    </form>
  );
}
