import {
  APP_SECTIONS,
  RATINGS,
  RECOMMEND_OPTIONS,
  SUGGESTION_CATEGORIES,
  SUGGESTION_STATUSES,
  type Rating,
  type RatingSummary,
  type Recommend,
  type StoredAnnouncement,
  type StoredReview,
  type StoredSuggestion,
  type SuggestionCategory,
  type SuggestionStatus,
} from "@/lib/feedback/types";

function emptyCounts(): Record<Rating, number> {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
}

/**
 * Average, total, and per-star counts from the ratings given. Nothing is added,
 * rounded up, or weighted. With no ratings the average is null, not zero.
 */
export function summarizeRatings(ratings: readonly number[]): RatingSummary {
  const counts = emptyCounts();
  let sum = 0;
  let total = 0;
  for (const value of ratings) {
    if (!(RATINGS as readonly number[]).includes(value)) continue;
    counts[value as Rating] += 1;
    sum += value;
    total += 1;
  }
  return { average: total ? Math.round((sum / total) * 10) / 10 : null, total, counts };
}

/** The public summary: published reviews only. Waiting, hidden, and private reviews are not counted. */
export function publicSummary(reviews: readonly StoredReview[]): RatingSummary {
  return summarizeRatings(reviews.filter(isPublic).map((review) => review.rating));
}

export function isPublic(review: StoredReview): boolean {
  return review.status === "published" && review.publishConsent;
}

export type CountRow = { id: string; count: number };

export type FeedbackAnalytics = {
  /** Every review sent, published or not, so the administrator sees honest totals. */
  allReviews: RatingSummary;
  publishedReviews: RatingSummary;
  reviewsByStatus: { pending: number; published: number; hidden: number; flagged: number; private: number };
  /** Reviews of 1 or 2 stars. Shown so they are read, not so they are removed. */
  lowRatings: number;
  recommend: Record<Recommend, number> & { unanswered: number };
  /** Sections ticked under "liked most", most first. */
  lovedSections: CountRow[];
  /** Sections ticked under "would like us to improve", most first. */
  improveSections: CountRow[];
  suggestionsByCategory: CountRow[];
  suggestionsByStatus: Record<SuggestionStatus, number>;
  /** Themes given by the administrator, with how many open suggestions share each. */
  topThemes: (CountRow & { open: number })[];
  /** Open suggestions that are not grouped under a theme yet. */
  unthemed: number;
  completed: number;
  publishedAnnouncements: number;
};

function ranked(counter: Map<string, number>, order: readonly string[]): CountRow[] {
  return [...counter.entries()]
    .filter(([, count]) => count > 0)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count || order.indexOf(a.id) - order.indexOf(b.id) || a.id.localeCompare(b.id));
}

function bump(counter: Map<string, number>, key: string) {
  counter.set(key, (counter.get(key) ?? 0) + 1);
}

const OPEN: ReadonlySet<SuggestionStatus> = new Set(["new", "under-review", "planned", "in-progress"]);

export function themeKey(theme: string): string {
  return theme.trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

export function feedbackAnalytics(
  reviews: readonly StoredReview[],
  suggestions: readonly StoredSuggestion[],
  announcements: readonly StoredAnnouncement[],
): FeedbackAnalytics {
  const sectionOrder = APP_SECTIONS.map((section) => section.id) as readonly string[];
  const loved = new Map<string, number>();
  const improve = new Map<string, number>();
  const recommend = { yes: 0, maybe: 0, no: 0, unanswered: 0 };
  const byStatus = { pending: 0, published: 0, hidden: 0, flagged: 0, private: 0 };
  for (const review of reviews) {
    byStatus[review.status] += 1;
    if (review.flagged) byStatus.flagged += 1;
    if (!review.publishConsent) byStatus.private += 1;
    for (const id of review.likedSections) bump(loved, id);
    for (const id of review.improveSections) bump(improve, id);
    if (review.recommend && (RECOMMEND_OPTIONS as readonly string[]).includes(review.recommend)) recommend[review.recommend] += 1;
    else recommend.unanswered += 1;
  }

  const categoryOrder = SUGGESTION_CATEGORIES.map((item) => item.id) as readonly string[];
  const categories = new Map<string, number>();
  const statuses = Object.fromEntries(SUGGESTION_STATUSES.map((status) => [status, 0])) as Record<SuggestionStatus, number>;
  const themes = new Map<string, { label: string; count: number; open: number }>();
  let unthemed = 0;
  for (const suggestion of suggestions) {
    bump(categories, suggestion.category satisfies SuggestionCategory);
    statuses[suggestion.status] += 1;
    const key = themeKey(suggestion.theme);
    if (!key) {
      if (OPEN.has(suggestion.status)) unthemed += 1;
      continue;
    }
    const entry = themes.get(key) ?? { label: suggestion.theme.trim(), count: 0, open: 0 };
    entry.count += 1;
    if (OPEN.has(suggestion.status)) entry.open += 1;
    themes.set(key, entry);
  }

  return {
    allReviews: summarizeRatings(reviews.map((review) => review.rating)),
    publishedReviews: publicSummary(reviews),
    reviewsByStatus: byStatus,
    lowRatings: reviews.filter((review) => review.rating <= 2).length,
    recommend,
    lovedSections: ranked(loved, sectionOrder),
    improveSections: ranked(improve, sectionOrder),
    suggestionsByCategory: ranked(categories, categoryOrder),
    suggestionsByStatus: statuses,
    topThemes: [...themes.values()]
      .map((entry) => ({ id: entry.label, count: entry.count, open: entry.open }))
      .sort((a, b) => b.count - a.count || b.open - a.open || a.id.localeCompare(b.id))
      .slice(0, 12),
    unthemed,
    completed: statuses.completed,
    publishedAnnouncements: announcements.filter((item) => item.published).length,
  };
}
