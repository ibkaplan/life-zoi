export type AiPrices = {
  promptCentsPer1k: number;
  completionCentsPer1k: number;
};

const DEFAULT_PROMPT_CENTS_PER_1K = 0.015;
const DEFAULT_COMPLETION_CENTS_PER_1K = 0.06;

function readCents(value: string | undefined, fallback: number): number {
  if (!value?.trim()) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1000) return fallback;
  return parsed;
}

export function readAiPrices(env: Record<string, string | undefined>): AiPrices {
  return {
    promptCentsPer1k: readCents(env.AI_PROMPT_CENTS_PER_1K, DEFAULT_PROMPT_CENTS_PER_1K),
    completionCentsPer1k: readCents(env.AI_COMPLETION_CENTS_PER_1K, DEFAULT_COMPLETION_CENTS_PER_1K),
  };
}

export function estimateTokens(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return Math.max(1, Math.ceil(trimmed.length / 4));
}

export function estimateCostCents(
  promptTokens: number,
  completionTokens: number,
  prices: AiPrices,
): number {
  const cents =
    (promptTokens / 1000) * prices.promptCentsPer1k +
    (completionTokens / 1000) * prices.completionCentsPer1k;
  return Math.round(cents * 1000) / 1000;
}
