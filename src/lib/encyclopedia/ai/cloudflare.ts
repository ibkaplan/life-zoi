import { bestSections, libraryAnswer, searchTextFor, type Answer, type AnswerBlock } from "@/lib/encyclopedia/ai/answer";
import type { AnswerProvider, AnswerRequest } from "@/lib/encyclopedia/ai/provider";
import { EVIDENCE_INFO } from "@/lib/encyclopedia/categories";
import type { Article } from "@/lib/encyclopedia/types";

/**
 * LifeZoi AI with Cloudflare Workers AI (owner decision, 2026-11-22).
 *
 * The answer is still built from encyclopedia articles: the server picks the
 * matching articles first, sends the model only the question and the text of
 * those articles, and asks it to explain them in plain words. Cards, evidence
 * labels, and safety notes come from the articles, not from the model.
 *
 * Free only: Cloudflare's free allocation is 10,000 Neurons a day, and on the
 * Workers Free plan further calls fail with an error instead of being charged.
 * LifeZoi also stops itself well below that (MODEL_LIMITS). Whenever the model
 * is not set up, over the limit, slow, or fails, the library answer is returned.
 */

export const CLOUDFLARE_MODEL = "@cf/google/gemma-4-26b-a4b-it";

export const MODEL_LIMITS = {
  /** Per server instance per UTC day. About 25 Neurons per answer, so this stays well below 10,000. */
  callsPerDay: 250,
  timeoutMs: 12_000,
  maxTokens: { short: 300, detailed: 600 },
  /** Article text sent with the question. */
  contextChars: 6_000,
} as const;

export type ModelLanguage = "en" | "uk" | "ru" | "el";
const LANGUAGE_NAME: Record<ModelLanguage, string> = { en: "English", uk: "Ukrainian", ru: "Russian", el: "Greek" };

export function isModelLanguage(value: unknown): value is ModelLanguage {
  return value === "en" || value === "uk" || value === "ru" || value === "el";
}

let usage = { day: "", calls: 0 };
export function resetModelUsageForTests() {
  usage = { day: "", calls: 0 };
}
function takeModelCall(now: Date): boolean {
  const day = now.toISOString().slice(0, 10);
  if (usage.day !== day) usage = { day, calls: 0 };
  if (usage.calls >= MODEL_LIMITS.callsPerDay) return false;
  usage.calls += 1;
  return true;
}

export function systemPrompt(language: ModelLanguage, length: "short" | "detailed"): string {
  return [
    "You are LifeZoi AI, a health education assistant inside the LifeZoi Health Encyclopedia.",
    "Answer the member's latest question using ONLY the encyclopedia text provided. If the text does not answer the question, say that the encyclopedia does not cover it yet.",
    `Write in plain, warm ${LANGUAGE_NAME[language]}, even if the articles are in English.`,
    length === "short" ? "Write 2 or 3 short paragraphs, under 120 words in total." : "Write 3 to 5 short paragraphs, under 250 words in total.",
    "Plain text only: no headings, no bold, no tables, no links.",
    "Do not diagnose. Do not say whether the member has a condition.",
    "Never suggest starting, stopping, skipping, or changing a medicine or a dose. Do not name doses.",
    "Do not add numbers, percentages, risk figures, study names, or sources that are not in the provided text.",
    "Do not promise that anything prevents, cures, or reverses a disease.",
    "Where the text says evidence is limited or still being studied, say so.",
    "End by suggesting the member talks with a doctor, nurse, or pharmacist about their own situation.",
  ].join(" ");
}

/** The article text the model may use: summary, the most relevant sections, takeaways, and labelled claims. */
export function articleContext(articles: readonly Article[], question: string): string {
  const parts: string[] = [];
  for (const article of articles.slice(0, 2)) {
    const sections = bestSections(article, question, 2)
      .map((section) => `${section.heading}\n${[...section.standard, ...(section.points ?? [])].join("\n")}`)
      .join("\n\n");
    const claims = article.evidence.map((claim) => `- ${claim.claim} (${EVIDENCE_INFO[claim.level].label})`).join("\n");
    parts.push(`ARTICLE: ${article.title}\nSUMMARY: ${article.summary}\n\n${sections}\n\nKEY TAKEAWAYS:\n${article.takeaways.map((item) => `- ${item}`).join("\n")}\n\nEVIDENCE:\n${claims}`);
  }
  return parts.join("\n\n---\n\n").slice(0, MODEL_LIMITS.contextChars);
}

type CloudflarePayload = {
  success?: boolean;
  result?: { response?: unknown; choices?: { message?: { content?: unknown } }[] };
};

function readText(payload: CloudflarePayload): string {
  const result = payload.result;
  if (!result) return "";
  if (typeof result.response === "string") return result.response;
  const content = result.choices?.[0]?.message?.content;
  return typeof content === "string" ? content : "";
}

const DOSE_OR_FIGURE = /\d+(?:[.,]\d+)?\s?(%|percent|процент|відсот|τοις εκατό|mg|mcg|µg|μg|iu|мг|мкг)/giu;

/**
 * Cleans the model's words. Returns "" when the reply cannot be shown, for example
 * when it names a dose or a figure that the articles do not contain.
 */
export function cleanModelText(raw: string, context: string, secrets: readonly string[]): string {
  let text = raw;
  for (const secret of secrets) if (secret) text = text.split(secret).join("");
  text = text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/\*\*|__|`/g, "")
    .replace(/^\s*[-*•]\s+/gm, "")
    .trim()
    .slice(0, 2_400);
  const contextLower = context.toLowerCase();
  for (const match of text.matchAll(DOSE_OR_FIGURE)) {
    if (!contextLower.includes(match[0].toLowerCase())) return "";
  }
  return text;
}

export function createCloudflareProvider(options: {
  accountId: string;
  apiToken: string;
  fetchImpl?: typeof fetch;
  now?: () => Date;
}): AnswerProvider {
  const fetchImpl = options.fetchImpl ?? fetch;
  const accountId = options.accountId.trim();
  const apiToken = options.apiToken.trim();
  const now = options.now ?? (() => new Date());
  const url = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/ai/run/${CLOUDFLARE_MODEL}`;

  /** English search words for a question in another language, or "" when that fails. */
  async function searchWords(question: string): Promise<string> {
    try {
      const response = await fetchImpl(url, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${apiToken}` },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "Translate the health question into 3 to 8 plain English search words. Reply with the words only, separated by spaces." },
            { role: "user", content: question.slice(0, 600) },
          ],
          max_tokens: 40,
          temperature: 0,
        }),
        signal: AbortSignal.timeout(MODEL_LIMITS.timeoutMs),
      });
      if (!response.ok) return "";
      const payload = (await response.json()) as CloudflarePayload;
      if (payload.success === false) return "";
      return readText(payload)
        .toLowerCase()
        .replace(/[^a-z\s-]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 120);
    } catch {
      return "";
    }
  }

  return {
    id: "cloudflare",
    label: "Cloudflare Workers AI, grounded in LifeZoi Health Encyclopedia articles",
    async answer(request: AnswerRequest): Promise<Answer> {
      let library = libraryAnswer(request);
      const latest = [...request.turns].reverse().find((turn) => turn.role === "user")?.text ?? "";
      // The articles are in English. A question in another language is first turned into
      // English search words, so it can find its article.
      if (library.noArticle && /[^\u0000-\u007F]/.test(latest) && takeModelCall(now())) {
        const words = await searchWords(latest);
        if (words) {
          const last = request.turns.length - 1;
          const turns = request.turns.map((turn, index) => (index === last ? { ...turn, text: `${turn.text} ${words}` } : turn));
          library = { ...libraryAnswer({ ...request, turns }), topic: library.topic };
        }
      }
      // No matching article: say so honestly rather than let a model answer from nothing.
      if (library.noArticle) return library;
      const matched = library.articles
        .map((card) => request.articles.find((article) => article.slug === card.slug))
        .filter((article): article is Article => Boolean(article));
      const question = [...request.turns].reverse().find((turn) => turn.role === "user")?.text ?? "";
      const context = articleContext(matched, `${question} ${searchTextFor(request.turns).text}`);
      if (!context || !takeModelCall(now())) return library;

      const language = request.language ?? "en";
      const earlier = request.turns
        .slice(0, -1)
        .slice(-6)
        .map((turn) => ({ role: turn.role, content: turn.text }));
      try {
        const response = await fetchImpl(url, {
          method: "POST",
          headers: { "content-type": "application/json", authorization: `Bearer ${apiToken}` },
          body: JSON.stringify({
            messages: [
              { role: "system", content: systemPrompt(language, request.length) },
              ...earlier,
              { role: "user", content: `ENCYCLOPEDIA TEXT:\n${context}\n\nQUESTION: ${question}` },
            ],
            max_tokens: MODEL_LIMITS.maxTokens[request.length],
            temperature: 0.3,
          }),
          signal: AbortSignal.timeout(MODEL_LIMITS.timeoutMs),
        });
        if (!response.ok) return library;
        const payload = (await response.json()) as CloudflarePayload;
        if (payload.success === false) return library;
        const text = cleanModelText(readText(payload), context, [apiToken, accountId]);
        if (!text) return library;
        const paragraphs: AnswerBlock[] = text
          .split(/\n\s*\n|\n/)
          .map((part) => part.trim())
          .filter(Boolean)
          .slice(0, 6)
          .map((part) => ({ kind: "paragraph", text: part, lang: language }));
        const evidence = library.blocks.filter((block) => block.kind === "evidence");
        return { ...library, source: "model", blocks: [...paragraphs, ...evidence] };
      } catch {
        return library;
      }
    },
  };
}
