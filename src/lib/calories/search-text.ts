/** Lower case, no accents, no punctuation, with ё folded into е, for matching food names. */
export function fold(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function words(text: string): string[] {
  return fold(text).split(" ").filter((word) => word.length > 1);
}

/**
 * How well a query matches a name: each query word that starts a word in the name counts,
 * and so does a plural such as "eggs" for "egg".
 * 0 means at least one query word is missing.
 */
export function matchScore(query: string, ...names: string[]): number {
  const wanted = words(query);
  if (wanted.length === 0) return 0;
  const have = names.flatMap(words);
  let score = 0;
  for (const word of wanted) {
    const exact = have.includes(word);
    const prefix =
      exact || have.some((item) => item.startsWith(word) || (item.length >= 3 && word.startsWith(item) && word.length - item.length <= 2));
    if (!prefix) return 0;
    score += exact ? 2 : 1;
  }
  return score;
}
