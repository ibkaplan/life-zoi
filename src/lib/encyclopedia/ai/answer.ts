import { queryWords, readingMinutes, scoreArticle } from "@/lib/encyclopedia/catalog";
import { EVIDENCE_INFO } from "@/lib/encyclopedia/categories";
import type { Article, ArticleSection, EvidenceLevel } from "@/lib/encyclopedia/types";
import { msg } from "@/lib/i18n/translate";

export const NO_ARTICLE_TEXT = [
  msg("I could not find a LifeZoi Health Encyclopedia article on that yet, so I cannot give you a reliable answer from our library. A dedicated article is not available yet."),
  msg("Trustworthy places to look are MedlinePlus from the U.S. National Library of Medicine, the National Institutes of Health, and the World Health Organization. For anything about your own health, a doctor, nurse, or pharmacist can give advice that fits you."),
  msg("You can also try asking in other words, or pick one of the suggested topics."),
] as const;

/**
 * LifeZoi AI, library mode: answers are put together from the encyclopedia's own
 * articles. No language model and no outside service is involved, so nothing
 * leaves the LifeZoi server and nothing is invented. A model provider can be
 * added behind `AnswerProvider` later (see provider.ts).
 */

export type ChatTurn = { role: "user" | "assistant"; text: string };
export type AnswerLength = "short" | "detailed";

export type AnswerBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "points"; items: string[] }
  | { kind: "evidence"; claim: string; level: EvidenceLevel; label: string };

export type Answer = {
  /** Who produced the words: the library, or a model provider when one is approved. */
  source: "library" | "model";
  blocks: AnswerBlock[];
  /** Most relevant article first. */
  articles: { slug: string; title: string; summary: string; minutes: number; category: string; illustration?: string }[];
  /** True when no article matched well enough. */
  noArticle: boolean;
  /** What the answer was about, so the next question can refer back to it. */
  topic: string;
  safety?: "urgent" | "medication" | "diagnosis";
};

const PRONOUN = /\b(it|its|this|that|they|them|those|these|he|she)\b/i;
const FOLLOW_UP = /^(and|but|so|what about|how about|why|what causes|what can i do|how do i|is it|are they|does it|can it)\b/i;

/** The words to search for, borrowing the earlier topic when a follow-up refers back to it. */
export function searchTextFor(turns: readonly ChatTurn[]): { text: string; usedContext: boolean } {
  const users = turns.filter((turn) => turn.role === "user");
  const latest = users[users.length - 1]?.text ?? "";
  const earlier = users.slice(-3, -1).map((turn) => turn.text);
  const ownWords = queryWords(latest);
  const refersBack = PRONOUN.test(latest) || FOLLOW_UP.test(latest.trim()) || ownWords.length <= 2;
  if (refersBack && earlier.length > 0) return { text: `${latest} ${earlier.join(" ")}`, usedContext: true };
  return { text: latest, usedContext: false };
}

type Intent = "what" | "why" | "cause" | "prevent" | "risk" | "evidence" | "general";

export function intentOf(question: string): Intent {
  const q = question.toLowerCase();
  if (/\b(prevent|protect|reduce|lower|improve|what can i do|how can i|tips?|steps?|habits?|everyday)\b/.test(q)) return "prevent";
  if (/\b(cause|causes|caused|why do|risk factors?|what leads)\b/.test(q)) return "cause";
  if (/\b(risk|risks|danger|dangerous|safe|safety|side effects?|interact)/.test(q)) return "risk";
  if (/\b(evidence|proven|prove|research|study|studies|work|works|effective)\b/.test(q)) return "evidence";
  if (/\b(why|matter|important)\b/.test(q)) return "why";
  if (/^\s*(what is|what are|what's|define|explain|tell me about)\b/.test(q)) return "what";
  return "general";
}

const INTENT_HEADINGS: Record<Intent, RegExp> = {
  what: /what is|what are|^what is it/i,
  why: /why does it matter/i,
  cause: /science|what is|risk factor|insulin resistance/i,
  prevent: /practical|everyday|when to consult|how the approaches/i,
  risk: /risks|limitations|when to consult/i,
  evidence: /science|research|modern research|approved/i,
  general: /what is|science/i,
};

function sectionScore(section: ArticleSection, words: readonly string[], intent: Intent): number {
  const text = `${section.heading} ${section.standard.join(" ")}`.toLowerCase();
  let score = INTENT_HEADINGS[intent].test(section.heading) ? 4 : 0;
  for (const word of words) if (text.includes(word.replace(/(ing|ies|es|s)$/u, ""))) score += 1;
  return score;
}

/** The sections that best answer the question, in article order. */
export function bestSections(article: Article, question: string, count: number): ArticleSection[] {
  const words = queryWords(question);
  const intent = intentOf(question);
  const ranked = article.sections
    .map((section, index) => ({ section, index, score: sectionScore(section, words, intent) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, count)
    .sort((a, b) => a.index - b.index);
  return ranked.map((item) => item.section);
}

/** Articles that match the question well enough to recommend, best first. */
export function matchArticles(text: string, articles: readonly Article[], limit = 4): Article[] {
  const words = queryWords(text);
  if (words.length === 0) return [];
  const scored = articles
    .map((article) => ({ article, score: scoreArticle(article, words) }))
    .filter((item) => item.score >= 3)
    .sort((a, b) => b.score - a.score);
  if (scored.length === 0) return [];
  // Keep only articles reasonably close to the best match, so cards are not random.
  const top = scored[0].score;
  return scored.filter((item) => item.score >= top * 0.35).slice(0, limit).map((item) => item.article);
}

function cardFor(article: Article) {
  return {
    slug: article.slug,
    title: article.title,
    summary: article.easySummary,
    minutes: readingMinutes(article),
    category: article.category,
    illustration: article.image?.illustration,
  };
}

/** Builds a library-mode answer for the latest question. */
export function libraryAnswer(input: { turns: readonly ChatTurn[]; length: AnswerLength; articles: readonly Article[]; focusSlug?: string }): Answer {
  const { turns, length, articles } = input;
  const question = [...turns].reverse().find((turn) => turn.role === "user")?.text ?? "";
  const { text } = searchTextFor(turns);
  let matches = matchArticles(text, articles);
  const focus = input.focusSlug ? articles.find((article) => article.slug === input.focusSlug) : undefined;
  if (focus) matches = [focus, ...matches.filter((article) => article.slug !== focus.slug)].slice(0, 4);

  if (matches.length === 0) {
    return {
      source: "library",
      noArticle: true,
      topic: question.slice(0, 200),
      articles: [],
      blocks: NO_ARTICLE_TEXT.map((text) => ({ kind: "paragraph" as const, text })),
    };
  }

  const main = matches[0];
  const blocks: AnswerBlock[] = [];
  blocks.push({ kind: "paragraph", text: length === "short" ? main.easySummary : main.summary });
  const sections = bestSections(main, `${question} ${text}`, length === "short" ? 1 : 2);
  for (const section of sections) {
    const paragraphs = length === "short" ? (section.easy && section.easy.length > 0 ? section.easy : section.standard.slice(0, 1)) : section.standard;
    for (const paragraph of paragraphs.slice(0, length === "short" ? 2 : 3)) blocks.push({ kind: "paragraph", text: paragraph });
    if (section.points && section.points.length > 0) blocks.push({ kind: "points", items: section.points });
  }
  if (length === "detailed" && main.takeaways.length > 0) blocks.push({ kind: "points", items: main.takeaways });
  const claims = length === "short" ? main.evidence.slice(0, 1) : main.evidence.slice(0, 3);
  for (const claim of claims) blocks.push({ kind: "evidence", claim: claim.claim, level: claim.level, label: EVIDENCE_INFO[claim.level].label });

  return { source: "library", noArticle: false, topic: main.title, articles: matches.map(cardFor), blocks };
}
