import { readAiPlan } from "@/lib/ai/plans";
import { estimateCostCents, estimateTokens, readAiPrices } from "@/lib/ai/pricing";
import { resolveAiProvider } from "@/lib/ai/provider";
import { authorizeAiUse, recordAiUse, type UsageSnapshot } from "@/lib/ai/usage";
import {
  DEVELOPMENT_MESSAGE,
  isUrgentMessage,
  parseAssistantRequest,
  SAFETY_NOTICE,
  WITHHELD_MESSAGE,
  assistantReplyIsUnsafe,
} from "@/lib/assistant";

export type AssistantEnv = Record<string, string | undefined>;

export type AssistantResponseBody = {
  mode: "mock" | "disabled";
  model: string | null;
  plan: string;
  reply: string | null;
  source: "mock" | "withheld" | "safety" | "none";
  personalDataIgnored: boolean;
  safetyNotice: string | null;
  usage: UsageSnapshot | null;
  error: string | null;
};

const METER_KEY = /^[a-zA-Z0-9-]{16,80}$/;

function emptyUsage(planId: string): UsageSnapshot | null {
  void planId;
  return null;
}

function failure(
  status: number,
  error: string,
  plan: string,
  extra: Partial<AssistantResponseBody> = {},
): { status: number; body: AssistantResponseBody } {
  return {
    status,
    body: {
      mode: "disabled",
      model: null,
      plan,
      reply: null,
      source: "none",
      personalDataIgnored: false,
      safetyNotice: null,
      usage: emptyUsage(plan),
      error,
      ...extra,
    },
  };
}

export function describeAssistant(env: AssistantEnv = process.env) {
  const plan = readAiPlan(env);
  const resolved = resolveAiProvider(env);
  if (!resolved.ok) {
    return {
      mode: "disabled" as const,
      provider: "disabled",
      model: null,
      plan: plan.id,
      detail: resolved.error,
    };
  }
  return {
    mode: "mock" as const,
    provider: "mock" as const,
    model: resolved.model,
    plan: plan.id,
    detail: `${DEVELOPMENT_MESSAGE} The planned model label is ${resolved.model}. It is not called in this stage. The ${plan.label} plan limits are in use, and there is no payment.`,
  };
}

export async function handleAssistantRequest(
  input: unknown,
  env: AssistantEnv = process.env,
  now = new Date(),
): Promise<{ status: number; body: AssistantResponseBody }> {
  const plan = readAiPlan(env);
  const parsed = parseAssistantRequest(input);
  if (!parsed.ok) return failure(400, parsed.error, plan.id);
  if (!METER_KEY.test(parsed.meterKey)) {
    return failure(400, "The development session could not be metered. Refresh the page and try again.", plan.id, {
      personalDataIgnored: parsed.personalDataIgnored,
    });
  }

  const latest = parsed.messages[parsed.messages.length - 1]?.content ?? "";
  const safetyNotice = isUrgentMessage(latest) ? SAFETY_NOTICE : null;
  if (safetyNotice) {
    return {
      status: 200,
      body: {
        mode: "mock",
        model: null,
        plan: plan.id,
        reply: SAFETY_NOTICE,
        source: "safety",
        personalDataIgnored: parsed.personalDataIgnored,
        safetyNotice,
        usage: null,
        error: null,
      },
    };
  }

  const resolved = resolveAiProvider(env);
  if (!resolved.ok) {
    return failure(503, resolved.error, plan.id, { personalDataIgnored: parsed.personalDataIgnored });
  }

  const prices = readAiPrices(env);
  const promptTokens = estimateTokens(parsed.messages.map((message) => message.content).join("\n"));
  const projectedCents = estimateCostCents(promptTokens, plan.maxOutputTokens, prices);
  const allowed = authorizeAiUse(parsed.meterKey, plan, projectedCents, now);
  if (!allowed.ok) {
    return failure(allowed.status, allowed.error, plan.id, {
      mode: "mock",
      model: resolved.model,
      personalDataIgnored: parsed.personalDataIgnored,
    });
  }

  try {
    const result = await resolved.provider.complete({
      model: resolved.model,
      messages: parsed.messages,
      maxOutputTokens: plan.maxOutputTokens,
      prices,
    });
    if (assistantReplyIsUnsafe(result.text)) {
      const usage = recordAiUse(parsed.meterKey, plan, result.usage.estimatedCostCents, now);
      return {
        status: 200,
        body: {
          mode: "mock",
          model: resolved.model,
          plan: plan.id,
          reply: WITHHELD_MESSAGE,
          source: "withheld",
          personalDataIgnored: parsed.personalDataIgnored,
          safetyNotice: null,
          usage,
          error: null,
        },
      };
    }
    const usage = recordAiUse(parsed.meterKey, plan, result.usage.estimatedCostCents, now);
    return {
      status: 200,
      body: {
        mode: "mock",
        model: resolved.model,
        plan: plan.id,
        reply: result.text,
        source: "mock",
        personalDataIgnored: parsed.personalDataIgnored,
        safetyNotice: null,
        usage,
        error: null,
      },
    };
  } catch {
    return failure(500, "The development reply could not be prepared. Nothing was sent to an AI provider.", plan.id, {
      mode: "mock",
      model: resolved.model,
      personalDataIgnored: parsed.personalDataIgnored,
    });
  }
}
