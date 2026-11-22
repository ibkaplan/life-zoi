import { createMutex } from "@/lib/community/repository";
import type { StoredAnnouncement, StoredReview, StoredSuggestion } from "@/lib/feedback/types";

/** Storage for Reviews & Feedback. The server is the only reader and writer. */
export type FeedbackRepository = {
  runExclusive<T>(task: () => Promise<T>): Promise<T>;
  listReviews(): Promise<StoredReview[]>;
  listReviewsBy(userId: string): Promise<StoredReview[]>;
  getReview(id: string): Promise<StoredReview | null>;
  insertReview(review: StoredReview): Promise<void>;
  updateReview(review: StoredReview): Promise<void>;
  deleteReview(id: string): Promise<void>;
  listSuggestions(): Promise<StoredSuggestion[]>;
  listSuggestionsBy(userId: string): Promise<StoredSuggestion[]>;
  getSuggestion(id: string): Promise<StoredSuggestion | null>;
  insertSuggestion(suggestion: StoredSuggestion): Promise<void>;
  updateSuggestion(suggestion: StoredSuggestion): Promise<void>;
  deleteSuggestion(id: string): Promise<void>;
  listAnnouncements(): Promise<StoredAnnouncement[]>;
  getAnnouncement(id: string): Promise<StoredAnnouncement | null>;
  insertAnnouncement(announcement: StoredAnnouncement): Promise<void>;
  updateAnnouncement(announcement: StoredAnnouncement): Promise<void>;
  deleteAnnouncement(id: string): Promise<void>;
};

function copy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** In-memory storage for development and tests. Rows disappear when the server restarts. */
export function createMemoryFeedbackRepository(): FeedbackRepository {
  const reviews = new Map<string, StoredReview>();
  const suggestions = new Map<string, StoredSuggestion>();
  const announcements = new Map<string, StoredAnnouncement>();
  return {
    runExclusive: createMutex(),
    async listReviews() {
      return [...reviews.values()].map(copy);
    },
    async listReviewsBy(userId) {
      return [...reviews.values()].filter((item) => item.userId === userId).map(copy);
    },
    async getReview(id) {
      const found = reviews.get(id);
      return found ? copy(found) : null;
    },
    async insertReview(review) {
      reviews.set(review.id, copy(review));
    },
    async updateReview(review) {
      if (reviews.has(review.id)) reviews.set(review.id, copy(review));
    },
    async deleteReview(id) {
      reviews.delete(id);
      for (const [key, item] of suggestions) if (item.reviewId === id) suggestions.set(key, { ...item, reviewId: null });
    },
    async listSuggestions() {
      return [...suggestions.values()].map(copy);
    },
    async listSuggestionsBy(userId) {
      return [...suggestions.values()].filter((item) => item.userId === userId).map(copy);
    },
    async getSuggestion(id) {
      const found = suggestions.get(id);
      return found ? copy(found) : null;
    },
    async insertSuggestion(suggestion) {
      suggestions.set(suggestion.id, copy(suggestion));
    },
    async updateSuggestion(suggestion) {
      if (suggestions.has(suggestion.id)) suggestions.set(suggestion.id, copy(suggestion));
    },
    async deleteSuggestion(id) {
      suggestions.delete(id);
    },
    async listAnnouncements() {
      return [...announcements.values()].map(copy);
    },
    async getAnnouncement(id) {
      const found = announcements.get(id);
      return found ? copy(found) : null;
    },
    async insertAnnouncement(announcement) {
      announcements.set(announcement.id, copy(announcement));
    },
    async updateAnnouncement(announcement) {
      if (announcements.has(announcement.id)) announcements.set(announcement.id, copy(announcement));
    },
    async deleteAnnouncement(id) {
      announcements.delete(id);
    },
  };
}
