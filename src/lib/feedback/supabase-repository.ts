import type { SupabaseClient } from "@supabase/supabase-js";
import { createMutex } from "@/lib/community/repository";
import type { FeedbackRepository } from "@/lib/feedback/repository";
import {
  FLAG_REASONS,
  RECOMMEND_OPTIONS,
  REVIEW_STATUSES,
  SUGGESTION_CATEGORY_IDS,
  SUGGESTION_STATUSES,
  type FlagReason,
  type Rating,
  type Recommend,
  type ReviewStatus,
  type StoredAnnouncement,
  type StoredReview,
  type StoredSuggestion,
  type SuggestionCategory,
  type SuggestionStatus,
} from "@/lib/feedback/types";

/** Browser roles have no grant on these tables. Only this server-side module reads or writes them. */
export const FEEDBACK_TABLES = ["feedback_reviews", "feedback_suggestions", "feedback_announcements"] as const;

type Row = Record<string, unknown>;

const text = (value: unknown): string => (typeof value === "string" ? value : "");
const maybeText = (value: unknown): string | null => (typeof value === "string" ? value : null);
const list = (value: unknown): string[] => (Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);
const oneOf = <T extends string>(value: unknown, options: readonly T[]): T | null =>
  typeof value === "string" && (options as readonly string[]).includes(value) ? (value as T) : null;

export function toReview(row: Row): StoredReview | null {
  const status = oneOf<ReviewStatus>(row.status, REVIEW_STATUSES);
  const rating = Number(row.rating);
  if (!status || !text(row.id) || !text(row.user_id) || !(rating >= 1 && rating <= 5)) return null;
  return {
    id: text(row.id),
    userId: text(row.user_id),
    rating: rating as Rating,
    likedText: text(row.liked_text),
    likedSections: list(row.liked_sections),
    improveText: text(row.improve_text),
    improveSections: list(row.improve_sections),
    featuresText: text(row.features_text),
    recommend: oneOf<Recommend>(row.recommend, RECOMMEND_OPTIONS),
    thoughts: text(row.thoughts),
    publishConsent: row.publish_consent === true,
    displayName: maybeText(row.display_name),
    locale: text(row.locale) || "en",
    status,
    flagged: row.flagged === true,
    flagReason: oneOf<FlagReason>(row.flag_reason, FLAG_REASONS),
    adminNote: text(row.admin_note),
    clientRequestId: maybeText(row.client_request_id),
    contentHash: text(row.content_hash),
    createdAt: text(row.created_at),
    updatedAt: text(row.updated_at),
    publishedAt: maybeText(row.published_at),
  };
}

export function reviewRow(review: StoredReview): Row {
  return {
    id: review.id,
    user_id: review.userId,
    rating: review.rating,
    liked_text: review.likedText,
    liked_sections: review.likedSections,
    improve_text: review.improveText,
    improve_sections: review.improveSections,
    features_text: review.featuresText,
    recommend: review.recommend,
    thoughts: review.thoughts,
    publish_consent: review.publishConsent,
    display_name: review.displayName,
    locale: review.locale,
    status: review.status,
    flagged: review.flagged,
    flag_reason: review.flagReason,
    admin_note: review.adminNote,
    client_request_id: review.clientRequestId,
    content_hash: review.contentHash,
    created_at: review.createdAt,
    updated_at: review.updatedAt,
    published_at: review.publishedAt,
  };
}

export function toSuggestion(row: Row): StoredSuggestion | null {
  const status = oneOf<SuggestionStatus>(row.status, SUGGESTION_STATUSES);
  const category = oneOf(row.category, SUGGESTION_CATEGORY_IDS) as SuggestionCategory | null;
  if (!status || !category || !text(row.id) || !text(row.user_id)) return null;
  return {
    id: text(row.id),
    userId: text(row.user_id),
    category,
    title: text(row.title),
    details: text(row.details),
    theme: text(row.theme),
    status,
    flagged: row.flagged === true,
    flagReason: oneOf<FlagReason>(row.flag_reason, FLAG_REASONS),
    adminNote: text(row.admin_note),
    source: row.source === "review" ? "review" : "form",
    reviewId: maybeText(row.review_id),
    locale: text(row.locale) || "en",
    clientRequestId: maybeText(row.client_request_id),
    contentHash: text(row.content_hash),
    createdAt: text(row.created_at),
    updatedAt: text(row.updated_at),
  };
}

export function suggestionRow(item: StoredSuggestion): Row {
  return {
    id: item.id,
    user_id: item.userId,
    category: item.category,
    title: item.title,
    details: item.details,
    theme: item.theme,
    status: item.status,
    flagged: item.flagged,
    flag_reason: item.flagReason,
    admin_note: item.adminNote,
    source: item.source,
    review_id: item.reviewId,
    locale: item.locale,
    client_request_id: item.clientRequestId,
    content_hash: item.contentHash,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  };
}

export function toAnnouncement(row: Row): StoredAnnouncement | null {
  if (!text(row.id) || !text(row.title)) return null;
  return {
    id: text(row.id),
    title: text(row.title),
    description: text(row.description),
    imagePath: maybeText(row.image_path),
    implementedOn: text(row.implemented_on).slice(0, 10),
    category: text(row.category),
    published: row.published === true,
    createdAt: text(row.created_at),
    updatedAt: text(row.updated_at),
  };
}

export function announcementRow(item: StoredAnnouncement): Row {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    image_path: item.imagePath,
    implemented_on: item.implementedOn,
    category: item.category,
    published: item.published,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  };
}

function rows<T>(result: { data: unknown; error: { message?: string } | null }, map: (row: Row) => T | null): T[] {
  if (result.error) throw new Error(result.error.message ?? "Feedback storage failed");
  return ((result.data as Row[] | null) ?? []).flatMap((row) => {
    const item = map(row);
    return item ? [item] : [];
  });
}

function check(result: { error: { message?: string } | null }) {
  if (result.error) throw new Error(result.error.message ?? "Feedback storage failed");
}

/** Reviews & Feedback storage in Supabase through the server-only service role client. */
export function createSupabaseFeedbackRepository(client: SupabaseClient): FeedbackRepository {
  const reviews = () => client.from("feedback_reviews");
  const suggestions = () => client.from("feedback_suggestions");
  const announcements = () => client.from("feedback_announcements");
  return {
    runExclusive: createMutex(),
    async listReviews() {
      return rows(await reviews().select("*").order("created_at", { ascending: false }).limit(2000), toReview);
    },
    async listReviewsBy(userId) {
      return rows(await reviews().select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50), toReview);
    },
    async getReview(id) {
      return rows(await reviews().select("*").eq("id", id).limit(1), toReview)[0] ?? null;
    },
    async insertReview(review) {
      check(await reviews().insert(reviewRow(review)));
    },
    async updateReview(review) {
      check(await reviews().update(reviewRow(review)).eq("id", review.id));
    },
    async deleteReview(id) {
      check(await reviews().delete().eq("id", id));
    },
    async listSuggestions() {
      return rows(await suggestions().select("*").order("created_at", { ascending: false }).limit(2000), toSuggestion);
    },
    async listSuggestionsBy(userId) {
      return rows(await suggestions().select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(100), toSuggestion);
    },
    async getSuggestion(id) {
      return rows(await suggestions().select("*").eq("id", id).limit(1), toSuggestion)[0] ?? null;
    },
    async insertSuggestion(item) {
      check(await suggestions().insert(suggestionRow(item)));
    },
    async updateSuggestion(item) {
      check(await suggestions().update(suggestionRow(item)).eq("id", item.id));
    },
    async deleteSuggestion(id) {
      check(await suggestions().delete().eq("id", id));
    },
    async listAnnouncements() {
      return rows(await announcements().select("*").order("implemented_on", { ascending: false }).limit(200), toAnnouncement);
    },
    async getAnnouncement(id) {
      return rows(await announcements().select("*").eq("id", id).limit(1), toAnnouncement)[0] ?? null;
    },
    async insertAnnouncement(item) {
      check(await announcements().insert(announcementRow(item)));
    },
    async updateAnnouncement(item) {
      check(await announcements().update(announcementRow(item)).eq("id", item.id));
    },
    async deleteAnnouncement(id) {
      check(await announcements().delete().eq("id", id));
    },
  };
}
