/**
 * LifeZoi Health Encyclopedia: the shapes shared by the built-in articles, the
 * articles an editor writes in the admin page, and the server validation.
 *
 * Article text is plain text. It is never rendered as HTML, so an editor cannot
 * add markup or scripts. Paragraphs are separate strings.
 */

export const CATEGORY_SLUGS = [
  "medical-discoveries",
  "cancer",
  "fasting-metabolism",
  "nutrition",
  "brain",
  "heart",
  "gut",
  "longevity",
  "sleep-stress",
  "eastern-medicine",
  "western-medicine",
  "future-medicine",
] as const;
export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

/**
 * How strong the evidence is for one specific claim. These are assigned claim by
 * claim, never to a whole topic, and each one names the kind of studies behind it.
 */
export const EVIDENCE_LEVELS = ["strong", "promising", "limited", "not-established"] as const;
export type EvidenceLevel = (typeof EVIDENCE_LEVELS)[number];

/** What kind of research a claim rests on. Shown next to the label. */
export const STUDY_TYPES = [
  "guidance",
  "systematic-review",
  "randomized-trials",
  "observational",
  "animal-lab",
  "history",
  "approval",
] as const;
export type StudyType = (typeof STUDY_TYPES)[number];

export type EvidenceClaim = {
  claim: string;
  level: EvidenceLevel;
  basis: StudyType;
};

export type Reference = {
  title: string;
  publisher: string;
  url: string;
  /** Publication or last-updated date given by the source, as written there, e.g. "2019" or "2023-12-08". */
  date?: string;
};

export type ArticleSection = {
  /** One of the standard section headings, or an editor's own heading. */
  heading: string;
  /** Standard reading mode: the fuller text. */
  standard: string[];
  /** Easy reading mode: short, plain sentences. Falls back to `standard` when empty. */
  easy?: string[];
  /** Short bullet points, shown in both modes. */
  points?: string[];
};

/** Extra safety text for serious topics: cancer, fasting, diabetes, heart, herbs. */
export const SAFETY_TOPICS = ["cancer", "fasting", "diabetes", "heart", "herbs", "mental-health"] as const;
export type SafetyTopic = (typeof SAFETY_TOPICS)[number];

export type ArticleImage = {
  /** A built-in illustration name, or an https URL an editor added. */
  illustration?: string;
  url?: string;
  alt: string;
  credit?: string;
  license?: string;
};

export type ArticleStatus = "draft" | "in_review" | "published" | "archived";

export type ArticleReview = {
  /** Name and role of the person who checked the article, e.g. "Dr. A. Smith, MD". */
  reviewer: string;
  /** ISO date. */
  reviewedOn: string;
  note?: string;
};

export type Article = {
  slug: string;
  category: CategorySlug;
  /** Other categories it also appears in. */
  alsoIn?: CategorySlug[];
  title: string;
  summary: string;
  easySummary: string;
  keywords: string[];
  sections: ArticleSection[];
  evidence: EvidenceClaim[];
  takeaways: string[];
  references: Reference[];
  safety?: SafetyTopic[];
  image?: ArticleImage;
  /** Glossary term ids mentioned in the article. */
  terms?: string[];
  featured?: boolean;
  /** ISO dates. */
  publishedOn: string;
  updatedOn: string;
  /** Present only when a qualified person has reviewed the article. */
  review?: ArticleReview;
  /** Who wrote the draft, shown honestly on the page. */
  draftedBy: string;
  readingMinutes?: number;
};

export type Category = {
  slug: CategorySlug;
  title: string;
  description: string;
  illustration: string;
};

export type TimelineEra = "1960s" | "1970s" | "1980s" | "1990s" | "2000s" | "2010s" | "2020s" | "future";

export type TimelineEvent = {
  id: string;
  era: TimelineEra;
  /** The year shown, e.g. "1971". Future items say "In research". */
  year: string;
  field: string;
  title: string;
  what: string;
  who: string;
  why: string;
  today: string;
  /** Future items are research directions, not achievements. */
  status?: "research";
  articleSlug?: string;
  sources: Reference[];
};

export type GlossaryTerm = {
  id: string;
  term: string;
  meaning: string;
};
