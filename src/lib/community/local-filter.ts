import rawTerms from "./filter-terms.json";
import { MIN_QUOTATION_CONTEXT_WORDS } from "@/lib/community/policy";

export type FilterKind = "profanity" | "insult" | "threat" | "hate" | "spam";

export type FilterConfig = {
  enabled: boolean;
  englishProfanity: string[];
  russianProfanity: string[];
  insults: string[];
  threats: string[];
  hate: string[];
  hateWords: string[];
  spam: string[];
  quotationCues: string[];
};

export type LocalResult =
  | { action: "allow" }
  | { action: "quotation"; category: "profanity" | "insult" }
  | { action: "reject"; category: FilterKind };

type Hit = { kind: FilterKind; term: string };
type Mode = "latin" | "cyrillic";

export const defaultFilterConfig: FilterConfig = rawTerms;

const LEET: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "@": "a",
  $: "s",
};

const TO_LATIN: Record<string, string> = {
  а: "a",
  е: "e",
  о: "o",
  р: "p",
  с: "c",
  у: "y",
  х: "x",
  і: "i",
  ї: "i",
  ё: "e",
  к: "k",
  м: "m",
  т: "t",
  в: "b",
  н: "h",
  ѕ: "s",
  ј: "j",
};

const TO_CYRILLIC: Record<string, string> = {
  a: "а",
  e: "е",
  o: "о",
  p: "р",
  c: "с",
  y: "у",
  x: "х",
  k: "к",
  m: "м",
  t: "т",
  b: "в",
  h: "н",
  i: "і",
};

function isCyrillic(text: string): boolean {
  return /\p{Script=Cyrillic}/u.test(text);
}

function prepare(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/['’`]/g, "");
}

function mapChars(text: string, table: Record<string, string>): string {
  let next = "";
  for (const char of text) next += table[char] ?? char;
  return next;
}

function joinSingles(tokens: string[]): string[] {
  const out: string[] = [];
  let index = 0;
  while (index < tokens.length) {
    if (tokens[index]?.length === 1) {
      let end = index;
      while (end < tokens.length && tokens[end]?.length === 1) end += 1;
      if (end - index >= 3) out.push(tokens.slice(index, end).join(""));
      else out.push(...tokens.slice(index, end));
      index = end;
    } else {
      out.push(tokens[index] ?? "");
      index += 1;
    }
  }
  return out.filter(Boolean);
}

function collapse(token: string, minimumRun: number): string {
  const extra = Math.max(1, minimumRun - 1);
  return token.replace(new RegExp(`(\\p{L})\\1{${extra},}`, "gu"), "$1");
}

function foldTokens(text: string, mode: Mode): string[] {
  let value = prepare(text);
  if (mode === "latin") value = mapChars(mapChars(value, LEET), TO_LATIN);
  else value = mapChars(value, TO_CYRILLIC).replaceAll("ё", "е");
  const tokens = value.replace(/[^\p{L}\p{N}]+/gu, " ").split(" ").filter(Boolean);
  return joinSingles(tokens);
}

function variants(text: string, mode: Mode): string[] {
  const tokens = foldTokens(text, mode);
  const mild = tokens.map((token) => collapse(token, 3)).join(" ");
  const hard = tokens.map((token) => collapse(token, 2)).join(" ");
  return mild === hard ? [mild] : [mild, hard];
}

function wordsOf(text: string, mode: Mode): Set<string> {
  const words = new Set<string>();
  for (const line of variants(text, mode)) {
    for (const word of line.split(" ")) if (word) words.add(word);
  }
  return words;
}

function hasWord(text: string, term: string, mode: Mode): boolean {
  const words = wordsOf(text, mode);
  return variants(term, mode).some((line) => {
    const parts = line.split(" ").filter(Boolean);
    return parts.length === 1 && words.has(parts[0] ?? "");
  });
}

function hasPhrase(text: string, phrase: string, mode: Mode): boolean {
  const lines = variants(text, mode);
  return variants(phrase, mode).some((folded) => folded.length > 0 && lines.some((line) => ` ${line} `.includes(` ${folded} `)));
}

function urlCount(text: string): number {
  return text.match(/https?:\/\/|www\./gi)?.length ?? 0;
}

function collect(text: string, config: FilterConfig): Hit[] {
  const found: Hit[] = [];
  if (urlCount(text) >= 3) found.push({ kind: "spam", term: "links" });
  if (/(.)\1{11,}/u.test(text)) found.push({ kind: "spam", term: "repetition" });
  const latinWords = wordsOf(text, "latin");
  const cyrillicWords = wordsOf(text, "cyrillic");
  const wordHit = (term: string, kind: FilterKind) => {
    const mode: Mode = isCyrillic(term) ? "cyrillic" : "latin";
    const words = mode === "latin" ? latinWords : cyrillicWords;
    const matched = variants(term, mode).some((line) => {
      const parts = line.split(" ").filter(Boolean);
      return parts.length === 1 && words.has(parts[0] ?? "");
    });
    if (matched) found.push({ kind, term });
  };
  for (const term of config.englishProfanity) wordHit(term, "profanity");
  for (const term of config.russianProfanity) wordHit(term, "profanity");
  for (const term of config.insults) wordHit(term, "insult");
  for (const term of config.hateWords) wordHit(term, "hate");
  for (const phrase of config.threats) {
    const mode: Mode = isCyrillic(phrase) ? "cyrillic" : "latin";
    if (hasPhrase(text, phrase, mode)) found.push({ kind: "threat", term: phrase });
  }
  for (const phrase of config.hate) {
    const mode: Mode = isCyrillic(phrase) ? "cyrillic" : "latin";
    if (hasPhrase(text, phrase, mode)) found.push({ kind: "hate", term: phrase });
  }
  for (const phrase of config.spam) {
    if (hasPhrase(text, phrase, "latin")) found.push({ kind: "spam", term: phrase });
  }
  return found;
}

function contextWordCount(text: string): number {
  return text.match(/\p{L}{2,}/gu)?.length ?? 0;
}

function hasCue(text: string, config: FilterConfig): boolean {
  return config.quotationCues.some((cue) => hasWord(text, cue, isCyrillic(cue) ? "cyrillic" : "latin"));
}

function splitQuotes(text: string): { inside: string[]; outside: string } {
  const inside: string[] = [];
  const outside = text.replace(/["“«]([^"”»\n]{1,300})["”»]/g, (_match, inner: string) => {
    inside.push(inner);
    return " ";
  });
  return { inside, outside };
}

function categoryFrom(hits: Hit[]): FilterKind {
  if (hits.some((hit) => hit.kind === "threat")) return "threat";
  if (hits.some((hit) => hit.kind === "hate")) return "hate";
  if (hits.some((hit) => hit.kind === "spam")) return "spam";
  if (hits.some((hit) => hit.kind === "insult")) return "insult";
  return "profanity";
}

export function runLocalFilter(
  text: string,
  config: FilterConfig = defaultFilterConfig,
  options: { allowQuotation?: boolean } = {},
): LocalResult {
  if (!config.enabled) return { action: "allow" };
  const { inside, outside } = splitQuotes(text);
  const outsideHits = collect(outside, config);
  const insideHits = inside.flatMap((part) => collect(part, config));
  const all = [...outsideHits, ...insideHits];
  if (all.length === 0) return { action: "allow" };
  const category = categoryFrom(all);
  if (category === "threat" || category === "hate" || category === "spam") {
    return { action: "reject", category };
  }
  const distinct = new Set(all.map((hit) => hit.term));
  const quotation =
    options.allowQuotation === true &&
    outsideHits.length === 0 &&
    insideHits.length > 0 &&
    distinct.size === 1 &&
    hasCue(outside, config) &&
    contextWordCount(outside) >= MIN_QUOTATION_CONTEXT_WORDS;
  if (quotation) return { action: "quotation", category: category === "insult" ? "insult" : "profanity" };
  return { action: "reject", category };
}
