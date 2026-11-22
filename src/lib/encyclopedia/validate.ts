import { isCategorySlug } from "@/lib/encyclopedia/categories";
import {
  EVIDENCE_LEVELS,
  SAFETY_TOPICS,
  STUDY_TYPES,
  type Article,
  type ArticleSection,
  type ArticleStatus,
  type EvidenceClaim,
  type Reference,
  type SafetyTopic,
} from "@/lib/encyclopedia/types";
import { isRealISODate } from "@/lib/dates";

export const ARTICLE_STATUSES: readonly ArticleStatus[] = ["draft", "in_review", "published", "archived"];
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+){0,12}$/;

const LIMITS = { title: 160, summary: 800, paragraph: 2500, heading: 120, keyword: 60, keywords: 30, sections: 16, paragraphs: 12, points: 12, references: 20, evidence: 12, takeaways: 10, url: 500, name: 160 };

type Result<T> = { ok: true; value: T } | { ok: false; errors: string[] };

function text(value: unknown, limit: number): string {
  if (typeof value !== "string") return "";
  // Plain text only: drop control characters and angle brackets so nothing reads as markup.
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F<>]/g, "").trim().slice(0, limit);
}

function list(value: unknown, limit: number, each: number): string[] {
  return (Array.isArray(value) ? value : []).map((item) => text(item, each)).filter(Boolean).slice(0, limit);
}

export function isSafeUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && Boolean(url.hostname.includes("."));
  } catch {
    return false;
  }
}

/**
 * Checks an article an editor sent. Everything is plain text. A published article
 * must have at least one https source and a named reviewer with a review date, so
 * nothing reaches members without a person's check.
 */
export function validateArticle(input: unknown, status: ArticleStatus, today: string): Result<Article> {
  const errors: string[] = [];
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const slug = text(raw.slug, 80).toLowerCase();
  if (!SLUG_PATTERN.test(slug)) errors.push("The address name (slug) must be lowercase words joined by hyphens.");
  const category = raw.category;
  if (!isCategorySlug(category)) errors.push("Choose a category.");
  const alsoIn = (Array.isArray(raw.alsoIn) ? raw.alsoIn : []).filter(isCategorySlug).filter((item) => item !== category);

  const title = text(raw.title, LIMITS.title);
  if (!title) errors.push("Add a title.");
  const summary = text(raw.summary, LIMITS.summary);
  if (!summary) errors.push("Add a short summary.");
  const easySummary = text(raw.easySummary, LIMITS.summary) || summary;

  const sections: ArticleSection[] = (Array.isArray(raw.sections) ? raw.sections : [])
    .slice(0, LIMITS.sections)
    .map((item) => {
      const row = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
      return {
        heading: text(row.heading, LIMITS.heading),
        standard: list(row.standard, LIMITS.paragraphs, LIMITS.paragraph),
        easy: list(row.easy, LIMITS.paragraphs, LIMITS.paragraph),
        points: list(row.points, LIMITS.points, LIMITS.paragraph),
      };
    })
    .filter((section) => section.heading && section.standard.length > 0);
  if (sections.length === 0) errors.push("Add at least one section with a heading and text.");

  const evidence: EvidenceClaim[] = (Array.isArray(raw.evidence) ? raw.evidence : [])
    .slice(0, LIMITS.evidence)
    .map((item) => {
      const row = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
      return { claim: text(row.claim, LIMITS.paragraph), level: row.level, basis: row.basis };
    })
    .filter((row): row is EvidenceClaim =>
      Boolean(row.claim) && (EVIDENCE_LEVELS as readonly unknown[]).includes(row.level) && (STUDY_TYPES as readonly unknown[]).includes(row.basis),
    );

  const references: Reference[] = (Array.isArray(raw.references) ? raw.references : [])
    .slice(0, LIMITS.references)
    .map((item) => {
      const row = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
      const reference: Reference = { title: text(row.title, LIMITS.title), publisher: text(row.publisher, LIMITS.name), url: text(row.url, LIMITS.url) };
      const date = text(row.date, 20);
      if (date) reference.date = date;
      return reference;
    });
  const badRefs = references.filter((ref) => !ref.title || !isSafeUrl(ref.url));
  if (badRefs.length > 0) errors.push("Every source needs a title and a full https link.");

  const safety = (Array.isArray(raw.safety) ? raw.safety : []).filter((item): item is SafetyTopic => (SAFETY_TOPICS as readonly unknown[]).includes(item));
  const keywords = list(raw.keywords, LIMITS.keywords, LIMITS.keyword);
  const takeaways = list(raw.takeaways, LIMITS.takeaways, LIMITS.paragraph);

  let image: Article["image"];
  const rawImage = (raw.image && typeof raw.image === "object" ? raw.image : null) as Record<string, unknown> | null;
  if (rawImage) {
    const url = text(rawImage.url, LIMITS.url);
    const illustration = text(rawImage.illustration, 40);
    const alt = text(rawImage.alt, 300);
    if ((url || illustration) && !alt) errors.push("Images need a text description (alt text).");
    if (url && !isSafeUrl(url)) errors.push("An image link must be a full https link.");
    if (url && !text(rawImage.license, 80)) errors.push("Say which license allows the image to be used.");
    if (url || illustration) image = { url: url || undefined, illustration: illustration || undefined, alt, credit: text(rawImage.credit, 200) || undefined, license: text(rawImage.license, 80) || undefined };
  }

  const reviewRaw = (raw.review && typeof raw.review === "object" ? raw.review : null) as Record<string, unknown> | null;
  const reviewer = text(reviewRaw?.reviewer, LIMITS.name);
  const reviewedOn = text(reviewRaw?.reviewedOn, 10);
  const review = reviewer && isRealISODate(reviewedOn) ? { reviewer, reviewedOn, note: text(reviewRaw?.note, 500) || undefined } : undefined;

  if (status === "published") {
    if (references.length === 0) errors.push("A published article needs at least one source.");
    if (!review) errors.push("A published article needs the reviewer's name and the review date.");
    if (review && reviewedOn > today) errors.push("The review date cannot be in the future.");
  }

  const publishedOn = isRealISODate(text(raw.publishedOn, 10)) ? text(raw.publishedOn, 10) : today;
  const draftedBy = text(raw.draftedBy, LIMITS.name) || "LifeZoi editor";

  if (errors.length > 0) return { ok: false, errors };
  const article: Article = {
    slug,
    category: category as Article["category"],
    alsoIn: alsoIn.length > 0 ? alsoIn : undefined,
    title,
    summary,
    easySummary,
    keywords,
    sections,
    evidence,
    takeaways,
    references,
    safety: safety.length > 0 ? safety : undefined,
    image,
    publishedOn,
    updatedOn: today,
    review,
    draftedBy,
  };
  return { ok: true, value: article };
}

export function isArticleStatus(value: unknown): value is ArticleStatus {
  return typeof value === "string" && (ARTICLE_STATUSES as readonly string[]).includes(value);
}
