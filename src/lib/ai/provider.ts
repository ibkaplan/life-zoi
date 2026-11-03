import { estimateCostCents, estimateTokens, type AiPrices } from "@/lib/ai/pricing";

export type AiMessage = { role: "user" | "assistant"; content: string };

export type AiCompletionRequest = {
  model: string;
  messages: AiMessage[];
  maxOutputTokens: number;
  prices: AiPrices;
};

export type AiUsage = {
  promptTokens: number;
  completionTokens: number;
  estimatedCostCents: number;
};

export type AiCompletionResult = {
  text: string;
  providerId: "mock";
  model: string;
  usage: AiUsage;
};

export interface AiProvider {
  id: "mock";
  complete(request: AiCompletionRequest): Promise<AiCompletionResult>;
}

const MOCK_NOTE =
  "Development mock reply. No external AI provider was contacted. This is general information, not a personal medical assessment.";

function limitText(text: string, maxOutputTokens: number): string {
  const maxChars = Math.max(80, maxOutputTokens * 4);
  if (text.length <= maxChars) return text;
  const sliced = text.slice(0, maxChars - 1).trimEnd();
  return `${sliced}…`;
}

function mockText(question: string): string {
  const lower = question.toLowerCase();
  if (/\b(sleep|insomnia|tired at night)\b/.test(lower)) {
    return `A regular sleep window, a dimmer hour before bed, and keeping caffeine earlier in the day are common educational starting points. Adults vary, and ongoing sleep trouble is a reason to talk with a qualified clinician. ${MOCK_NOTE}`;
  }
  if (/\b(sugar|cravings?|vegetables?|eating|nutrition|food|hydration)\b/.test(lower)) {
    return `Building meals around vegetables, water, and regular eating times is general nutrition education. Cravings can have many causes. This is not a diet prescription. A clinician or registered dietitian can help with personal food decisions. ${MOCK_NOTE}`;
  }
  if (/\b(balance|exercise|fitness|walk|movement|mobility)\b/.test(lower)) {
    return `Gentle walking, sit-to-stand practice, and simple balance exercises near a sturdy support are general activity ideas. Stop if you feel pain, dizziness, or unsteadiness, and ask a qualified clinician which movements are suitable for you. ${MOCK_NOTE}`;
  }
  if (/\b(aging|older|longevity)\b/.test(lower)) {
    return `Healthy aging discussions often include sleep, movement, food, connection, and not smoking. lifeZoi does not promise that a habit will prevent disease. Everyday habits are a place to reflect, not a forecast. ${MOCK_NOTE}`;
  }
  if (/\b(grandchildren|grandchild)\b/.test(lower) && /\b(travel|energy|trip|visit)\b/.test(lower)) {
    return `That's a wonderful goal. We can explore small steps that may support your energy and mobility. Let's look at your sleep, daily movement, nutrition and current routine. Health can create more room for time with people you care about. It does not promise a longer life, prevent disease, or replace a clinician, and people living with illness or limits can still live meaningful lives. ${MOCK_NOTE}`;
  }
  if (/\b(energy|week|habit|small change)\b/.test(lower)) {
    return `One small change this week, such as a consistent bedtime or a short walk, is easier to notice than many changes at once. Energy has many causes. This is general habit education, not a personalized medical assessment. ${MOCK_NOTE}`;
  }
  return `lifeZoi can discuss general wellness education, including sleep, food, movement, and everyday habits. It does not diagnose, change medication, or predict how long someone will live. A qualified clinician is the right person for personal medical decisions. ${MOCK_NOTE}`;
}

export function createMockProvider(): AiProvider {
  return {
    id: "mock",
    async complete(request) {
      const latest = [...request.messages].reverse().find((message) => message.role === "user");
      const text = limitText(mockText(latest?.content ?? ""), request.maxOutputTokens);
      const promptTokens = estimateTokens(request.messages.map((message) => message.content).join("\n"));
      const completionTokens = Math.min(request.maxOutputTokens, estimateTokens(text));
      return {
        text,
        providerId: "mock",
        model: request.model,
        usage: {
          promptTokens,
          completionTokens,
          estimatedCostCents: estimateCostCents(promptTokens, completionTokens, request.prices),
        },
      };
    },
  };
}

export function readModelName(env: Record<string, string | undefined>): string {
  const requested = env.AI_MODEL?.trim() ?? "";
  if (/^[a-zA-Z0-9._-]{1,64}$/.test(requested)) return requested;
  return "gpt-4o-mini";
}

export function resolveAiProvider(env: Record<string, string | undefined>):
  | { ok: true; provider: AiProvider; model: string }
  | { ok: false; error: string } {
  const requested = (env.AI_PROVIDER ?? "mock").trim().toLowerCase() || "mock";
  if (requested !== "mock") {
    return {
      ok: false,
      error:
        "External AI providers are turned off during initial development. No request was sent. Use AI_PROVIDER=mock for local development replies.",
    };
  }
  return { ok: true, provider: createMockProvider(), model: readModelName(env) };
}
