import { describe, expect, it } from "vitest";
import { excerptFromHtml, parseConnectPayload, resetMedlinePlusForTests, lookupLabReference } from "@/lib/medlineplus";
import { LAB_CODES } from "@/lib/references/catalog";

describe("MedlinePlus Connect", () => {
  it("keeps only verified LOINC codes and a short excerpt", () => {
    expect(LAB_CODES.map((code) => code.loinc)).toEqual([
      "4548-4",
      "2345-7",
      "1558-6",
      "2093-3",
      "2089-1",
      "13457-7",
      "2085-9",
      "2571-8",
    ]);
    const excerpt = excerptFromHtml("<h2>What is it?</h2><p>A blood test. <a href=\"/x\">Link</a></p>");
    expect(excerpt).toBe("What is it? A blood test. Link");
    expect(excerpt).not.toContain("<");
  });

  it("treats an empty Connect feed as no match", () => {
    const match = parseConnectPayload({ feed: { entry: null } }, "4548-4");
    expect(match.matched).toBe(false);
    expect(match.message).toContain("did not return a page");
  });

  it("does not call MedlinePlus for an unverified code", async () => {
    resetMedlinePlusForTests();
    let called = false;
    const result = await lookupLabReference("99999-9", {
      fetch: async () => {
        called = true;
        return new Response("{}", { status: 200 });
      },
    });
    expect(called).toBe(false);
    expect(result.body.matched).toBe(false);
    expect(result.body.message).toContain("No request was sent");
  });

  it("caches a matched page and attributes MedlinePlus", async () => {
    resetMedlinePlusForTests();
    let calls = 0;
    const payload = {
      feed: {
        entry: [
          {
            title: { _value: "Hemoglobin A1C (HbA1c) Test" },
            link: [{ href: "https://medlineplus.gov/lab-tests/hemoglobin-a1c-hba1c-test" }],
            summary: { _value: "<p>A hemoglobin A1C test is a blood test.</p>" },
          },
        ],
      },
    };
    const fetchImpl: typeof fetch = async () => {
      calls += 1;
      return new Response(JSON.stringify(payload), { status: 200 });
    };
    const first = await lookupLabReference("4548-4", { fetch: fetchImpl, now: 1_000 });
    const second = await lookupLabReference("4548-4", { fetch: fetchImpl, now: 2_000 });
    expect(first.body.matched).toBe(true);
    expect(first.body.url).toContain("https://medlineplus.gov/");
    expect(first.body.attribution).toContain("MedlinePlus");
    expect(first.body.excerpt).toContain("blood test");
    expect(second.body.cached).toBe(true);
    expect(calls).toBe(1);
  });
});
