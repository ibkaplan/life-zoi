"use client";

import "@/components/feedback/feedback.css";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useT } from "@/components/locale-provider";
import { useAccount } from "@/lib/account-store";
import { formatDay, postJson } from "@/components/feedback/client";
import { msg } from "@/lib/i18n/translate";
import { StarRow } from "@/components/feedback/stars";
import { StorageNote } from "@/components/feedback/storage-note";
import { ADMIN_NOTE_MAX, ANNOUNCEMENT_DESCRIPTION_MAX, ANNOUNCEMENT_TITLE_MAX, THEME_MAX } from "@/lib/feedback/policy";
import type { AdminOverview, AdminReview, AdminSuggestion } from "@/lib/feedback/service";
import {
  APP_SECTIONS,
  FLAG_REASONS,
  FLAG_REASON_LABELS,
  RATINGS,
  RATING_LABELS,
  RECOMMEND_LABELS,
  REVIEW_STATUS_LABELS,
  SUGGESTION_CATEGORIES,
  SUGGESTION_STATUSES,
  SUGGESTION_STATUS_LABELS,
  type FlagReason,
  type StoredAnnouncement,
} from "@/lib/feedback/types";

type Tab = "overview" | "reviews" | "suggestions" | "announcements";
type Load = { phase: "loading" } | { phase: "ready"; data: AdminOverview } | { phase: "failed"; error: string };

/** Images already in the site's public folder that an announcement may use. */
const IMAGE_CHOICES = [
  "/imagery/brain.webp",
  "/imagery/nutrition.webp",
  "/imagery/movement.webp",
  "/imagery/sleep.webp",
  "/imagery/heart.webp",
  "/imagery/energy.webp",
  "/imagery/progress.webp",
  "/imagery/daily-calm.webp",
  "/imagery/daily-morning.webp",
  "/imagery/change-lab.webp",
  "/imagery/assessment.webp",
  "/imagery/longevity.webp",
];

const sectionLabel = (id: string) => APP_SECTIONS.find((section) => section.id === id)?.label ?? id;
const categoryLabel = (id: string) => SUGGESTION_CATEGORIES.find((item) => item.id === id)?.label ?? id;

function useAdminData(enabled: boolean) {
  const [state, setState] = useState<Load>({ phase: "loading" });
  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/feedback", { cache: "no-store" });
      const body = (await response.json().catch(() => ({}))) as AdminOverview & { error?: string };
      if (!response.ok) return setState({ phase: "failed", error: body.error ?? msg("Feedback could not be loaded. Try again later.") });
      setState({ phase: "ready", data: body });
    } catch {
      setState({ phase: "failed", error: msg("Feedback could not be loaded. Try again later.") });
    }
  }, []);
  useEffect(() => {
    if (!enabled) return;
    void Promise.resolve().then(load);
  }, [enabled, load]);
  return { state, load };
}

function Bars({ rows, label }: { rows: { id: string; count: number; label: string }[]; label: string }) {
  const t = useT();
  const max = Math.max(1, ...rows.map((row) => row.count));
  if (rows.length === 0) return <p className="hint">{t("Nothing yet.")}</p>;
  return (
    <ul className="fb-bars" aria-label={label}>
      {rows.map((row) => (
        <li key={row.id} className="fb-bar-row fb-bar-row-wide">
          <span className="fb-bar-label">{row.label}</span>
          <span className="fb-bar-track" aria-hidden="true">
            <span className="fb-bar-fill" style={{ width: `${(row.count / max) * 100}%` }} />
          </span>
          <span className="fb-bar-count">{row.count}</span>
        </li>
      ))}
    </ul>
  );
}

function Overview({ data }: { data: AdminOverview }) {
  const t = useT();
  const { locale } = useLocale();
  const a = data.analytics;
  const avg = (value: number | null) => (value === null ? "—" : value.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }));
  return (
    <div className="stack-lg">
      <div className="fb-stats">
        <div className="fb-stat">
          <span className="fb-stat-number">{avg(a.publishedReviews.average)}</span>
          <span>{t("Public average ({count} published)", { count: a.publishedReviews.total })}</span>
        </div>
        <div className="fb-stat">
          <span className="fb-stat-number">{avg(a.allReviews.average)}</span>
          <span>{t("Average of every review sent ({count})", { count: a.allReviews.total })}</span>
        </div>
        <div className="fb-stat">
          <span className="fb-stat-number">{a.reviewsByStatus.pending}</span>
          <span>{t("Reviews waiting to be read")}</span>
        </div>
        <div className="fb-stat fb-stat-warn">
          <span className="fb-stat-number">{a.reviewsByStatus.flagged}</span>
          <span>{t("Flagged for a closer look")}</span>
        </div>
        <div className="fb-stat">
          <span className="fb-stat-number">{a.lowRatings}</span>
          <span>{t("Reviews of 1 or 2 stars to learn from")}</span>
        </div>
        <div className="fb-stat">
          <span className="fb-stat-number">{a.suggestionsByStatus.new}</span>
          <span>{t("New suggestions")}</span>
        </div>
        <div className="fb-stat fb-stat-good">
          <span className="fb-stat-number">{a.completed}</span>
          <span>{t("Suggestions completed")}</span>
        </div>
        <div className="fb-stat">
          <span className="fb-stat-number">{a.publishedAnnouncements}</span>
          <span>{t("Published announcements")}</span>
        </div>
      </div>

      <div className="fb-grid-2">
        <section className="fb-card stack">
          <h3>{t("What members love most")}</h3>
          <p className="hint">{t("Sections ticked under “What did you like most”.")}</p>
          <Bars label={t("What members love most")} rows={a.lovedSections.map((row) => ({ ...row, label: t(sectionLabel(row.id)) }))} />
        </section>
        <section className="fb-card stack">
          <h3>{t("What needs work or causes confusion")}</h3>
          <p className="hint">{t("Sections ticked under “What would you like us to improve”.")}</p>
          <Bars label={t("What needs work or causes confusion")} rows={a.improveSections.map((row) => ({ ...row, label: t(sectionLabel(row.id)) }))} />
        </section>
        <section className="fb-card stack">
          <h3>{t("Most requested")}</h3>
          <p className="hint">{t("Suggestions grouped under the same theme. Give a suggestion a theme in the Suggestions tab.")}</p>
          {a.topThemes.length ? (
            <ul className="fb-theme-list">
              {a.topThemes.map((theme) => (
                <li key={theme.id}>
                  <span className="fb-tag">{theme.id}</span>
                  <span>{t("{count} requests, {open} still open", { count: theme.count, open: theme.open })}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="hint">{t("No themes yet.")}</p>
          )}
          {a.unthemed ? <p className="hint">{t("Open suggestions without a theme: {count}.", { count: a.unthemed })}</p> : null}
        </section>
        <section className="fb-card stack">
          <h3>{t("Suggestions by topic")}</h3>
          <Bars label={t("Suggestions by topic")} rows={a.suggestionsByCategory.map((row) => ({ ...row, label: t(categoryLabel(row.id)) }))} />
        </section>
        <section className="fb-card stack">
          <h3>{t("Every rating sent")}</h3>
          <Bars
            label={t("Every rating sent")}
            rows={[...RATINGS].reverse().map((n) => ({ id: String(n), count: a.allReviews.counts[n], label: `${n} ★ ${t(RATING_LABELS[n])}` }))}
          />
        </section>
        <section className="fb-card stack">
          <h3>{t("Would recommend LifeZoi to a friend")}</h3>
          <Bars
            label={t("Would recommend LifeZoi to a friend")}
            rows={[
              { id: "yes", count: a.recommend.yes, label: t(RECOMMEND_LABELS.yes) },
              { id: "maybe", count: a.recommend.maybe, label: t(RECOMMEND_LABELS.maybe) },
              { id: "no", count: a.recommend.no, label: t(RECOMMEND_LABELS.no) },
              { id: "unanswered", count: a.recommend.unanswered, label: t("Not answered") },
            ]}
          />
        </section>
        <section className="fb-card stack">
          <h3>{t("Suggestion progress")}</h3>
          <Bars
            label={t("Suggestion progress")}
            rows={SUGGESTION_STATUSES.map((status) => ({ id: status, count: a.suggestionsByStatus[status], label: t(SUGGESTION_STATUS_LABELS[status]) }))}
          />
        </section>
      </div>
    </div>
  );
}

function NoteBox({ initial, onSave }: { initial: string; onSave: (note: string) => Promise<void> }) {
  const t = useT();
  const [note, setNote] = useState(initial);
  return (
    <div className="fb-note-box">
      <label className="field">
        <span>{t("Private note (only administrators see this)")}</span>
        <textarea value={note} maxLength={ADMIN_NOTE_MAX} rows={2} onChange={(e) => setNote(e.target.value)} />
      </label>
      <button type="button" className="btn btn-secondary" disabled={note === initial} onClick={() => void onSave(note)}>
        {t("Save note")}
      </button>
    </div>
  );
}

function FlagControl({ flagged, reason, onFlag, onUnflag }: { flagged: boolean; reason: FlagReason | null; onFlag: (reason: FlagReason) => void; onUnflag: () => void }) {
  const t = useT();
  const [choice, setChoice] = useState<FlagReason>("spam");
  if (flagged) {
    return (
      <span className="fb-inline">
        <span className="fb-flag">⚑ {t(FLAG_REASON_LABELS[reason ?? "other"])}</span>
        <button type="button" className="btn btn-ghost" onClick={onUnflag}>{t("Remove flag")}</button>
      </span>
    );
  }
  return (
    <span className="fb-inline">
      <select aria-label={t("Reason for the flag")} value={choice} onChange={(e) => setChoice(e.target.value as FlagReason)}>
        {FLAG_REASONS.filter((item) => item !== "filter").map((item) => (
          <option key={item} value={item}>{t(FLAG_REASON_LABELS[item])}</option>
        ))}
      </select>
      <button type="button" className="btn btn-ghost" onClick={() => onFlag(choice)}>⚑ {t("Flag")}</button>
    </span>
  );
}

function DeleteButton({ onDelete }: { onDelete: () => void }) {
  const t = useT();
  const [confirm, setConfirm] = useState(false);
  if (!confirm) {
    return <button type="button" className="btn btn-ghost" onClick={() => setConfirm(true)}>{t("Delete")}</button>;
  }
  return (
    <span className="fb-inline">
      <button type="button" className="btn btn-danger" onClick={onDelete}>{t("Delete for good")}</button>
      <button type="button" className="btn btn-ghost" onClick={() => setConfirm(false)}>{t("Cancel")}</button>
    </span>
  );
}

function ReviewRow({ review, act }: { review: AdminReview; act: (payload: Record<string, unknown>) => Promise<void> }) {
  const t = useT();
  const { locale } = useLocale();
  const op = (name: string, extra: Record<string, unknown> = {}) => act({ target: "review", op: name, id: review.id, ...extra });
  return (
    <article className="fb-admin-item" data-status={review.status} data-flagged={review.flagged || undefined}>
      <header className="fb-admin-head">
        <StarRow value={review.rating} />
        <strong>{t(RATING_LABELS[review.rating])}</strong>
        <span className="fb-status" data-status={review.status}>{t(REVIEW_STATUS_LABELS[review.status])}</span>
        <span className="fb-tag">{review.publishConsent ? t("May be published") : t("Private feedback")}</span>
        {review.rating <= 2 ? <span className="fb-tag fb-tag-gold">{t("Critical feedback: read, do not remove for the rating")}</span> : null}
      </header>
      <p className="hint">
        {review.member} · {formatDay(review.createdAt, locale)} · {review.locale.toUpperCase()} ·{" "}
        {review.publishConsent ? (review.displayName ? t("Shown as {name}", { name: review.displayName }) : t("Shown anonymously")) : t("Not for publication")}
        {review.recommend ? ` · ${t("Would recommend: {answer}", { answer: t(RECOMMEND_LABELS[review.recommend]) })}` : ""}
      </p>
      <dl className="fb-answers">
        {review.likedText || review.likedSections.length ? (
          <>
            <dt>{t("What did you like most about LifeZoi?")}</dt>
            <dd>
              {review.likedSections.length ? <span className="fb-tags">{review.likedSections.map((id) => <span key={id} className="fb-tag">{t(sectionLabel(id))}</span>)}</span> : null}
              {review.likedText}
            </dd>
          </>
        ) : null}
        {review.improveText || review.improveSections.length ? (
          <>
            <dt>{t("What would you like us to improve?")}</dt>
            <dd>
              {review.improveSections.length ? <span className="fb-tags">{review.improveSections.map((id) => <span key={id} className="fb-tag">{t(sectionLabel(id))}</span>)}</span> : null}
              {review.improveText}
            </dd>
          </>
        ) : null}
        {review.featuresText ? (
          <>
            <dt>{t("What features would you like us to add?")}</dt>
            <dd>{review.featuresText}</dd>
          </>
        ) : null}
        {review.thoughts ? (
          <>
            <dt>{t("Anything else?")}</dt>
            <dd>{review.thoughts}</dd>
          </>
        ) : null}
      </dl>
      <div className="fb-admin-actions">
        {review.status !== "published" && review.status !== "hidden" ? (
          review.publishConsent ? (
            <button type="button" className="btn btn-primary" onClick={() => void op("publish")}>{t("Approve and publish")}</button>
          ) : null
        ) : null}
        {review.status !== "hidden" ? <button type="button" className="btn btn-secondary" onClick={() => void op("hide")}>{t("Hide")}</button> : null}
        {review.status === "hidden" ? <button type="button" className="btn btn-secondary" onClick={() => void op("restore")}>{t("Restore")}</button> : null}
        <FlagControl flagged={review.flagged} reason={review.flagReason} onFlag={(reason) => void op("flag", { reason })} onUnflag={() => void op("unflag")} />
        <DeleteButton onDelete={() => void op("delete")} />
      </div>
      <NoteBox key={review.adminNote} initial={review.adminNote} onSave={(note) => op("note", { note })} />
    </article>
  );
}

function SuggestionRow({ item, act }: { item: AdminSuggestion; act: (payload: Record<string, unknown>) => Promise<void> }) {
  const t = useT();
  const { locale } = useLocale();
  const [theme, setTheme] = useState(item.theme);
  const op = (name: string, extra: Record<string, unknown> = {}) => act({ target: "suggestion", op: name, id: item.id, ...extra });
  return (
    <article className="fb-admin-item" data-flagged={item.flagged || undefined}>
      <header className="fb-admin-head">
        <strong>{item.title}</strong>
        <span className="fb-status" data-status={item.status}>{t(SUGGESTION_STATUS_LABELS[item.status])}</span>
        {item.source === "review" ? <span className="fb-tag">{t("From a review")}</span> : null}
        {item.theme ? <span className="fb-tag fb-tag-gold">{item.theme}</span> : null}
      </header>
      <p className="hint">{item.member} · {formatDay(item.createdAt, locale)} · {item.locale.toUpperCase()}</p>
      {item.details && item.details !== item.title ? <p className="fb-review-text">{item.details}</p> : null}
      <div className="fb-admin-controls">
        <label className="field">
          <span>{t("Topic")}</span>
          <select value={item.category} onChange={(e) => void op("category", { category: e.target.value })}>
            {SUGGESTION_CATEGORIES.map((entry) => (
              <option key={entry.id} value={entry.id}>{t(entry.label)}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{t("Status")}</span>
          <select value={item.status} onChange={(e) => void op("status", { status: e.target.value })}>
            {SUGGESTION_STATUSES.map((status) => (
              <option key={status} value={status}>{t(SUGGESTION_STATUS_LABELS[status])}</option>
            ))}
          </select>
        </label>
        <div className="field">
          <label htmlFor={`theme-${item.id}`}>{t("Theme for repeated requests")}</label>
          <span className="fb-inline">
            <input id={`theme-${item.id}`} type="text" maxLength={THEME_MAX} value={theme} onChange={(e) => setTheme(e.target.value)} placeholder={t("For example: Dark mode")} />
            <button type="button" className="btn btn-secondary" disabled={theme === item.theme} onClick={() => void op("theme", { theme })}>{t("Save")}</button>
          </span>
        </div>
      </div>
      <div className="fb-admin-actions">
        <FlagControl flagged={item.flagged} reason={item.flagReason} onFlag={(reason) => void op("flag", { reason })} onUnflag={() => void op("unflag")} />
        <DeleteButton onDelete={() => void op("delete")} />
      </div>
      <NoteBox key={item.adminNote} initial={item.adminNote} onSave={(note) => op("note", { note })} />
    </article>
  );
}

const today = () => new Date().toISOString().slice(0, 10);

function AnnouncementForm({ editing, onDone, act }: { editing: StoredAnnouncement | null; onDone: () => void; act: (payload: Record<string, unknown>) => Promise<boolean> }) {
  const t = useT();
  const [title, setTitle] = useState(editing?.title ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [imagePath, setImagePath] = useState(editing?.imagePath ?? "");
  const [implementedOn, setImplementedOn] = useState(editing?.implementedOn ?? today());
  const [category, setCategory] = useState(editing?.category ?? "");
  const [published, setPublished] = useState(editing?.published ?? true);
  return (
    <form
      className="fb-card fb-form"
      onSubmit={async (event) => {
        event.preventDefault();
        const ok = await act({ target: "announcement", op: editing ? "update" : "create", id: editing?.id, title, description, imagePath, implementedOn, category, published });
        if (ok) {
          if (!editing) {
            setTitle("");
            setDescription("");
            setImagePath("");
            setCategory("");
          }
          onDone();
        }
      }}
    >
      <h3>{editing ? t("Edit announcement") : t("New announcement")}</h3>
      <p className="hint">{t("Example: You asked, we listened! We have added a new Brain Health section based on your feedback.")}</p>
      <label className="field">
        <span>{t("Short title")}</span>
        <input type="text" maxLength={ANNOUNCEMENT_TITLE_MAX} value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label className="field">
        <span>{t("Description")}</span>
        <textarea maxLength={ANNOUNCEMENT_DESCRIPTION_MAX} rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <div className="fb-admin-controls">
        <label className="field">
          <span>{t("Date it was added")}</span>
          <input type="date" value={implementedOn} onChange={(e) => setImplementedOn(e.target.value)} />
        </label>
        <label className="field">
          <span>{t("Related feature or category (optional)")}</span>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder={t("For example: Brain & Mind")} />
        </label>
        <label className="field">
          <span>{t("Image (optional)")}</span>
          <select value={imagePath} onChange={(e) => setImagePath(e.target.value)}>
            <option value="">{t("No image")}</option>
            {IMAGE_CHOICES.map((path) => (
              <option key={path} value={path}>{path.replace("/imagery/", "").replace(".webp", "")}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="fb-check">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        <span>{t("Publish now (otherwise it is saved as a draft)")}</span>
      </label>
      <div className="actions">
        <button className="btn btn-primary" type="submit">{editing ? t("Save changes") : t("Create announcement")}</button>
        {editing ? <button className="btn btn-ghost" type="button" onClick={onDone}>{t("Cancel")}</button> : null}
      </div>
    </form>
  );
}

export function AdminFeedbackView() {
  const t = useT();
  const { locale } = useLocale();
  const account = useAccount();
  const isAdmin = account.phase === "ready" && account.isAdmin;
  const { state, load } = useAdminData(isAdmin);
  const [tab, setTab] = useState<Tab>("overview");
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [query, setQuery] = useState("");
  const [reviewStatus, setReviewStatus] = useState("all");
  const [reviewStars, setReviewStars] = useState("all");
  const [onlyFlagged, setOnlyFlagged] = useState(false);
  const [suggestionStatus, setSuggestionStatus] = useState("all");
  const [suggestionCategory, setSuggestionCategory] = useState("all");
  const [editing, setEditing] = useState<StoredAnnouncement | null>(null);

  const act = useCallback(
    async (payload: Record<string, unknown>) => {
      const result = await postJson("/api/admin/feedback", payload);
      setNotice(result.ok ? { ok: true, text: t(result.notice) } : { ok: false, text: t(result.error) });
      await load();
      return result.ok;
    },
    [load, t],
  );

  const data = state.phase === "ready" ? state.data : null;
  const needle = query.trim().toLocaleLowerCase();
  const reviews = useMemo(
    () =>
      (data?.reviews ?? []).filter((review) => {
        if (reviewStatus === "low" ? review.rating > 2 : reviewStatus !== "all" && review.status !== reviewStatus) return false;
        if (reviewStars !== "all" && String(review.rating) !== reviewStars) return false;
        if (onlyFlagged && !review.flagged) return false;
        if (!needle) return true;
        return [review.likedText, review.improveText, review.featuresText, review.thoughts, review.displayName ?? "", review.member, review.adminNote]
          .join(" ")
          .toLocaleLowerCase()
          .includes(needle);
      }),
    [data, reviewStatus, reviewStars, onlyFlagged, needle],
  );
  const suggestions = useMemo(
    () =>
      (data?.suggestions ?? []).filter((item) => {
        if (suggestionStatus !== "all" && item.status !== suggestionStatus) return false;
        if (suggestionCategory !== "all" && item.category !== suggestionCategory) return false;
        if (onlyFlagged && !item.flagged) return false;
        if (!needle) return true;
        return [item.title, item.details, item.theme, item.member, item.adminNote].join(" ").toLocaleLowerCase().includes(needle);
      }),
    [data, suggestionStatus, suggestionCategory, onlyFlagged, needle],
  );

  if (account.phase === "loading") return <p className="card" role="status">{t("Checking your sign-in…")}</p>;
  if (!isAdmin) {
    return (
      <section className="fb-card stack narrow">
        <h1>{t("Review management")}</h1>
        <p>{t("This is available to the administrator only.")}</p>
        <Link className="btn btn-secondary" href="/feedback">{t("Back to Reviews & Feedback")}</Link>
      </section>
    );
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "overview", label: t("Overview") },
    { id: "reviews", label: t("Reviews"), count: data?.analytics.reviewsByStatus.pending },
    { id: "suggestions", label: t("Suggestions"), count: data?.analytics.suggestionsByStatus.new },
    { id: "announcements", label: t("You asked, we listened!") },
  ];

  return (
    <div className="stack-lg fb fb-admin">
      <section>
        <p className="kicker">{t("Administrator")}</p>
        <h1>{t("Review management")}</h1>
        <p className="lede">{t("Read every review and suggestion, publish what members agreed to share, and track what you build next. Moderate spam, abuse, private details, and fake submissions. Honest criticism stays.")}</p>
      </section>
      {data ? <StorageNote storage={data.storage} /> : null}
      {state.phase === "failed" ? <p className="fb-error" role="alert">{t(state.error)}</p> : null}
      {state.phase === "loading" ? <p className="fb-card" role="status">{t("Loading…")}</p> : null}

      <div className="fb-tabs" role="tablist" aria-label={t("Review management")}>
        {tabs.map((item) => (
          <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} className="fb-tab" onClick={() => setTab(item.id)}>
            {item.label}
            {item.count ? <span className="fb-badge">{item.count}</span> : null}
          </button>
        ))}
      </div>

      {notice ? (
        <p className={notice.ok ? "fb-notice" : "fb-error"} role={notice.ok ? "status" : "alert"}>
          {notice.text}
        </p>
      ) : null}

      {data && tab === "overview" ? <Overview data={data} /> : null}

      {data && (tab === "reviews" || tab === "suggestions") ? (
        <div className="fb-toolbar">
          <label className="field fb-search">
            <span>{t("Search")}</span>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("Words, member code, or note")} />
          </label>
          {tab === "reviews" ? (
            <>
              <label className="field">
                <span>{t("Status")}</span>
                <select value={reviewStatus} onChange={(e) => setReviewStatus(e.target.value)}>
                  <option value="all">{t("All")}</option>
                  <option value="pending">{t(REVIEW_STATUS_LABELS.pending)}</option>
                  <option value="published">{t(REVIEW_STATUS_LABELS.published)}</option>
                  <option value="hidden">{t(REVIEW_STATUS_LABELS.hidden)}</option>
                  <option value="low">{t("Critical feedback (1–2 stars)")}</option>
                </select>
              </label>
              <label className="field">
                <span>{t("Stars")}</span>
                <select value={reviewStars} onChange={(e) => setReviewStars(e.target.value)}>
                  <option value="all">{t("All")}</option>
                  {[...RATINGS].reverse().map((n) => (
                    <option key={n} value={String(n)}>{n} ★</option>
                  ))}
                </select>
              </label>
            </>
          ) : (
            <>
              <label className="field">
                <span>{t("Status")}</span>
                <select value={suggestionStatus} onChange={(e) => setSuggestionStatus(e.target.value)}>
                  <option value="all">{t("All")}</option>
                  {SUGGESTION_STATUSES.map((status) => (
                    <option key={status} value={status}>{t(SUGGESTION_STATUS_LABELS[status])}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>{t("Topic")}</span>
                <select value={suggestionCategory} onChange={(e) => setSuggestionCategory(e.target.value)}>
                  <option value="all">{t("All")}</option>
                  {SUGGESTION_CATEGORIES.map((entry) => (
                    <option key={entry.id} value={entry.id}>{t(entry.label)}</option>
                  ))}
                </select>
              </label>
            </>
          )}
          <label className="fb-check fb-check-inline">
            <input type="checkbox" checked={onlyFlagged} onChange={(e) => setOnlyFlagged(e.target.checked)} />
            <span>{t("Flagged only")}</span>
          </label>
        </div>
      ) : null}

      {data && tab === "reviews" ? (
        <section className="stack" aria-label={t("Reviews")}>
          <p className="hint">{t("{shown} of {total} reviews", { shown: reviews.length, total: data.reviews.length })}</p>
          {reviews.map((review) => (
            <ReviewRow key={review.id} review={review} act={async (payload) => void (await act(payload))} />
          ))}
          {reviews.length === 0 ? <p className="fb-card hint">{t("No reviews match.")}</p> : null}
        </section>
      ) : null}

      {data && tab === "suggestions" ? (
        <section className="stack" aria-label={t("Suggestions")}>
          <p className="hint">{t("{shown} of {total} suggestions", { shown: suggestions.length, total: data.suggestions.length })}</p>
          {suggestions.map((item) => (
            <SuggestionRow key={`${item.id}-${item.updatedAt}`} item={item} act={async (payload) => void (await act(payload))} />
          ))}
          {suggestions.length === 0 ? <p className="fb-card hint">{t("No suggestions match.")}</p> : null}
        </section>
      ) : null}

      {data && tab === "announcements" ? (
        <section className="stack">
          <AnnouncementForm key={editing?.id ?? "new"} editing={editing} onDone={() => setEditing(null)} act={act} />
          {data.announcements.map((item) => (
            <article key={item.id} className="fb-admin-item">
              <header className="fb-admin-head">
                <strong>{item.title}</strong>
                <span className="fb-status" data-status={item.published ? "published" : "pending"}>{item.published ? t("Published") : t("Draft")}</span>
                {item.category ? <span className="fb-tag">{item.category}</span> : null}
              </header>
              <p className="hint">{t("Added on {date}", { date: formatDay(item.implementedOn, locale) })}{item.imagePath ? ` · ${item.imagePath}` : ""}</p>
              <p>{item.description}</p>
              <div className="fb-admin-actions">
                {item.published ? (
                  <button type="button" className="btn btn-secondary" onClick={() => void act({ target: "announcement", op: "unpublish", id: item.id })}>{t("Hide")}</button>
                ) : (
                  <button type="button" className="btn btn-primary" onClick={() => void act({ target: "announcement", op: "publish", id: item.id })}>{t("Publish")}</button>
                )}
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(item)}>{t("Edit")}</button>
                <DeleteButton onDelete={() => void act({ target: "announcement", op: "delete", id: item.id })} />
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}
