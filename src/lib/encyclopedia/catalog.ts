import { BUILT_IN_ARTICLES } from "@/lib/encyclopedia/articles";
import type { Article, ArticleStatus, CategorySlug } from "@/lib/encyclopedia/types";

/** An editor's saved article, as the server returns it. */
export type EditorialRecord = {
  slug: string;
  status: ArticleStatus;
  article: Article;
  updatedAt: string;
};

/** Words in an article, used for an estimated reading time. */
export function wordCount(article: Article): number {
  const parts = [
    article.title,
    article.summary,
    ...article.sections.flatMap((section) => [section.heading, ...section.standard, ...(section.points ?? [])]),
    ...article.takeaways,
  ];
  return parts.join(" ").split(/\s+/).filter(Boolean).length;
}

/** About 200 words a minute, at least one minute. */
export function readingMinutes(article: Article): number {
  return article.readingMinutes ?? Math.max(1, Math.round(wordCount(article) / 200));
}

/**
 * The articles members see. A published editorial version replaces the built-in
 * article with the same slug; an archived one hides it; drafts and articles in
 * review are not shown. New published articles are added.
 */
export function visibleArticles(records: readonly EditorialRecord[] = []): Article[] {
  const bySlug = new Map(records.map((record) => [record.slug, record]));
  const shown: Article[] = [];
  for (const article of BUILT_IN_ARTICLES) {
    const record = bySlug.get(article.slug);
    if (record?.status === "archived") continue;
    shown.push(record?.status === "published" ? record.article : article);
  }
  const builtIn = new Set(BUILT_IN_ARTICLES.map((article) => article.slug));
  for (const record of records) if (record.status === "published" && !builtIn.has(record.slug)) shown.push(record.article);
  return shown;
}

export function findArticle(slug: string, articles: readonly Article[]): Article | undefined {
  return articles.find((article) => article.slug === slug);
}

export function inCategory(slug: CategorySlug, articles: readonly Article[]): Article[] {
  return articles.filter((article) => article.category === slug || article.alsoIn?.includes(slug));
}

function normalize(text: string): string {
  return text
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ");
}

const STOP = new Set(["the", "a", "an", "and", "or", "of", "to", "in", "is", "are", "what", "how", "do", "does", "can", "i", "my", "for", "about", "with", "on", "it", "be", "me", "you", "your", "should", "why", "when", "which", "there", "this", "that", "health", "healthy", "know", "tell", "explain", "learn", "please", "need", "much", "many", "some", "any", "get", "have", "has", "does", "did", "will", "would", "could", "people", "person", "way", "ways", "thing", "things", "good", "best", "keep", "help", "make", "say", "says", "said", "all", "more", "most", "very", "really", "just", "also", "from", "at", "by", "as", "if", "so", "than", "then", "we", "us", "our", "they", "them", "their", "its", "who", "whom", "was", "were", "been", "being", "am", "not", "no", "yes", "into", "out", "up", "down", "over", "under", "again"]);

export function queryWords(query: string): string[] {
  return normalize(query)
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOP.has(word));
}

/** A crude stem so "vaccines" finds "vaccine" and "fasting" finds "fast". */
function stem(word: string): string {
  return word.replace(/(ing|ies|es|s)$/u, "").slice(0, 12) || word;
}

/**
 * Scores an article for the words of a query. Title and keyword matches count
 * most, then the summary, then the body. Returns 0 when nothing matches.
 */
export function scoreArticle(article: Article, words: readonly string[]): number {
  if (words.length === 0) return 0;
  const title = normalize(article.title);
  const keywords = normalize(article.keywords.join(" "));
  const summary = normalize(`${article.summary} ${article.easySummary}`);
  const body = normalize(article.sections.flatMap((section) => [section.heading, ...section.standard]).join(" "));
  let score = 0;
  let matched = 0;
  for (const word of words) {
    const root = stem(word);
    let hit = 0;
    if (title.includes(root)) hit += 6;
    if (keywords.includes(root)) hit += 5;
    if (summary.includes(root)) hit += 2;
    if (body.includes(root)) hit += 1;
    if (hit > 0) matched += 1;
    score += hit;
  }
  // Prefer articles that match more of the words asked about.
  return matched === 0 ? 0 : score * (matched / words.length);
}

export function searchArticles(query: string, articles: readonly Article[], limit = 50): Article[] {
  const words = queryWords(query);
  if (words.length === 0) return [];
  return articles
    .map((article) => ({ article, score: scoreArticle(article, words) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.article.title.localeCompare(b.article.title))
    .slice(0, limit)
    .map((item) => item.article);
}

/** Articles that share a category or keywords with this one, best first. */
export function relatedArticles(article: Article, articles: readonly Article[], limit = 3): Article[] {
  const own = new Set(article.keywords.map((keyword) => normalize(keyword)));
  const categories = new Set([article.category, ...(article.alsoIn ?? [])]);
  return articles
    .filter((other) => other.slug !== article.slug)
    .map((other) => {
      let score = 0;
      if (categories.has(other.category)) score += 3;
      for (const category of other.alsoIn ?? []) if (categories.has(category)) score += 2;
      for (const keyword of other.keywords) if (own.has(normalize(keyword))) score += 1;
      return { other, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.other.title.localeCompare(b.other.title))
    .slice(0, limit)
    .map((item) => item.other);
}

export function recentlyUpdated(articles: readonly Article[], limit = 4): Article[] {
  return [...articles].sort((a, b) => b.updatedOn.localeCompare(a.updatedOn) || a.title.localeCompare(b.title)).slice(0, limit);
}

export function featuredArticles(articles: readonly Article[], limit = 6): Article[] {
  return articles.filter((article) => article.featured).slice(0, limit);
}
