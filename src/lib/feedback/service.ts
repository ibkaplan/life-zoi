import { createHash, randomUUID } from "node:crypto";
import { runLocalFilter } from "@/lib/community/local-filter";
import { msg } from "@/lib/i18n/translate";
import {
  ADMIN_NOTE_MAX,
  DUPLICATE_SUGGESTION_DAYS,
  PUBLIC_REVIEW_LIMIT,
  REVIEW_COOLDOWN_DAYS,
  SUGGESTIONS_PER_DAY,
  SUGGESTION_TITLE_MAX,
  THEME_MAX,
} from "@/lib/feedback/policy";
import type { FeedbackRepository } from "@/lib/feedback/repository";
import { feedbackAnalytics, isPublic, publicSummary, type FeedbackAnalytics } from "@/lib/feedback/stats";
import {
  FLAG_REASONS,
  SUGGESTION_CATEGORY_IDS,
  SUGGESTION_STATUSES,
  type FeedbackBoard,
  type FlagReason,
  type PublicAnnouncement,
  type PublicReview,
  type StoredAnnouncement,
  type StoredReview,
  type StoredSuggestion,
  type SuggestionCategory,
  type SuggestionStatus,
} from "@/lib/feedback/types";
import { cleanText, parseAnnouncement, parseReview, parseSuggestion } from "@/lib/feedback/validation";

export type Actor = { id: string; isAdmin: boolean };

export type FeedbackDeps = {
  repo: FeedbackRepository;
  storage: "memory" | "account";
  now?: () => number;
  newId?: () => string;
};

export type Result = { status: number; body: unknown };

const DAY = 24 * 60 * 60 * 1000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const clock = (deps: FeedbackDeps) => (deps.now ?? Date.now)();
const makeId = (deps: FeedbackDeps) => (deps.newId ?? randomUUID)();

export function contentHash(...parts: string[]): string {
  const normalized = parts.map((part) => part.toLocaleLowerCase().replace(/\s+/g, " ").trim()).join("␞");
  return createHash("sha256").update(normalized).digest("hex");
}

/** A short label so an administrator can tell repeat senders apart without seeing an email or account id. */
export function memberCode(userId: string): string {
  return `M-${createHash("sha256").update(`lifezoi-feedback:${userId}`).digest("hex").slice(0, 6).toUpperCase()}`;
}

const EMAIL = /[^\s@]+@[^\s@]+\.[a-z]{2,}/i;
const PHONE = /(?:\+?\d[\s().-]?){9,}/;
const LINK = /\b(?:https?:\/\/|www\.)\S+/i;

/**
 * Automatic checks never publish, reject, or delete anything. They only raise a
 * flag so the administrator looks first. A low star rating is never a reason.
 */
export function autoFlag(text: string): FlagReason | null {
  if (!text) return null;
  const filtered = runLocalFilter(text);
  if (filtered.action === "reject") return filtered.category === "spam" ? "spam" : "filter";
  if (EMAIL.test(text) || PHONE.test(text)) return "privacy";
  if (LINK.test(text)) return "spam";
  return null;
}

export function toPublicReview(review: StoredReview): PublicReview {
  return {
    id: review.id,
    rating: review.rating,
    likedText: review.likedText,
    improveText: review.improveText,
    thoughts: review.thoughts,
    name: review.displayName,
    createdAt: review.createdAt,
  };
}

export function toPublicAnnouncement(item: StoredAnnouncement): PublicAnnouncement {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    imagePath: item.imagePath,
    implementedOn: item.implementedOn,
    category: item.category,
  };
}

function newest<T extends { createdAt: string }>(a: T, b: T) {
  return b.createdAt.localeCompare(a.createdAt);
}

export async function feedbackBoard(actor: Actor, deps: FeedbackDeps): Promise<Result> {
  const now = clock(deps);
  const [reviews, own, ownSuggestions, announcements] = await Promise.all([
    deps.repo.listReviews(),
    deps.repo.listReviewsBy(actor.id),
    deps.repo.listSuggestionsBy(actor.id),
    deps.repo.listAnnouncements(),
  ]);
  const published = reviews.filter(isPublic).sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt));
  const latestOwn = own.sort(newest)[0] ?? null;
  const nextReview = latestOwn ? Date.parse(latestOwn.createdAt) + REVIEW_COOLDOWN_DAYS * DAY : 0;
  const board: FeedbackBoard = {
    storage: deps.storage,
    summary: publicSummary(reviews),
    reviews: published.slice(0, PUBLIC_REVIEW_LIMIT).map(toPublicReview),
    announcements: announcements
      .filter((item) => item.published)
      .sort((a, b) => b.implementedOn.localeCompare(a.implementedOn) || newest(a, b))
      .map(toPublicAnnouncement),
    ownReview: latestOwn
      ? { id: latestOwn.id, rating: latestOwn.rating, status: latestOwn.status, publishConsent: latestOwn.publishConsent, createdAt: latestOwn.createdAt }
      : null,
    ownSuggestions: ownSuggestions
      .filter((item) => item.source === "form")
      .sort(newest)
      .slice(0, 30)
      .map(({ id, category, title, details, status, createdAt }) => ({ id, category, title, details, status, createdAt })),
    nextReviewAt: nextReview > now ? new Date(nextReview).toISOString() : null,
  };
  return { status: 200, body: board };
}

/** A filled honeypot field means a script sent the form. It gets the normal answer and nothing is saved. */
function isBot(body: Record<string, unknown>): boolean {
  return typeof body.website === "string" && body.website.trim() !== "";
}

export async function submitReview(actor: Actor, body: Record<string, unknown>, deps: FeedbackDeps): Promise<Result> {
  if (isBot(body)) return { status: 200, body: { ok: true, notice: msg("Thank you. Your review was received.") } };
  const parsed = parseReview(body);
  if (!parsed.ok) return { status: 400, body: { error: parsed.error, field: parsed.field } };
  const input = parsed.value;
  return deps.repo.runExclusive(async () => {
    const now = clock(deps);
    const own = await deps.repo.listReviewsBy(actor.id);
    if (input.clientRequestId && own.some((review) => review.clientRequestId === input.clientRequestId)) {
      return { status: 200, body: { ok: true, notice: msg("Thank you. Your review was received.") } };
    }
    const recent = own.find((review) => now - Date.parse(review.createdAt) < REVIEW_COOLDOWN_DAYS * DAY);
    if (recent) {
      return {
        status: 409,
        body: {
          error: msg("You already sent a review this month. Thank you! You can still send suggestions at any time."),
          code: "duplicate",
        },
      };
    }
    const allText = [input.likedText, input.improveText, input.featuresText, input.thoughts, input.displayName ?? ""].join("\n");
    const flag = autoFlag(allText);
    const iso = new Date(now).toISOString();
    const review: StoredReview = {
      id: makeId(deps),
      userId: actor.id,
      ...input,
      status: "pending",
      flagged: flag !== null,
      flagReason: flag,
      adminNote: "",
      contentHash: contentHash(allText),
      createdAt: iso,
      updatedAt: iso,
      publishedAt: null,
    };
    await deps.repo.insertReview(review);
    if (input.featuresText) {
      // The "features to add" answer is also kept as a suggestion so it can be grouped with other requests.
      const title = input.featuresText.replace(/\s+/g, " ").slice(0, SUGGESTION_TITLE_MAX);
      await deps.repo.insertSuggestion({
        id: makeId(deps),
        userId: actor.id,
        category: "feature",
        title,
        details: input.featuresText,
        theme: "",
        status: "new",
        flagged: flag !== null,
        flagReason: flag,
        adminNote: "",
        source: "review",
        reviewId: review.id,
        locale: input.locale,
        clientRequestId: null,
        contentHash: contentHash(input.featuresText),
        createdAt: iso,
        updatedAt: iso,
      });
    }
    return {
      status: 201,
      body: {
        ok: true,
        notice: input.publishConsent
          ? msg("Thank you! Your review was received. A member of the LifeZoi team reads it before it can appear on What our members say.")
          : msg("Thank you! Your feedback was received. You kept it private, so only the LifeZoi team will read it."),
      },
    };
  });
}

export async function submitSuggestion(actor: Actor, body: Record<string, unknown>, deps: FeedbackDeps): Promise<Result> {
  if (isBot(body)) return { status: 200, body: { ok: true, notice: msg("Thank you. Your suggestion was received.") } };
  const parsed = parseSuggestion(body);
  if (!parsed.ok) return { status: 400, body: { error: parsed.error, field: parsed.field } };
  const input = parsed.value;
  return deps.repo.runExclusive(async () => {
    const now = clock(deps);
    const own = (await deps.repo.listSuggestionsBy(actor.id)).filter((item) => item.source === "form");
    if (input.clientRequestId && own.some((item) => item.clientRequestId === input.clientRequestId)) {
      return { status: 200, body: { ok: true, notice: msg("Thank you. Your suggestion was received.") } };
    }
    if (own.filter((item) => now - Date.parse(item.createdAt) < DAY).length >= SUGGESTIONS_PER_DAY) {
      return { status: 429, body: { error: msg("You sent many suggestions today. Thank you! Please send more tomorrow."), code: "rate-limit" } };
    }
    const hash = contentHash(input.title, input.details);
    if (own.some((item) => item.contentHash === hash && now - Date.parse(item.createdAt) < DUPLICATE_SUGGESTION_DAYS * DAY)) {
      return { status: 409, body: { error: msg("You already sent this suggestion. It is saved, and you can follow its status below."), code: "duplicate" } };
    }
    const flag = autoFlag(`${input.title}\n${input.details}`);
    const iso = new Date(now).toISOString();
    await deps.repo.insertSuggestion({
      id: makeId(deps),
      userId: actor.id,
      category: input.category,
      title: input.title,
      details: input.details,
      theme: "",
      status: "new",
      flagged: flag !== null,
      flagReason: flag,
      adminNote: "",
      source: "form",
      reviewId: null,
      locale: input.locale,
      clientRequestId: input.clientRequestId,
      contentHash: hash,
      createdAt: iso,
      updatedAt: iso,
    });
    return { status: 201, body: { ok: true, notice: msg("Thank you! Your suggestion was saved. You can follow its status on this page.") } };
  });
}

export async function memberAction(actor: Actor, body: Record<string, unknown>, deps: FeedbackDeps): Promise<Result> {
  if (body.action === "review") return submitReview(actor, body, deps);
  if (body.action === "suggestion") return submitSuggestion(actor, body, deps);
  return { status: 400, body: { error: msg("That action is not available.") } };
}

/* ---------------- Administrator ---------------- */

export type AdminReview = Omit<StoredReview, "userId" | "clientRequestId" | "contentHash"> & { member: string };
export type AdminSuggestion = Omit<StoredSuggestion, "userId" | "clientRequestId" | "contentHash"> & { member: string };

export type AdminOverview = {
  storage: "memory" | "account";
  reviews: AdminReview[];
  suggestions: AdminSuggestion[];
  announcements: StoredAnnouncement[];
  analytics: FeedbackAnalytics;
};

/** Drops the account id, request id, and content hash before anything reaches a browser. */
function withoutIds<T extends { userId: string; clientRequestId: string | null; contentHash: string }>(row: T) {
  const copy: Record<string, unknown> = { ...row, member: memberCode(row.userId) };
  delete copy.userId;
  delete copy.clientRequestId;
  delete copy.contentHash;
  return copy as Omit<T, "userId" | "clientRequestId" | "contentHash"> & { member: string };
}

const adminReview = (row: StoredReview): AdminReview => withoutIds(row);
const adminSuggestion = (row: StoredSuggestion): AdminSuggestion => withoutIds(row);

export async function adminOverview(actor: Actor, deps: FeedbackDeps): Promise<Result> {
  if (!actor.isAdmin) return { status: 403, body: { error: msg("This is available to the administrator only.") } };
  const [reviews, suggestions, announcements] = await Promise.all([
    deps.repo.listReviews(),
    deps.repo.listSuggestions(),
    deps.repo.listAnnouncements(),
  ]);
  const overview: AdminOverview = {
    storage: deps.storage,
    reviews: reviews.sort(newest).map(adminReview),
    suggestions: suggestions.sort(newest).map(adminSuggestion),
    announcements: announcements.sort((a, b) => b.implementedOn.localeCompare(a.implementedOn) || newest(a, b)),
    analytics: feedbackAnalytics(reviews, suggestions, announcements),
  };
  return { status: 200, body: overview };
}

const NOT_FOUND: Result = { status: 404, body: { error: msg("That item was not found. It may have been deleted.") } };

function flagReason(value: unknown): FlagReason {
  return typeof value === "string" && (FLAG_REASONS as readonly string[]).includes(value) ? (value as FlagReason) : "other";
}

function note(value: unknown): string | null {
  const text = cleanText(value);
  return text.length > ADMIN_NOTE_MAX ? null : text;
}

async function reviewAction(op: string, review: StoredReview, body: Record<string, unknown>, deps: FeedbackDeps): Promise<Result> {
  const iso = new Date(clock(deps)).toISOString();
  const next: StoredReview = { ...review, updatedAt: iso };
  switch (op) {
    case "publish":
      if (!review.publishConsent) {
        return { status: 409, body: { error: msg("This member kept the review private, so it cannot be published.") } };
      }
      next.status = "published";
      next.publishedAt = review.publishedAt ?? iso;
      break;
    case "hide":
      next.status = "hidden";
      break;
    case "restore":
      // Back to the public page if it was published with consent before; otherwise back to the waiting list.
      next.status = review.publishConsent && review.publishedAt ? "published" : "pending";
      break;
    case "flag":
      next.flagged = true;
      next.flagReason = flagReason(body.reason);
      break;
    case "unflag":
      next.flagged = false;
      next.flagReason = null;
      break;
    case "note": {
      const text = note(body.note);
      if (text === null) return { status: 400, body: { error: msg("The note is too long.") } };
      next.adminNote = text;
      break;
    }
    case "delete":
      await deps.repo.deleteReview(review.id);
      return { status: 200, body: { ok: true, notice: msg("Deleted.") } };
    default:
      return { status: 400, body: { error: msg("That action is not available.") } };
  }
  await deps.repo.updateReview(next);
  return { status: 200, body: { ok: true, notice: msg("Saved.") } };
}

async function suggestionAction(op: string, item: StoredSuggestion, body: Record<string, unknown>, deps: FeedbackDeps): Promise<Result> {
  const next: StoredSuggestion = { ...item, updatedAt: new Date(clock(deps)).toISOString() };
  switch (op) {
    case "status": {
      if (typeof body.status !== "string" || !(SUGGESTION_STATUSES as readonly string[]).includes(body.status)) {
        return { status: 400, body: { error: msg("Choose a status from the list.") } };
      }
      next.status = body.status as SuggestionStatus;
      break;
    }
    case "category": {
      if (typeof body.category !== "string" || !SUGGESTION_CATEGORY_IDS.includes(body.category)) {
        return { status: 400, body: { error: msg("Choose a topic from the list.") } };
      }
      next.category = body.category as SuggestionCategory;
      break;
    }
    case "theme": {
      const theme = cleanText(body.theme).replace(/\s+/g, " ");
      if (theme.length > THEME_MAX) return { status: 400, body: { error: msg("Use a shorter theme.") } };
      next.theme = theme;
      break;
    }
    case "flag":
      next.flagged = true;
      next.flagReason = flagReason(body.reason);
      break;
    case "unflag":
      next.flagged = false;
      next.flagReason = null;
      break;
    case "note": {
      const text = note(body.note);
      if (text === null) return { status: 400, body: { error: msg("The note is too long.") } };
      next.adminNote = text;
      break;
    }
    case "delete":
      await deps.repo.deleteSuggestion(item.id);
      return { status: 200, body: { ok: true, notice: msg("Deleted.") } };
    default:
      return { status: 400, body: { error: msg("That action is not available.") } };
  }
  await deps.repo.updateSuggestion(next);
  return { status: 200, body: { ok: true, notice: msg("Saved.") } };
}

async function announcementAction(op: string, body: Record<string, unknown>, deps: FeedbackDeps): Promise<Result> {
  const iso = new Date(clock(deps)).toISOString();
  if (op === "create") {
    const parsed = parseAnnouncement(body);
    if (!parsed.ok) return { status: 400, body: { error: parsed.error, field: parsed.field } };
    await deps.repo.insertAnnouncement({ id: makeId(deps), ...parsed.value, createdAt: iso, updatedAt: iso });
    return { status: 201, body: { ok: true, notice: parsed.value.published ? msg("Announcement published.") : msg("Announcement saved as a draft.") } };
  }
  const id = typeof body.id === "string" && UUID.test(body.id) ? body.id : null;
  const existing = id ? await deps.repo.getAnnouncement(id) : null;
  if (!existing) return NOT_FOUND;
  if (op === "delete") {
    await deps.repo.deleteAnnouncement(existing.id);
    return { status: 200, body: { ok: true, notice: msg("Deleted.") } };
  }
  if (op === "publish" || op === "unpublish") {
    await deps.repo.updateAnnouncement({ ...existing, published: op === "publish", updatedAt: iso });
    return { status: 200, body: { ok: true, notice: op === "publish" ? msg("Announcement published.") : msg("Announcement hidden.") } };
  }
  if (op === "update") {
    const parsed = parseAnnouncement(body);
    if (!parsed.ok) return { status: 400, body: { error: parsed.error, field: parsed.field } };
    await deps.repo.updateAnnouncement({ ...existing, ...parsed.value, updatedAt: iso });
    return { status: 200, body: { ok: true, notice: msg("Saved.") } };
  }
  return { status: 400, body: { error: msg("That action is not available.") } };
}

/** Every administrator change. The route checks the administrator's sign-in first; this checks again. */
export async function adminAction(actor: Actor, body: Record<string, unknown>, deps: FeedbackDeps): Promise<Result> {
  if (!actor.isAdmin) return { status: 403, body: { error: msg("This is available to the administrator only.") } };
  const target = body.target;
  const op = typeof body.op === "string" ? body.op : "";
  if (target === "announcement") return deps.repo.runExclusive(() => announcementAction(op, body, deps));
  const id = typeof body.id === "string" && UUID.test(body.id) ? body.id : null;
  if (!id) return NOT_FOUND;
  return deps.repo.runExclusive(async () => {
    if (target === "review") {
      const review = await deps.repo.getReview(id);
      return review ? reviewAction(op, review, body, deps) : NOT_FOUND;
    }
    if (target === "suggestion") {
      const item = await deps.repo.getSuggestion(id);
      return item ? suggestionAction(op, item, body, deps) : NOT_FOUND;
    }
    return { status: 400, body: { error: msg("That action is not available.") } };
  });
}
