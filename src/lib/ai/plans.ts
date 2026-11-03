export const AI_PLAN_IDS = ["basic", "premium", "advanced"] as const;

export type AiPlanId = (typeof AI_PLAN_IDS)[number];

export type AiPlan = {
  id: AiPlanId;
  label: string;
  monthlyRequests: number;
  dailyRequests: number;
  maxOutputTokens: number;
  monthlyBudgetCents: number;
  requestsPerMinute: number;
};

export const AI_PLANS: Record<AiPlanId, AiPlan> = {
  basic: {
    id: "basic",
    label: "Basic",
    monthlyRequests: 30,
    dailyRequests: 5,
    maxOutputTokens: 350,
    monthlyBudgetCents: 50,
    requestsPerMinute: 4,
  },
  premium: {
    id: "premium",
    label: "Premium AI",
    monthlyRequests: 150,
    dailyRequests: 20,
    maxOutputTokens: 600,
    monthlyBudgetCents: 250,
    requestsPerMinute: 8,
  },
  advanced: {
    id: "advanced",
    label: "Advanced AI",
    monthlyRequests: 400,
    dailyRequests: 40,
    maxOutputTokens: 800,
    monthlyBudgetCents: 600,
    requestsPerMinute: 12,
  },
};

export function isAiPlanId(value: string): value is AiPlanId {
  return (AI_PLAN_IDS as readonly string[]).includes(value);
}

export function readAiPlan(env: Record<string, string | undefined>): AiPlan {
  const requested = env.AI_PLAN?.trim().toLowerCase() ?? "";
  if (isAiPlanId(requested)) return AI_PLANS[requested];
  return AI_PLANS.basic;
}
