import { describe, expect, it } from "vitest";
import { decideAccess } from "@/lib/access";
import { createSampleSession } from "@/lib/sample";
import { completeDraft, sanitizeSession } from "@/lib/session";
import { emptySession } from "@/lib/types";
import { getAppStatus } from "@/lib/status";
import { GET as statusGet } from "@/app/api/status/route";
import { POST as recommendationPost } from "@/app/api/recommendations/route";
import { POST as whatIfPost } from "@/app/api/what-if/route";
import { validAnswers } from "@/lib/validation.test";

describe("data access rules", () => {
  it("allows a record only for the signed-in owner", () => {
    expect(decideAccess(null, "user-1")).toEqual({ allowed: false, reason: "unauthenticated" });
    expect(decideAccess("  ", "user-1")).toEqual({ allowed: false, reason: "unauthenticated" });
    expect(decideAccess("user-2", "user-1")).toEqual({ allowed: false, reason: "not-owner" });
    expect(decideAccess("user-1", "user-1")).toEqual({ allowed: true });
  });

  it("reports that authentication is not configured", async () => {
    expect(getAppStatus({}).authentication).toBe("not-configured");
    expect(getAppStatus({}).supabaseVariablesPresent).toBe(false);
    expect(
      getAppStatus({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-key",
      }).detail,
    ).toContain("does not connect");
    const response = await statusGet();
    const body = (await response.json()) as { persistence: string; authentication: string };
    expect(body.persistence).toBe("development");
    expect(body.authentication).toBe("not-configured");
  });

  it("rejects recommendation and scenario requests that are not a valid assessment", async () => {
    const recommendations = await recommendationPost(
      new Request("http://localhost/api/recommendations", {
        method: "POST",
        body: JSON.stringify({ assessment: { sleepHours: "nope" } }),
      }),
    );
    expect(recommendations.status).toBe(400);

    const scenario = await whatIfPost(
      new Request("http://localhost/api/what-if", {
        method: "POST",
        body: JSON.stringify({ habitId: "walk", assessment: null }),
      }),
    );
    expect(scenario.status).toBe(200);
    const illustration = (await scenario.json()) as { sources: { url: string }[]; withheld: boolean };
    expect(illustration.withheld).toBe(false);
    expect(illustration.sources[0]?.url).toContain("who.int");
  });
});

describe("session records", () => {
  it("drops corrupt history and labels sample data separately from an empty session", () => {
    const cleaned = sanitizeSession({
      draft: { displayName: "Ada" },
      history: [{ id: "bad", completedAt: "yesterday", answers: { sleepHours: "no" } }],
      scenarios: [{ id: "not-a-real-id", habitId: "walk", note: "", savedAt: "nope" }],
    });
    expect(cleaned.history).toEqual([]);
    expect(cleaned.scenarios).toEqual([]);
    expect(cleaned.draft.displayName).toBe("Ada");

    const empty = emptySession();
    expect(empty.history).toEqual([]);
    const sample = createSampleSession("2026-10-29");
    expect(sample.draft.displayName).toBe("Sample visitor");
    expect(sample.checkIns.length).toBeGreaterThanOrEqual(2);
    expect(sample.checkIns.every((item) => item.note.toLowerCase().includes("sample"))).toBe(true);
  });

  it("refuses to complete an unfinished draft", () => {
    const result = completeDraft(emptySession(), "11111111-1111-4111-8111-111111111111", "2026-10-29T00:00:00.000Z");
    expect(result.ok).toBe(false);
    const completed = completeDraft(
      { ...emptySession(), draft: validAnswers() },
      "11111111-1111-4111-8111-111111111111",
      "2026-10-29T00:00:00.000Z",
    );
    expect(completed.ok).toBe(true);
  });
});
