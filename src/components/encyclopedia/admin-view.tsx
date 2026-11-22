"use client";

import "@/components/encyclopedia/encyclopedia.css";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArticleBody } from "@/components/encyclopedia/article-body";
import { useAccount } from "@/lib/account-store";
import { BUILT_IN_ARTICLES } from "@/lib/encyclopedia/articles";
import type { EditorialRecord } from "@/lib/encyclopedia/catalog";
import { CATEGORIES } from "@/lib/encyclopedia/categories";
import { EVIDENCE_LEVELS, SAFETY_TOPICS, STUDY_TYPES, type Article, type ArticleStatus } from "@/lib/encyclopedia/types";
import { localISODate } from "@/lib/dates";

/**
 * Encyclopedia editor, for the administrator. This page is in English only.
 * The server checks the administrator's sign-in and validates every save; this
 * page only prepares the article. Nothing is published without a named reviewer.
 */

type Row = EditorialRecord & { updatedBy: string | null };
type ListState = { phase: "loading" } | { phase: "ready"; records: Row[] } | { phase: "not-set-up" } | { phase: "failed" };

type Form = {
  slug: string;
  category: string;
  title: string;
  summary: string;
  easySummary: string;
  keywords: string;
  sections: { heading: string; standard: string; easy: string; points: string }[];
  evidence: string;
  takeaways: string;
  references: string;
  safety: string[];
  illustration: string;
  imageUrl: string;
  imageAlt: string;
  imageCredit: string;
  imageLicense: string;
  reviewer: string;
  reviewedOn: string;
  reviewNote: string;
  publishedOn: string;
  draftedBy: string;
};

const STATUS_TEXT: Record<ArticleStatus | "built-in", string> = {
  "built-in": "Built-in, awaiting clinical review",
  draft: "Draft",
  in_review: "In scientific review",
  published: "Published",
  archived: "Archived",
};

const paras = (list?: readonly string[]) => (list ?? []).join("\n\n");
const lines = (list?: readonly string[]) => (list ?? []).join("\n");
const splitParas = (text: string) => text.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
const splitLines = (text: string) => text.split("\n").map((item) => item.trim()).filter(Boolean);

function toForm(article?: Article): Form {
  return {
    slug: article?.slug ?? "",
    category: article?.category ?? CATEGORIES[0].slug,
    title: article?.title ?? "",
    summary: article?.summary ?? "",
    easySummary: article?.easySummary ?? "",
    keywords: (article?.keywords ?? []).join(", "),
    sections: (article?.sections ?? [{ heading: "What is it?", standard: [], easy: [], points: [] }]).map((section) => ({
      heading: section.heading,
      standard: paras(section.standard),
      easy: paras(section.easy),
      points: lines(section.points),
    })),
    evidence: (article?.evidence ?? []).map((item) => `${item.level} | ${item.basis} | ${item.claim}`).join("\n"),
    takeaways: lines(article?.takeaways),
    references: (article?.references ?? []).map((ref) => [ref.title, ref.publisher, ref.url, ref.date ?? ""].join(" | ")).join("\n"),
    safety: [...(article?.safety ?? [])],
    illustration: article?.image?.illustration ?? "",
    imageUrl: article?.image?.url ?? "",
    imageAlt: article?.image?.alt ?? "",
    imageCredit: article?.image?.credit ?? "",
    imageLicense: article?.image?.license ?? "",
    reviewer: article?.review?.reviewer ?? "",
    reviewedOn: article?.review?.reviewedOn ?? "",
    reviewNote: article?.review?.note ?? "",
    publishedOn: article?.publishedOn ?? localISODate(),
    draftedBy: article?.draftedBy ?? "",
  };
}

/** The article as the server expects it. The server checks it again. */
function fromForm(form: Form): Article {
  return {
    slug: form.slug.trim().toLowerCase(),
    category: form.category as Article["category"],
    title: form.title.trim(),
    summary: form.summary.trim(),
    easySummary: form.easySummary.trim(),
    keywords: form.keywords.split(",").map((item) => item.trim()).filter(Boolean),
    sections: form.sections
      .map((section) => ({ heading: section.heading.trim(), standard: splitParas(section.standard), easy: splitParas(section.easy), points: splitLines(section.points) }))
      .filter((section) => section.heading || section.standard.length > 0),
    evidence: splitLines(form.evidence).map((line) => {
      const [level = "", basis = "", ...claim] = line.split("|").map((part) => part.trim());
      return { level, basis, claim: claim.join(" | ") } as unknown as Article["evidence"][number];
    }),
    takeaways: splitLines(form.takeaways),
    references: splitLines(form.references).map((line) => {
      const [title = "", publisher = "", url = "", date = ""] = line.split("|").map((part) => part.trim());
      return date ? { title, publisher, url, date } : { title, publisher, url };
    }),
    safety: form.safety as Article["safety"],
    image:
      form.imageUrl || form.illustration
        ? { url: form.imageUrl || undefined, illustration: form.illustration || undefined, alt: form.imageAlt, credit: form.imageCredit || undefined, license: form.imageLicense || undefined }
        : undefined,
    review: form.reviewer ? { reviewer: form.reviewer, reviewedOn: form.reviewedOn, note: form.reviewNote || undefined } : undefined,
    publishedOn: form.publishedOn,
    updatedOn: localISODate(),
    draftedBy: form.draftedBy || "LifeZoi editor",
  };
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="ency-admin-field">
      <span className="ency-admin-label">{label}</span>
      {hint ? <span className="hint">{hint}</span> : null}
      {children}
    </label>
  );
}

export function EncyclopediaAdminView() {
  const account = useAccount();
  const isAdmin = account.phase === "ready" && account.isAdmin;
  const [list, setList] = useState<ListState>({ phase: "loading" });
  const [form, setForm] = useState<Form | null>(null);
  const [preview, setPreview] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<"all" | "review">("all");

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/encyclopedia", { cache: "no-store" });
      const body = (await response.json().catch(() => ({}))) as { records?: Row[]; code?: string };
      if (response.ok && Array.isArray(body.records)) return setList({ phase: "ready", records: body.records });
      setList(body.code === "not-set-up" ? { phase: "not-set-up" } : { phase: "failed" });
    } catch {
      setList({ phase: "failed" });
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    void fetch("/api/admin/encyclopedia", { cache: "no-store" })
      .then(async (response) => {
        const body = (await response.json().catch(() => ({}))) as { records?: Row[]; code?: string };
        if (cancelled) return;
        if (response.ok && Array.isArray(body.records)) return setList({ phase: "ready", records: body.records });
        setList(body.code === "not-set-up" ? { phase: "not-set-up" } : { phase: "failed" });
      })
      .catch(() => {
        if (!cancelled) setList({ phase: "failed" });
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const records = useMemo(() => (list.phase === "ready" ? list.records : []), [list]);
  const rows = useMemo(() => {
    const bySlug = new Map(records.map((record) => [record.slug, record]));
    const builtIn = BUILT_IN_ARTICLES.map((article) => {
      const record = bySlug.get(article.slug);
      return { slug: article.slug, title: record?.article.title ?? article.title, status: (record?.status ?? "built-in") as ArticleStatus | "built-in", article: record?.article ?? article, reviewed: Boolean((record?.article ?? article).review), updatedAt: record?.updatedAt ?? article.updatedOn };
    });
    const extra = records
      .filter((record) => !BUILT_IN_ARTICLES.some((article) => article.slug === record.slug))
      .map((record) => ({ slug: record.slug, title: record.article.title, status: record.status as ArticleStatus | "built-in", article: record.article, reviewed: Boolean(record.article.review), updatedAt: record.updatedAt }));
    const all = [...extra, ...builtIn];
    return filter === "review" ? all.filter((row) => !row.reviewed || row.status === "in_review" || row.status === "draft") : all;
  }, [records, filter]);

  async function save(status: ArticleStatus) {
    if (!form) return;
    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/encyclopedia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article: fromForm(form), status }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string; errors?: string[] };
      if (response.ok) {
        setNotice({ ok: true, text: `Saved as ${STATUS_TEXT[status]}.` });
        await load();
      } else setNotice({ ok: false, text: (body.errors ?? [body.error ?? "The article could not be saved."]).join(" ") });
    } catch {
      setNotice({ ok: false, text: "The article could not be saved. Check the connection and try again." });
    } finally {
      setBusy(false);
    }
  }

  if (account.phase === "loading") return <p className="hint">Loading…</p>;
  if (!isAdmin)
    return (
      <div className="ency stack-lg">
        <h1>Encyclopedia editor</h1>
        <p>This page is for the LifeZoi administrator.</p>
        <Link href="/encyclopedia">Back to the Health Encyclopedia</Link>
      </div>
    );

  if (form) {
    const set = (change: Partial<Form>) => setForm({ ...form, ...change });
    const setSection = (index: number, change: Partial<Form["sections"][number]>) =>
      set({ sections: form.sections.map((section, i) => (i === index ? { ...section, ...change } : section)) });
    return (
      <div className="ency stack-lg ency-admin">
        <button type="button" className="btn btn-secondary" onClick={() => { setForm(null); setPreview(false); setNotice(null); }}>
          ← All articles
        </button>
        <h1>{form.title || "New article"}</h1>
        <div className="ency-seg" role="radiogroup" aria-label="Editor view">
          <button type="button" role="radio" aria-checked={!preview} onClick={() => setPreview(false)}>Edit</button>
          <button type="button" role="radio" aria-checked={preview} onClick={() => setPreview(true)}>Preview</button>
        </div>
        {preview ? (
          <div className="ency-admin-preview">
            <ArticleBody article={fromForm(form)} />
          </div>
        ) : (
          <div className="stack-lg">
            <section className="card stack">
              <h2>Basics</h2>
              <Field label="Address name (slug)" hint="Lowercase words joined by hyphens. Using a built-in article's slug replaces that article once published.">
                <input value={form.slug} onChange={(e) => set({ slug: e.target.value })} />
              </Field>
              <Field label="Category">
                <select value={form.category} onChange={(e) => set({ category: e.target.value })}>
                  {CATEGORIES.map((category) => <option key={category.slug} value={category.slug}>{category.title}</option>)}
                </select>
              </Field>
              <Field label="Title"><input value={form.title} onChange={(e) => set({ title: e.target.value })} /></Field>
              <Field label="Summary (Standard reading)"><textarea rows={3} value={form.summary} onChange={(e) => set({ summary: e.target.value })} /></Field>
              <Field label="Summary (Easy reading)" hint="Short, plain sentences."><textarea rows={2} value={form.easySummary} onChange={(e) => set({ easySummary: e.target.value })} /></Field>
              <Field label="Search keywords" hint="Separated by commas."><input value={form.keywords} onChange={(e) => set({ keywords: e.target.value })} /></Field>
            </section>

            <section className="card stack">
              <h2>Sections</h2>
              <p className="hint">Standard headings: What is it? · Why does it matter? · What does science tell us? · Important research and discoveries · Practical information for everyday life · Risks, limitations, and unanswered questions. Separate paragraphs with a blank line.</p>
              {form.sections.map((section, index) => (
                <fieldset key={index} className="ency-admin-section">
                  <legend>Section {index + 1}</legend>
                  <Field label="Heading"><input value={section.heading} onChange={(e) => setSection(index, { heading: e.target.value })} /></Field>
                  <Field label="Standard text"><textarea rows={6} value={section.standard} onChange={(e) => setSection(index, { standard: e.target.value })} /></Field>
                  <Field label="Easy text (optional)"><textarea rows={3} value={section.easy} onChange={(e) => setSection(index, { easy: e.target.value })} /></Field>
                  <Field label="Bullet points (optional, one per line)"><textarea rows={2} value={section.points} onChange={(e) => setSection(index, { points: e.target.value })} /></Field>
                  <button type="button" className="btn btn-ghost" onClick={() => set({ sections: form.sections.filter((_, i) => i !== index) })}>Remove section</button>
                </fieldset>
              ))}
              <button type="button" className="btn btn-secondary" onClick={() => set({ sections: [...form.sections, { heading: "", standard: "", easy: "", points: "" }] })}>Add section</button>
              <Field label="Key takeaways (one per line)"><textarea rows={3} value={form.takeaways} onChange={(e) => set({ takeaways: e.target.value })} /></Field>
            </section>

            <section className="card stack">
              <h2>Evidence and sources</h2>
              <Field label="Evidence labels (one claim per line)" hint={`level | study type | claim. Levels: ${EVIDENCE_LEVELS.join(", ")}. Study types: ${STUDY_TYPES.join(", ")}.`}>
                <textarea rows={4} value={form.evidence} onChange={(e) => set({ evidence: e.target.value })} />
              </Field>
              <Field label="Sources (one per line)" hint="Title | Publisher | https link | date. Link to the original research or official guidance. Never invent a source.">
                <textarea rows={5} value={form.references} onChange={(e) => set({ references: e.target.value })} />
              </Field>
              <fieldset>
                <legend>Extra safety notes</legend>
                <div className="ency-admin-checks">
                  {SAFETY_TOPICS.map((topic) => (
                    <label key={topic}>
                      <input type="checkbox" checked={form.safety.includes(topic)} onChange={(e) => set({ safety: e.target.checked ? [...form.safety, topic] : form.safety.filter((item) => item !== topic) })} /> {topic}
                    </label>
                  ))}
                </div>
              </fieldset>
            </section>

            <section className="card stack">
              <h2>Image</h2>
              <p className="hint">Use a built-in illustration name (for example heart, brain, gut, dna, cell), or a licensed image link. Image upload is not available yet; host licensed images in the repository or another https location.</p>
              <Field label="Built-in illustration"><input value={form.illustration} onChange={(e) => set({ illustration: e.target.value })} /></Field>
              <Field label="Image link (https)"><input value={form.imageUrl} onChange={(e) => set({ imageUrl: e.target.value })} /></Field>
              <Field label="Alt text (required with any image)"><input value={form.imageAlt} onChange={(e) => set({ imageAlt: e.target.value })} /></Field>
              <Field label="Credit"><input value={form.imageCredit} onChange={(e) => set({ imageCredit: e.target.value })} /></Field>
              <Field label="License (required with an image link)"><input value={form.imageLicense} onChange={(e) => set({ imageLicense: e.target.value })} /></Field>
            </section>

            <section className="card stack">
              <h2>Review and dates</h2>
              <p className="hint">Publishing requires the name of the qualified person who checked the article against its sources, and the review date. AI-drafted text must be reviewed by a person before it is published.</p>
              <Field label="Reviewer name and role"><input value={form.reviewer} onChange={(e) => set({ reviewer: e.target.value })} /></Field>
              <Field label="Review date"><input type="date" value={form.reviewedOn} onChange={(e) => set({ reviewedOn: e.target.value })} /></Field>
              <Field label="Review note (optional)"><input value={form.reviewNote} onChange={(e) => set({ reviewNote: e.target.value })} /></Field>
              <Field label="First published"><input type="date" value={form.publishedOn} onChange={(e) => set({ publishedOn: e.target.value })} /></Field>
              <Field label="Written by"><input value={form.draftedBy} onChange={(e) => set({ draftedBy: e.target.value })} /></Field>
              <p className="hint">The last updated date is set automatically when you save.</p>
            </section>
          </div>
        )}
        <div className="ency-admin-bar">
          <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => void save("draft")}>Save draft</button>
          <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => void save("in_review")}>Send to scientific review</button>
          <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void save("published")}>Publish</button>
          <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => void save("archived")}>Archive</button>
        </div>
        {notice ? <p className={notice.ok ? "ency-admin-ok" : "ency-admin-error"} role="status">{notice.text}</p> : null}
      </div>
    );
  }

  return (
    <div className="ency stack-lg ency-admin">
      <h1>Encyclopedia editor</h1>
      <p>Write, review, and publish Health Encyclopedia articles. Built-in articles are shown to members with a note that they await clinical review. Saving an edited copy and publishing it, with a named reviewer, replaces the built-in version.</p>
      {list.phase === "not-set-up" ? (
        <p className="ency-admin-error">Editorial storage is not set up on this server yet. Apply the migration supabase/migrations/20261122160000_encyclopedia_articles.sql (it runs automatically after merge) and set the server&apos;s service role key. You can still preview articles.</p>
      ) : null}
      {list.phase === "failed" ? <p className="ency-admin-error">The editorial records could not be loaded.</p> : null}
      <div className="lz-buttons">
        <button type="button" className="btn btn-primary" onClick={() => setForm(toForm())}>New article</button>
        <div className="ency-seg" role="radiogroup" aria-label="Filter">
          <button type="button" role="radio" aria-checked={filter === "all"} onClick={() => setFilter("all")}>All</button>
          <button type="button" role="radio" aria-checked={filter === "review"} onClick={() => setFilter("review")}>Needs scientific review</button>
        </div>
      </div>
      <div className="ency-table-wrap">
        <table className="ency-admin-table">
          <thead>
            <tr><th scope="col">Article</th><th scope="col">Status</th><th scope="col">Reviewed</th><th scope="col">Updated</th><th scope="col"><span className="sr-only">Actions</span></th></tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.slug}>
                <th scope="row">{row.title}<br /><span className="hint">{row.slug}</span></th>
                <td>{STATUS_TEXT[row.status]}</td>
                <td>{row.reviewed ? "Yes" : "Not yet"}</td>
                <td>{row.updatedAt.slice(0, 10)}</td>
                <td><button type="button" className="btn btn-secondary" onClick={() => { setForm(toForm(row.article)); setNotice(null); }}>{row.status === "built-in" ? "Edit a copy" : "Edit"}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
