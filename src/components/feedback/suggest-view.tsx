"use client";

import "@/components/feedback/feedback.css";
import { useId, useState } from "react";
import { useLocale, useT } from "@/components/locale-provider";
import { formatDay, newRequestId, postJson, useFeedbackBoard } from "@/components/feedback/client";
import { StorageNote } from "@/components/feedback/storage-note";
import { SUGGESTION_DETAILS_MAX, SUGGESTION_TITLE_MAX } from "@/lib/feedback/policy";
import { SUGGESTION_CATEGORIES, SUGGESTION_STATUS_LABELS, type SuggestionCategory } from "@/lib/feedback/types";

const ICONS: Record<SuggestionCategory, string> = {
  feature: "✨",
  improvement: "🛠️",
  "wellness-category": "🌿",
  problem: "🧩",
  "assistant-question": "💬",
  education: "📚",
  positive: "💜",
  missing: "🔍",
  other: "📝",
};

/** LifeZoi listens to our members: suggestions are saved privately for the team, with a status the member can follow. */
export function SuggestView() {
  const t = useT();
  const { locale } = useLocale();
  const ids = { title: useId(), details: useId(), category: useId() };
  const { state, reload } = useFeedbackBoard();
  const [category, setCategory] = useState<SuggestionCategory | null>(null);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [website, setWebsite] = useState("");
  const [requestId, setRequestId] = useState(newRequestId);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!category) {
      setResult({ ok: false, text: t("Choose what your suggestion is about.") });
      return;
    }
    setBusy(true);
    setResult(null);
    const sent = await postJson("/api/feedback", { action: "suggestion", category, title, details, locale, clientRequestId: requestId, website });
    setBusy(false);
    if (sent.ok) {
      setResult({ ok: true, text: t(sent.notice) });
      setTitle("");
      setDetails("");
      setCategory(null);
      setRequestId(newRequestId());
      void reload();
    } else {
      setResult({ ok: false, text: t(sent.error) });
    }
  }

  const own = state.phase === "ready" ? state.board.ownSuggestions : [];

  return (
    <div className="stack-lg fb">
      <section className="fb-hero fb-hero-slim fb-hero-teal">
        <div className="fb-hero-text">
          <p className="kicker">{t("Reviews & Feedback")}</p>
          <h1>{t("LifeZoi listens to our members")}</h1>
          <p className="lede">{t("You are part of how LifeZoi grows. Suggest a feature, ask for new content, recommend a wellness topic, or tell us what is confusing or missing. Every suggestion is read by the LifeZoi team.")}</p>
        </div>
      </section>

      {state.phase === "ready" ? <StorageNote storage={state.board.storage} /> : null}

      <form className="fb-card fb-form" onSubmit={submit} noValidate aria-labelledby="fb-suggest-title">
        <h2 id="fb-suggest-title">{t("Share a suggestion")}</h2>
        <fieldset className="fb-question">
          <legend className="fb-q" id={ids.category}>{t("What is it about?")}</legend>
          <div className="fb-topic-grid">
            {SUGGESTION_CATEGORIES.map((item) => (
              <label key={item.id} className="fb-topic" data-on={category === item.id ? "true" : undefined}>
                <input type="radio" className="sr-only" name={ids.category} checked={category === item.id} onChange={() => setCategory(item.id)} />
                <span className="fb-topic-icon" aria-hidden="true">{ICONS[item.id]}</span>
                <span>{t(item.label)}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className="field" htmlFor={ids.title}>
          <span>{t("A short title")}</span>
          <input id={ids.title} type="text" maxLength={SUGGESTION_TITLE_MAX} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("For example: More vegetarian recipes")} />
        </label>
        <label className="field" htmlFor={ids.details}>
          <span>{t("Tell us more (optional)")}</span>
          <textarea id={ids.details} className="fb-big" maxLength={SUGGESTION_DETAILS_MAX} value={details} onChange={(e) => setDetails(e.target.value)} rows={5} placeholder={t("What would help you, and where in LifeZoi?")} />
        </label>
        <p className="hint">{t("Suggestions are private. They are never shown on the public reviews. Please do not include health records or contact details.")}</p>
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
            {busy ? t("Sending…") : t("Send my suggestion")}
          </button>
        </div>
      </form>

      <section className="fb-card stack" aria-labelledby="fb-own-title">
        <h2 id="fb-own-title">{t("Your suggestions")}</h2>
        {state.phase === "loading" ? <p role="status">{t("Loading…")}</p> : null}
        {state.phase === "failed" ? <p className="fb-error" role="alert">{t(state.error)}</p> : null}
        {state.phase === "ready" && own.length === 0 ? <p className="hint">{t("You have not sent a suggestion yet. When you do, you can follow its status here.")}</p> : null}
        {own.length > 0 ? (
          <ul className="fb-own-list">
            {own.map((item) => (
              <li key={item.id} className="fb-own">
                <div>
                  <p className="fb-own-title">{item.title}</p>
                  <p className="hint">
                    {t(SUGGESTION_CATEGORIES.find((entry) => entry.id === item.category)?.label ?? "Something else")} · {formatDay(item.createdAt, locale)}
                  </p>
                </div>
                <span className="fb-status" data-status={item.status}>{t(SUGGESTION_STATUS_LABELS[item.status])}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
