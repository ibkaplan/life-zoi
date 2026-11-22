import { libraryAnswer, type Answer, type AnswerLength, type ChatTurn } from "@/lib/encyclopedia/ai/answer";
import { createCloudflareProvider } from "@/lib/encyclopedia/ai/cloudflare";
import type { Article } from "@/lib/encyclopedia/types";

/**
 * The one place LifeZoi AI chooses who writes its answers.
 *
 * "library" (the default): answers are assembled on the LifeZoi server from the
 * encyclopedia's own articles. Nothing is sent to an outside service.
 *
 * "cloudflare" (owner decision, 2026-11-22): the matching articles are explained
 * by a free Cloudflare Workers AI model (cloudflare.ts). It is used only when the
 * server has CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_WORKERS_AI_TOKEN. Without them,
 * LifeZoi AI stays in library mode. ENCYCLOPEDIA_AI_PROVIDER=library turns the
 * model off. Any other value is refused, and no network call is made.
 */
export type AnswerRequest = {
  turns: readonly ChatTurn[];
  length: AnswerLength;
  articles: readonly Article[];
  focusSlug?: string;
  /** The member's interface language, for a model reply. */
  language?: "en" | "uk" | "ru" | "el";
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

const ACCOUNT_ID = /^[a-f0-9]{32}$/i;

/** True when the server has a usable Cloudflare account ID and token. Neither value is ever sent to the browser. */
export function cloudflareConfigured(env: Record<string, string | undefined> = process.env): boolean {
  const accountId = env.CLOUDFLARE_ACCOUNT_ID?.trim() ?? "";
  const token = env.CLOUDFLARE_WORKERS_AI_TOKEN?.trim() ?? "";
  return ACCOUNT_ID.test(accountId) && token.length >= 20 && !/\s/.test(token);
}

export function chooseProvider(
  env: Record<string, string | undefined> = process.env,
  fetchImpl?: typeof fetch,
): ProviderChoice {
  const raw = env.ENCYCLOPEDIA_AI_PROVIDER?.trim() ?? "";
  if (raw === "library") return { ok: true, provider: libraryProvider };
  if (raw !== "" && raw !== "cloudflare") {
    return { ok: false, reason: `ENCYCLOPEDIA_AI_PROVIDER "${raw}" is not approved for LifeZoi AI. Use "library" or "cloudflare".` };
  }
  if (!cloudflareConfigured(env)) return { ok: true, provider: libraryProvider };
  return {
    ok: true,
    provider: createCloudflareProvider({
      accountId: env.CLOUDFLARE_ACCOUNT_ID ?? "",
      apiToken: env.CLOUDFLARE_WORKERS_AI_TOKEN ?? "",
      fetchImpl,
    }),
  };
}
