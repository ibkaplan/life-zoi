import {
  WELLNESS_QUESTIONS,
  type WellnessQuestion,
} from "@/lib/wellness-assistant/library";

const STOP = new Set([
  "a",
  "an",
  "the",
  "i",
  "my",
  "me",
  "to",
  "do",
  "does",
  "is",
  "are",
  "am",
  "can",
  "how",
  "what",
  "why",
  "when",
  "of",
  "for",
  "and",
  "or",
  "if",
  "it",
  "in",
  "on",
  "at",
  "with",
  "you",
  "your",
  "we",
  "be",
  "been",
  "not",
]);

export function normalizeQuestionText(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function distinctiveTokens(text: string): string[] {
  return normalizeQuestionText(text)
    .split(" ")
    .filter((token) => token.length > 2 && !STOP.has(token));
}

export function scorePreparedQuestion(query: string, question: string): number {
  const normalizedQuery = normalizeQuestionText(query);
  const normalizedQuestion = normalizeQuestionText(question);
  if (!normalizedQuery || !normalizedQuestion) return 0;
  if (normalizedQuery === normalizedQuestion) return 1;
  if (normalizedQuestion.includes(normalizedQuery) || normalizedQuery.includes(normalizedQuestion)) return 0.94;
  const queryTokens = distinctiveTokens(query);
  const questionTokens = distinctiveTokens(question);
  const questionSet = new Set(questionTokens);
  if (queryTokens.length === 0) {
    const raw = normalizedQuery.split(" ").filter(Boolean);
    if (raw.length === 0) return 0;
    const hits = raw.filter((token) => normalizedQuestion.includes(token)).length;
    return hits === 0 ? 0 : (hits / raw.length) * 0.4;
  }
  const hits = queryTokens.filter((token) => questionSet.has(token)).length;
  if (hits === 0) return 0;
  const coverage = hits / queryTokens.length;
  const precision = hits / Math.max(questionTokens.length, 1);
  return Math.min(0.9, coverage * 0.75 + precision * 0.25);
}

export type PreparedMatch = {
  confident: boolean;
  matches: WellnessQuestion[];
  selectedId: string | null;
};

export function matchPreparedQuestions(query: string): PreparedMatch {
  const ranked = WELLNESS_QUESTIONS.map((item) => ({
    item,
    score: scorePreparedQuestion(query, item.question),
  }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.item.question.localeCompare(b.item.question));
  const top = ranked[0];
  const second = ranked[1];
  const confident = (top?.score ?? 0) >= 0.5;
  const pool = confident ? ranked.filter((row) => row.score >= 0.5) : ranked;
  const matches = pool.slice(0, 3).map((row) => row.item);
  const selectedId =
    top && top.score >= 0.85 && (!second || second.score <= top.score - 0.2) ? top.item.id : null;
  return { confident, matches, selectedId };
}

export function searchPreparedQuestions(query: string): WellnessQuestion[] {
  const trimmed = query.trim();
  if (!trimmed) return [...WELLNESS_QUESTIONS];
  const normalized = normalizeQuestionText(trimmed);
  return WELLNESS_QUESTIONS.filter((item) => {
    if (scorePreparedQuestion(trimmed, item.question) > 0) return true;
    return normalizeQuestionText(item.answer).includes(normalized);
  });
}
