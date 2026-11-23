import { beforeEach, describe, expect, it } from "vitest";
import { BUILT_IN_ARTICLES } from "@/lib/encyclopedia/articles";
import {
  cleanModelText,
  CLOUDFLARE_MODEL,
  createCloudflareProvider,
  MODEL_LIMITS,
  resetModelUsageForTests,
} from "@/lib/encyclopedia/ai/cloudflare";
import { chooseProvider, cloudflareConfigured } from "@/lib/encyclopedia/ai/provider";
import { handleQuestion, MEDICATION_TEXT, resetAiUsageForTests } from "@/lib/encyclopedia/ai/handle";
import { SAFETY_NOTICE } from "@/lib/assistant";

const ACCOUNT = "0123456789abcdef0123456789abcdef";
const TOKEN = "test-token-abcdefghijklmnopqrstuvwxyz";
const ENV = { CLOUDFLARE_ACCOUNT_ID: ACCOUNT, CLOUDFLARE_WORKERS_AI_TOKEN: TOKEN };
const heart = [{ role: "user" as const, text: "How can I protect my heart?" }];

type Call = { url: string; init: RequestInit };
function fakeFetch(reply: unknown, status = 200) {
  const calls: Call[] = [];
  const impl = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return new Response(JSON.stringify(reply), { status, headers: { "content-type": "application/json" } });
  }) as typeof fetch;
  return { impl, calls };
}

beforeEach(() => {
  resetModelUsageForTests();
  resetAiUsageForTests();
});

describe("choosing the Cloudflare provider", () => {
  it("stays in library mode without both settings, so nothing is sent anywhere", () => {
    expect(cloudflareConfigured({})).toBe(false);
    expect(cloudflareConfigured({ CLOUDFLARE_ACCOUNT_ID: ACCOUNT })).toBe(false);
    expect(cloudflareConfigured({ CLOUDFLARE_WORKERS_AI_TOKEN: TOKEN })).toBe(false);
    expect(cloudflareConfigured({ CLOUDFLARE_ACCOUNT_ID: "not-an-id", CLOUDFLARE_WORKERS_AI_TOKEN: TOKEN })).toBe(false);
    const choice = chooseProvider({ ENCYCLOPEDIA_AI_PROVIDER: "cloudflare" });
    expect(choice.ok && choice.provider.id).toBe("library");
  });

  it("uses Cloudflare when both settings exist, and library when told to", () => {
    const on = chooseProvider(ENV);
    expect(on.ok && on.provider.id).toBe("cloudflare");
    const off = chooseProvider({ ...ENV, ENCYCLOPEDIA_AI_PROVIDER: "library" });
    expect(off.ok && off.provider.id).toBe("library");
    expect(chooseProvider({ ...ENV, ENCYCLOPEDIA_AI_PROVIDER: "openai" }).ok).toBe(false);
  });
});

describe("Cloudflare answers", () => {
  it("sends only the question and article text to the free model, and keeps the article cards", async () => {
    const { impl, calls } = fakeFetch({ success: true, result: { response: "Ваше серце любить рух.\n\nПоговоріть із лікарем." } });
    const provider = createCloudflareProvider({ accountId: ACCOUNT, apiToken: TOKEN, fetchImpl: impl });
    const answer = await provider.answer({ turns: heart, length: "short", articles: BUILT_IN_ARTICLES, language: "uk" });
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/ai/run/${CLOUDFLARE_MODEL}`);
    expect((calls[0].init.headers as Record<string, string>).authorization).toBe(`Bearer ${TOKEN}`);
    const body = JSON.parse(String(calls[0].init.body)) as { messages: { role: string; content: string }[]; max_tokens: number };
    expect(body.max_tokens).toBe(MODEL_LIMITS.maxTokens.short);
    expect(body.messages[0].content).toMatch(/Ukrainian/);
    expect(body.messages.at(-1)?.content).toMatch(/ENCYCLOPEDIA TEXT/);
    expect(answer.source).toBe("model");
    expect(answer.articles[0]?.slug).toBe("heart-health-blood-pressure-cholesterol");
    expect(answer.blocks[0]).toEqual({ kind: "paragraph", text: "Ваше серце любить рух.", lang: "uk" });
    expect(answer.blocks.some((block) => block.kind === "evidence")).toBe(true);
  });

  it("reads the newer chat response shape too", async () => {
    const { impl } = fakeFetch({ success: true, result: { choices: [{ message: { content: "Move every day." } }] } });
    const answer = await createCloudflareProvider({ accountId: ACCOUNT, apiToken: TOKEN, fetchImpl: impl }).answer({ turns: heart, length: "detailed", articles: BUILT_IN_ARTICLES });
    expect(answer.source).toBe("model");
  });

  it("falls back to the library answer on an error, a limit, or an empty reply", async () => {
    for (const [reply, status] of [[{ success: false }, 200], [{ errors: [] }, 429], [{ success: true, result: { response: "" } }, 200]] as const) {
      const { impl } = fakeFetch(reply, status);
      const answer = await createCloudflareProvider({ accountId: ACCOUNT, apiToken: TOKEN, fetchImpl: impl }).answer({ turns: heart, length: "short", articles: BUILT_IN_ARTICLES });
      expect(answer.source).toBe("library");
      expect(answer.noArticle).toBe(false);
    }
    const broken = (async () => Promise.reject(new Error("network"))) as typeof fetch;
    expect((await createCloudflareProvider({ accountId: ACCOUNT, apiToken: TOKEN, fetchImpl: broken }).answer({ turns: heart, length: "short", articles: BUILT_IN_ARTICLES })).source).toBe("library");
  });

  it("does not call the model when no article matches", async () => {
    const { impl, calls } = fakeFetch({ success: true, result: { response: "Made up." } });
    const answer = await createCloudflareProvider({ accountId: ACCOUNT, apiToken: TOKEN, fetchImpl: impl }).answer({ turns: [{ role: "user", text: "zzqxw frobnication" }], length: "short", articles: BUILT_IN_ARTICLES });
    expect(calls).toHaveLength(0);
    expect(answer.noArticle).toBe(true);
  });

  it("stops calling the model at the daily cap and answers from the library", async () => {
    const { impl, calls } = fakeFetch({ success: true, result: { response: "Fine." } });
    const provider = createCloudflareProvider({ accountId: ACCOUNT, apiToken: TOKEN, fetchImpl: impl, now: () => new Date("2026-11-22T10:00:00Z") });
    for (let i = 0; i < MODEL_LIMITS.callsPerDay; i += 1) await provider.answer({ turns: heart, length: "short", articles: BUILT_IN_ARTICLES });
    const after = await provider.answer({ turns: heart, length: "short", articles: BUILT_IN_ARTICLES });
    expect(calls).toHaveLength(MODEL_LIMITS.callsPerDay);
    expect(after.source).toBe("library");
  });

  it("refuses replies with doses or figures the articles do not contain, and strips the token", () => {
    expect(cleanModelText("Take 500 mg a day.", "no numbers here", [])).toBe("");
    expect(cleanModelText("It lowers risk by 40%.", "no numbers here", [])).toBe("");
    expect(cleanModelText("**Move** more.\n# Title", "", [])).toBe("Move more.\nTitle");
    expect(cleanModelText(`Hello ${TOKEN}`, "", [TOKEN])).toBe("Hello");
  });

  it("keeps the safety rules ahead of the model", async () => {
    const { impl, calls } = fakeFetch({ success: true, result: { response: "Sure." } });
    const choice = chooseProvider(ENV, impl);
    const urgent = await handleQuestion({ memberId: "m", turns: [{ role: "user", text: "I have crushing chest pain and can't breathe" }], length: "short", focusSlug: undefined }, { choice, articles: BUILT_IN_ARTICLES });
    expect((urgent.body.answer as { blocks: { text?: string }[] }).blocks[0]?.text).toBe(SAFETY_NOTICE);
    expect(calls).toHaveLength(0);
    const medicine = await handleQuestion({ memberId: "m", turns: [{ role: "user", text: "Should I stop taking my blood pressure medication?" }], length: "short", focusSlug: undefined }, { choice, articles: BUILT_IN_ARTICLES });
    expect((medicine.body.answer as { blocks: { text?: string }[] }).blocks[0]?.text).toBe(MEDICATION_TEXT);
  });
});

describe("questions in other languages and emergencies", () => {
  it("treats common ways of saying chest pain as urgent, in every language", async () => {
    const { isUrgentMessage } = await import("@/lib/assistant");
    for (const text of ["chest pain", "I have chest pains", "pain in my chest", "tightness in my chest", "у меня болит грудь", "боль в груди", "болить у грудях", "πόνος στο στήθος", "πονάει το στήθος"]) {
      expect(isUrgentMessage(text), text).toBe(true);
    }
    expect(isUrgentMessage("How can I protect my heart?")).toBe(false);
  });

  it("finds the English article for a question in another language", async () => {
    const replies = [
      { success: true, result: { response: "heart health protect blood pressure" } },
      { success: true, result: { response: "Двигайтесь каждый день." } },
    ];
    const calls: string[] = [];
    const impl = (async (_url: string | URL | Request, init?: RequestInit) => {
      calls.push(String(init?.body));
      return new Response(JSON.stringify(replies[calls.length - 1]), { status: 200 });
    }) as typeof fetch;
    const answer = await createCloudflareProvider({ accountId: ACCOUNT, apiToken: TOKEN, fetchImpl: impl }).answer({
      turns: [{ role: "user", text: "Как защитить сердце?" }],
      length: "short",
      articles: BUILT_IN_ARTICLES,
      language: "ru",
    });
    expect(calls).toHaveLength(2);
    expect(answer.noArticle).toBe(false);
    expect(answer.articles[0]?.slug).toBe("heart-health-blood-pressure-cholesterol");
    expect(answer.source).toBe("model");
  });

  it("still says there is no article when the search words find nothing", async () => {
    const { impl, calls } = fakeFetch({ success: true, result: { response: "zzqxw" } });
    const answer = await createCloudflareProvider({ accountId: ACCOUNT, apiToken: TOKEN, fetchImpl: impl }).answer({ turns: [{ role: "user", text: "Что такое ззкв?" }], length: "short", articles: BUILT_IN_ARTICLES, language: "ru" });
    expect(calls).toHaveLength(1);
    expect(answer.noArticle).toBe(true);
  });
});
