import { describe, expect, it, beforeEach } from "vitest";
import { AI_PLANS } from "@/lib/ai/plans";
import { compareEvalReports, evaluateDevelopmentMock, type ModelEvalReport } from "@/lib/ai/evaluate";
import { handleAssistantRequest } from "@/lib/ai/handle-request";
import { resolveAiProvider } from "@/lib/ai/provider";
import { resetAiUsageForTests } from "@/lib/ai/usage";
import { validAnswers } from "@/lib/validation.test";

const meterKey = "meter-key-1234567890";

function request(content: string, extra: Record<string, unknown> = {}) {
  return {
    meterKey,
    messages: [{ role: "user", content }],
    ...extra,
  };
}

describe("AI development architecture", () => {
  beforeEach(() => {
    resetAiUsageForTests();
  });

  it("keeps every plan finite and leaves payments unconfigured", () => {
    for (const plan of Object.values(AI_PLANS)) {
      expect(plan.dailyRequests).toBeGreaterThan(0);
      expect(plan.monthlyRequests).toBeGreaterThanOrEqual(plan.dailyRequests);
      expect(plan.maxOutputTokens).toBeLessThan(2000);
      expect(plan.monthlyBudgetCents).toBeGreaterThan(0);
      expect(Number.isFinite(plan.dailyRequests)).toBe(true);
    }
  });

  it("uses the local mock and refuses an external provider without calling out", async () => {
    const mock = resolveAiProvider({});
    expect(mock.ok).toBe(true);
    const blocked = resolveAiProvider({ AI_PROVIDER: "openai", OPENAI_API_KEY: "sk-test-secret" });
    expect(blocked.ok).toBe(false);
    const result = await handleAssistantRequest(request("How can I improve my sleep?"), {
      AI_PROVIDER: "openai",
      OPENAI_API_KEY: "sk-test-secret",
    });
    expect(result.status).toBe(503);
    expect(JSON.stringify(result.body)).not.toContain("sk-test-secret");
    expect(result.body.reply).toBeNull();
    expect(result.body.error).toContain("No request was sent");
  });

  it("returns a labeled mock reply and does not use assessment text", async () => {
    const secret = "private-lab-value-should-not-appear";
    const result = await handleAssistantRequest(
      request("What habits can make a regular sleep schedule easier?", {
        assessment: { ...validAnswers(), habitNote: secret },
      }),
      { AI_PROVIDER: "mock" },
    );
    expect(result.status).toBe(200);
    expect(result.body.source).toBe("mock");
    expect(result.body.personalDataIgnored).toBe(true);
    expect(result.body.reply).toContain("Development mock reply");
    expect(result.body.reply?.toLowerCase()).toContain("sleep");
    expect(result.body.reply).not.toContain(secret);
    expect(result.body.usage?.dailyUsed).toBe(1);
    expect(result.body.usage?.dailyLimit).toBe(AI_PLANS.basic.dailyRequests);
  });

  it("stops at the daily limit and at a planning budget", async () => {
    const env = { AI_PROVIDER: "mock", AI_PLAN: "basic" };
    const start = new Date("2026-11-03T12:00:00Z");
    for (let index = 0; index < AI_PLANS.basic.dailyRequests; index += 1) {
      const ok = await handleAssistantRequest(
        request("How can I improve my energy?"),
        env,
        new Date(start.getTime() + index * 61_000),
      );
      expect(ok.status).toBe(200);
    }
    const blocked = await handleAssistantRequest(
      request("How can I improve my energy?"),
      env,
      new Date(start.getTime() + AI_PLANS.basic.dailyRequests * 61_000),
    );
    expect(blocked.status).toBe(429);
    expect(blocked.body.reply).toBeNull();

    resetAiUsageForTests();
    const expensive = await handleAssistantRequest(request("What are some simple ways to eat more vegetables during the week?"), {
      AI_PROVIDER: "mock",
      AI_PLAN: "basic",
      AI_PROMPT_CENTS_PER_1K: "1000",
      AI_COMPLETION_CENTS_PER_1K: "1000",
    });
    expect(expensive.status).toBe(429);
    expect(expensive.body.error).toContain("No charge was made");
  });

  it("shows an emergency notice without a mock health plan", async () => {
    const result = await handleAssistantRequest(request("I have chest pain and cannot breathe"), {});
    expect(result.status).toBe(200);
    expect(result.body.source).toBe("safety");
    expect(result.body.reply).toContain("988");
    expect(result.body.usage).toBeNull();
  });

  it("scores the synthetic set and can compare a fixture without a second provider", async () => {
    const report = await evaluateDevelopmentMock(AI_PLANS.basic);
    expect(report.passed).toBe(true);
    expect(report.providerId).toBe("mock");
    expect(report.scores).toHaveLength(6);
    const weaker: ModelEvalReport = {
      ...report,
      model: "fixture-weaker",
      totalEstimatedCostCents: report.totalEstimatedCostCents + 1,
      scores: report.scores.map((score) => ({ ...score, safety: false, clarity: false })),
    };
    const comparison = compareEvalReports(report, weaker);
    expect(comparison.safer).toBe(report.model);
    expect(comparison.clearer).toBe(report.model);
    expect(comparison.lowerEstimatedCost).toBe(report.model);
  });
});
