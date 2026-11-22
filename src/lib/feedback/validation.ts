import { msg } from "@/lib/i18n/translate";
import {
  ANNOUNCEMENT_CATEGORY_MAX,
  ANNOUNCEMENT_DESCRIPTION_MAX,
  ANNOUNCEMENT_TITLE_MAX,
  DISPLAY_NAME_MAX,
  REVIEW_TEXT_MAX,
  REVIEW_THOUGHTS_MAX,
  SUGGESTION_DETAILS_MAX,
  SUGGESTION_TITLE_MAX,
} from "@/lib/feedback/policy";
import {
  APP_SECTION_IDS,
  RATINGS,
  RECOMMEND_OPTIONS,
  SUGGESTION_CATEGORY_IDS,
  type Rating,
  type Recommend,
  type SuggestionCategory,
} from "@/lib/feedback/types";

export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string; field?: string };

export type ReviewInput = {
  rating: Rating;
  likedText: string;
  likedSections: string[];
  improveText: string;
  improveSections: string[];
  featuresText: string;
  recommend: Recommend | null;
  thoughts: string;
  publishConsent: boolean;
  displayName: string | null;
  locale: string;
  clientRequestId: string | null;
};

export type SuggestionInput = {
  category: SuggestionCategory;
  title: string;
  details: string;
  locale: string;
  clientRequestId: string | null;
};

export type AnnouncementInput = {
  title: string;
  description: string;
  imagePath: string | null;
  implementedOn: string;
  category: string;
  published: boolean;
};

const REQUEST_ID = /^[A-Za-z0-9_-]{8,64}$/;
const LOCALE = /^[a-z]{2}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Trims, normalizes line endings, removes control characters, and collapses long runs of blank lines. */
export function cleanText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function oneLine(value: unknown): string {
  return cleanText(value).replace(/\s+/g, " ");
}

function sections(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out = new Set<string>();
  for (const item of value) if (typeof item === "string" && APP_SECTION_IDS.includes(item)) out.add(item);
  return [...out];
}

function requestId(value: unknown): string | null {
  return typeof value === "string" && REQUEST_ID.test(value) ? value : null;
}

function locale(value: unknown): string {
  return typeof value === "string" && LOCALE.test(value) ? value : "en";
}

/**
 * A first name only. Letters, spaces, apostrophes, and hyphens, so an email,
 * phone number, or web address cannot be shown as a name.
 */
export function parseDisplayName(value: unknown): Parsed<string> {
  const name = oneLine(value);
  if (!name) return { ok: false, error: msg("Type the first name to show, or choose to stay anonymous."), field: "displayName" };
  if (name.length > DISPLAY_NAME_MAX) return { ok: false, error: msg("Use a shorter first name."), field: "displayName" };
  if (!/^[\p{L}][\p{L}\p{M} '’.-]*$/u.test(name)) {
    return { ok: false, error: msg("Use letters only for the name, for example Anna."), field: "displayName" };
  }
  return { ok: true, value: name };
}

function tooLong(text: string, max: number, field: string): Parsed<never> | null {
  return text.length > max ? { ok: false, error: msg("One of the answers is too long. Shorten it and try again."), field } : null;
}

export function parseReview(body: Record<string, unknown>): Parsed<ReviewInput> {
  const rating = Number(body.rating);
  if (!(RATINGS as readonly number[]).includes(rating)) {
    return { ok: false, error: msg("Choose from 1 to 5 stars first."), field: "rating" };
  }
  const likedText = cleanText(body.likedText);
  const improveText = cleanText(body.improveText);
  const featuresText = cleanText(body.featuresText);
  const thoughts = cleanText(body.thoughts);
  const long =
    tooLong(likedText, REVIEW_TEXT_MAX, "likedText") ??
    tooLong(improveText, REVIEW_TEXT_MAX, "improveText") ??
    tooLong(featuresText, REVIEW_TEXT_MAX, "featuresText") ??
    tooLong(thoughts, REVIEW_THOUGHTS_MAX, "thoughts");
  if (long) return long;
  const recommend =
    typeof body.recommend === "string" && (RECOMMEND_OPTIONS as readonly string[]).includes(body.recommend)
      ? (body.recommend as Recommend)
      : null;
  const publishConsent = body.publishConsent === true;
  let displayName: string | null = null;
  if (publishConsent && body.showName === true) {
    const name = parseDisplayName(body.displayName);
    if (!name.ok) return name;
    displayName = name.value;
  }
  return {
    ok: true,
    value: {
      rating: rating as Rating,
      likedText,
      likedSections: sections(body.likedSections),
      improveText,
      improveSections: sections(body.improveSections),
      featuresText,
      recommend,
      thoughts,
      publishConsent,
      displayName,
      locale: locale(body.locale),
      clientRequestId: requestId(body.clientRequestId),
    },
  };
}

export function parseSuggestion(body: Record<string, unknown>): Parsed<SuggestionInput> {
  const category = typeof body.category === "string" && SUGGESTION_CATEGORY_IDS.includes(body.category) ? body.category : null;
  if (!category) return { ok: false, error: msg("Choose what your suggestion is about."), field: "category" };
  const title = oneLine(body.title);
  const details = cleanText(body.details);
  if (title.length < 3) return { ok: false, error: msg("Give your suggestion a short title."), field: "title" };
  if (title.length > SUGGESTION_TITLE_MAX) return { ok: false, error: msg("Use a shorter title."), field: "title" };
  if (details.length > SUGGESTION_DETAILS_MAX) {
    return { ok: false, error: msg("One of the answers is too long. Shorten it and try again."), field: "details" };
  }
  return {
    ok: true,
    value: {
      category: category as SuggestionCategory,
      title,
      details,
      locale: locale(body.locale),
      clientRequestId: requestId(body.clientRequestId),
    },
  };
}

/**
 * Announcement images are files already in the site's public folder, such as
 * /imagery/brain.webp. Outside addresses are refused so a page never loads
 * an image from another site.
 */
export function parseImagePath(value: unknown): Parsed<string | null> {
  const path = oneLine(value);
  if (!path) return { ok: true, value: null };
  if (!/^\/[A-Za-z0-9/_.-]{1,200}\.(?:jpe?g|png|webp|svg|avif)$/i.test(path) || path.includes("..") || path.startsWith("//")) {
    return { ok: false, error: msg("Use an image path from the site, for example /imagery/brain.webp."), field: "imagePath" };
  }
  return { ok: true, value: path };
}

export function isRealDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function parseAnnouncement(body: Record<string, unknown>): Parsed<AnnouncementInput> {
  const title = oneLine(body.title);
  const description = cleanText(body.description);
  const category = oneLine(body.category);
  const implementedOn = oneLine(body.implementedOn);
  if (title.length < 3) return { ok: false, error: msg("Give the announcement a short title."), field: "title" };
  if (title.length > ANNOUNCEMENT_TITLE_MAX) return { ok: false, error: msg("Use a shorter title."), field: "title" };
  if (description.length < 3) return { ok: false, error: msg("Describe what changed."), field: "description" };
  if (description.length > ANNOUNCEMENT_DESCRIPTION_MAX) {
    return { ok: false, error: msg("One of the answers is too long. Shorten it and try again."), field: "description" };
  }
  if (category.length > ANNOUNCEMENT_CATEGORY_MAX) return { ok: false, error: msg("Use a shorter category."), field: "category" };
  if (!isRealDate(implementedOn)) return { ok: false, error: msg("Choose the date it was added."), field: "implementedOn" };
  const image = parseImagePath(body.imagePath);
  if (!image.ok) return image;
  return {
    ok: true,
    value: { title, description, imagePath: image.value, implementedOn, category, published: body.published === true },
  };
}
