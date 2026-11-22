import { libraryAnswer, type Answer, type AnswerLength, type ChatTurn } from "@/lib/encyclopedia/ai/answer";
import type { Article } from "@/lib/encyclopedia/types";

/**
 * The one place LifeZoi AI chooses who writes its answers.
 *
 * Today only "library" exists: answers are assembled on the LifeZoi server from
 * the encyclopedia's own articles. It is free, it sends nothing to an outside
 * service, and it cannot invent studies or numbers.
 *
 * A model provider (for example a free tier, or a self-hosted open model) can be
 * added here later as another `AnswerProvider`. It must stay on the server, keep
 * its key out of the browser, ground its answer in the articles passed to it,
 * and be turned on only after the owner approves the provider, its terms, and an
 * update to the project rules. `ENCYCLOPEDIA_AI_PROVIDER` set to anything else is
 * refused, and no network call is made.
 */
export type AnswerRequest = {
  turns: readonly ChatTurn[];
  length: AnswerLength;
  articles: readonly Article[];
  focusSlug?: string;
};

export type AnswerProvider = {
  id: string;
  /** Shown in the page footer: what produced the answer. */
  label: string;
  answer: (request: AnswerRequest) => Promise<Answer>;
};

export const libraryProvider: AnswerProvider = {
  id: "library",
  label: "LifeZoi Health Encyclopedia library (no outside AI service)",
  answer: async (request) => libraryAnswer(request),
};

export type ProviderChoice = { ok: true; provider: AnswerProvider } | { ok: false; reason: string };

export function chooseProvider(env: Record<string, string | undefined> = process.env): ProviderChoice {
  const wanted = (env.ENCYCLOPEDIA_AI_PROVIDER ?? "library").trim() || "library";
  if (wanted === "library") return { ok: true, provider: libraryProvider };
  return { ok: false, reason: `ENCYCLOPEDIA_AI_PROVIDER "${wanted}" is not approved for LifeZoi AI. Only "library" is available.` };
}
