import { describe, expect, it } from "vitest";
import { containsProhibitedClaim } from "@/lib/claims";
import { homeGauge } from "@/lib/home-gauge";
import type { NormalizedAssessment } from "@/lib/types";
import { validAnswers } from "@/lib/validation.test";
import { validateComplete } from "@/lib/validation";

function normalized(overrides: Parameters<typeof validAnswers>[0] = {}) {
  const parsed = validateComplete(validAnswers(overrides));
  if (!parsed.ok) throw new Error("fixture should be valid");
  return parsed.value;
}

function assertSafe(text: string) {
  expect(containsProhibitedClaim(text)).toBe(false);
  expect(text).not.toMatch(/%|78|years gained/i);
}

describe("homepage population gauge", () => {
  it("stays empty without a published cell", () => {
    const empty = homeGauge(null, false);
    expect(empty.shown).toBe(false);
    expect(empty.figure).toBeNull();
    assertSafe(empty.detail);

    const missing = homeGauge(normalized(), false);
    expect(missing.shown).toBe(false);
    expect(missing.detail).not.toContain("38.59");

    const gap = homeGauge(normalized({ exactAge: "41", tableSex: "male" }), false);
    expect(gap.shown).toBe(false);
    expect(gap.figure).toBeNull();
    assertSafe(gap.detail);
  });

  it("labels a copied cell as a population statistic and ignores the sample visitor", () => {
    const shown = homeGauge(normalized({ exactAge: "40", tableSex: "male" }), false);
    expect(shown.shown).toBe(true);
    expect(shown.figure).toBe(38.59);
    expect(shown.detail).toContain("Population statistic");
    expect(shown.detail).toContain("not your number");
    assertSafe(shown.detail);

    const sample = homeGauge(normalized({ exactAge: "40", tableSex: "male" }) satisfies NormalizedAssessment, true);
    expect(sample.shown).toBe(false);
    expect(sample.figure).toBeNull();
    expect(sample.detail).not.toContain("38.59");
    assertSafe(sample.detail);
  });
});
