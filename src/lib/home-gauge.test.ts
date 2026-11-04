import { describe, expect, it } from "vitest";
import { containsProhibitedClaim } from "@/lib/claims";
import { HOME_OUTLOOK_LABELS, homeOutlook } from "@/lib/home-gauge";
import { STEP_IDS } from "@/lib/types";
import { validateStep } from "@/lib/validation";
import { validAnswers } from "@/lib/validation.test";

function assertSafe(text: string) {
  expect(containsProhibitedClaim(text)).toBe(false);
  expect(text).not.toMatch(/%|78|years gained/i);
}

describe("homepage life outlook", () => {
  it("stays a set of labels and does not invent a score", () => {
    const before = homeOutlook(false);
    expect(before.detail).toBe("Complete your assessment to explore your personal lifestyle profile.");
    expect(before.labels).toEqual(HOME_OUTLOOK_LABELS);
    assertSafe(before.detail);
    for (const label of before.labels) assertSafe(label);

    const after = homeOutlook(true);
    expect(after.detail).toContain("not a result");
    expect(after.labels).toEqual(HOME_OUTLOOK_LABELS);
    assertSafe(after.detail);
  });
});

describe("optional health-results step", () => {
  it("does not require a file or a typed number", () => {
    expect(STEP_IDS).toContain("results");
    expect(validateStep("results", validAnswers())).toEqual({});
  });
});
