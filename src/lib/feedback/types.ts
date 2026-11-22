import { msg } from "@/lib/i18n/translate";

/**
 * Reviews & Feedback: shared types and fixed option lists.
 *
 * Reviews and suggestions are stored on the server only (service role, no
 * browser grants). A review can be shown on "What our members say" only when
 * its author agreed to publication and an administrator published it.
 * Administrator notes, flags, and account ids never leave the admin routes.
 */

export const RATINGS = [1, 2, 3, 4, 5] as const;
export type Rating = (typeof RATINGS)[number];

export const RATING_LABELS: Record<Rating, string> = {
  5: msg("Excellent"),
  4: msg("Very Good"),
  3: msg("Good"),
  2: msg("Needs Improvement"),
  1: msg("Poor"),
};

export const RECOMMEND_OPTIONS = ["yes", "maybe", "no"] as const;
export type Recommend = (typeof RECOMMEND_OPTIONS)[number];
export const RECOMMEND_LABELS: Record<Recommend, string> = {
  yes: msg("Yes"),
  maybe: msg("Maybe"),
  no: msg("No"),
};

/** Sections a member can tick as a favorite or as needing work. Stored as these ids. */
export const APP_SECTIONS = [
  { id: "dashboard", label: msg("Dashboard") },
  { id: "assessment", label: msg("Lifestyle assessment") },
  { id: "assistant", label: msg("Wellness Assistant") },
  { id: "change-lab", label: msg("Change Lab") },
  { id: "what-if", label: msg("WHAT IF?") },
  { id: "nutrition", label: msg("Nutrition") },
  { id: "food", label: msg("Food & Wellness") },
  { id: "movement", label: msg("Movement") },
  { id: "library", label: msg("Wellness Library") },
  { id: "breathing", label: msg("Breathe for Life") },
  { id: "brain", label: msg("Brain & Mind") },
  { id: "daily", label: msg("LifeZoi Daily") },
  { id: "progress", label: msg("Progress") },
  { id: "community", label: msg("Community") },
  { id: "music", label: msg("My Music") },
] as const;
export type AppSectionId = (typeof APP_SECTIONS)[number]["id"];
export const APP_SECTION_IDS = APP_SECTIONS.map((section) => section.id) as readonly string[];

export const REVIEW_STATUSES = ["pending", "published", "hidden"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];
export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: msg("Waiting for review"),
  published: msg("Published"),
  hidden: msg("Hidden"),
};

export const SUGGESTION_CATEGORIES = [
  { id: "feature", label: msg("A new feature") },
  { id: "improvement", label: msg("An improvement") },
  { id: "wellness-category", label: msg("A new wellness category") },
  { id: "problem", label: msg("Something confusing or broken") },
  { id: "assistant-question", label: msg("A question for the Wellness Assistant") },
  { id: "education", label: msg("New educational content") },
  { id: "positive", label: msg("A positive experience") },
  { id: "missing", label: msg("Something that is missing") },
  { id: "other", label: msg("Something else") },
] as const;
export type SuggestionCategory = (typeof SUGGESTION_CATEGORIES)[number]["id"];
export const SUGGESTION_CATEGORY_IDS = SUGGESTION_CATEGORIES.map((item) => item.id) as readonly string[];

export const SUGGESTION_STATUSES = ["new", "under-review", "planned", "in-progress", "completed", "declined"] as const;
export type SuggestionStatus = (typeof SUGGESTION_STATUSES)[number];
export const SUGGESTION_STATUS_LABELS: Record<SuggestionStatus, string> = {
  new: msg("New"),
  "under-review": msg("Under Review"),
  planned: msg("Planned"),
  "in-progress": msg("In Progress"),
  completed: msg("Completed"),
  declined: msg("Declined"),
};

/** Why a submission was flagged. "filter" is the automatic word check; the rest are set by an administrator. */
export const FLAG_REASONS = ["filter", "spam", "abuse", "privacy", "fraud", "other"] as const;
export type FlagReason = (typeof FLAG_REASONS)[number];
export const FLAG_REASON_LABELS: Record<FlagReason, string> = {
  filter: msg("Caught by the word check"),
  spam: msg("Spam"),
  abuse: msg("Abusive or inappropriate"),
  privacy: msg("Shares private information"),
  fraud: msg("Looks fake or fraudulent"),
  other: msg("Other"),
};

export type StoredReview = {
  id: string;
  userId: string;
  rating: Rating;
  likedText: string;
  likedSections: string[];
  improveText: string;
  improveSections: string[];
  featuresText: string;
  recommend: Recommend | null;
  thoughts: string;
  /** The author agreed that the review may appear on "What our members say". */
  publishConsent: boolean;
  /** The author agreed to show this first name with the review. Null means anonymous. */
  displayName: string | null;
  locale: string;
  status: ReviewStatus;
  flagged: boolean;
  flagReason: FlagReason | null;
  adminNote: string;
  clientRequestId: string | null;
  contentHash: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type StoredSuggestion = {
  id: string;
  userId: string;
  category: SuggestionCategory;
  title: string;
  details: string;
  /** Short label an administrator gives to group repeated requests, for example "Dark mode". */
  theme: string;
  status: SuggestionStatus;
  flagged: boolean;
  flagReason: FlagReason | null;
  adminNote: string;
  source: "form" | "review";
  reviewId: string | null;
  locale: string;
  clientRequestId: string | null;
  contentHash: string;
  createdAt: string;
  updatedAt: string;
};

export type StoredAnnouncement = {
  id: string;
  title: string;
  description: string;
  imagePath: string | null;
  implementedOn: string;
  category: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

/** What any member may see of a published review. No account id, no note, no flag. */
export type PublicReview = {
  id: string;
  rating: Rating;
  likedText: string;
  improveText: string;
  thoughts: string;
  name: string | null;
  createdAt: string;
};

export type PublicAnnouncement = Omit<StoredAnnouncement, "published" | "createdAt" | "updatedAt">;

export type RatingSummary = {
  average: number | null;
  total: number;
  counts: Record<Rating, number>;
};

/** A member's own suggestion, with its status but without the administrator's note or flag. */
export type OwnSuggestion = Pick<StoredSuggestion, "id" | "category" | "title" | "details" | "status" | "createdAt">;

export type OwnReview = Pick<StoredReview, "id" | "rating" | "status" | "publishConsent" | "createdAt">;

export type FeedbackBoard = {
  storage: "memory" | "account";
  summary: RatingSummary;
  reviews: PublicReview[];
  announcements: PublicAnnouncement[];
  ownReview: OwnReview | null;
  ownSuggestions: OwnSuggestion[];
  /** When the member may send another review, if they sent one recently. */
  nextReviewAt: string | null;
};
