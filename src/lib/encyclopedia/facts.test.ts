import { describe, expect, it } from "vitest";
import { BUILT_IN_ARTICLES } from "@/lib/encyclopedia/articles";
import { FACT_CATEGORIES, FACT_START, FACTS, factArchive, factOfTheDay, findFact, relatedFacts, searchFacts } from "@/lib/encyclopedia/facts";

const SLUGS = new Set(BUILT_IN_ARTICLES.map((article) => article.slug));

function addDays(iso: string, days: number) {
  return new Date(Date.parse(`${iso}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
}

describe("Did You Know? facts", () => {
  it("has 15 categories with at least three facts each", () => {
    expect(FACT_CATEGORIES).toHaveLength(15);
    for (const category of FACT_CATEGORIES) {
      expect(FACTS.filter((fact) => fact.category === category.slug).length, category.slug).toBeGreaterThanOrEqual(3);
    }
  });

  it("gives every fact a unique id, an https source, and real related articles", () => {
    expect(new Set(FACTS.map((fact) => fact.id)).size).toBe(FACTS.length);
    for (const fact of FACTS) {
      expect(fact.id).toMatch(/^[a-z0-9-]{1,70}$/);
      expect(fact.sources.length, fact.id).toBeGreaterThan(0);
      for (const source of fact.sources) expect(source.url, fact.id).toMatch(/^https:\/\//);
      for (const slug of fact.articles ?? []) expect(SLUGS.has(slug), `${fact.id} → ${slug}`).toBe(true);
      expect(`${fact.headline} ${fact.fact}`, fact.id).not.toMatch(/\bcures?\b|miracle/i);
    }
  });

  it("shows every fact once before any repeats, and the same fact all day", () => {
    const seen = new Set<string>();
    for (let day = 0; day < FACTS.length; day += 1) seen.add(factOfTheDay(addDays(FACT_START, day)).id);
    expect(seen.size).toBe(FACTS.length);
    expect(factOfTheDay(addDays(FACT_START, FACTS.length)).id).toBe(factOfTheDay(FACT_START).id);
    expect(factOfTheDay("2026-12-01").id).toBe(factOfTheDay("2026-12-01").id);
    expect(factOfTheDay("2020-01-01").id).toBe(factOfTheDay(FACT_START).id);
  });

  it("keeps an archive of earlier days, never before the first day", () => {
    expect(factArchive(FACT_START)).toEqual([]);
    const archive = factArchive(addDays(FACT_START, 40), 30);
    expect(archive).toHaveLength(30);
    expect(archive[0].date).toBe(addDays(FACT_START, 39));
    expect(archive[0].fact.id).toBe(factOfTheDay(addDays(FACT_START, 39)).id);
    expect(factArchive(addDays(FACT_START, 3))).toHaveLength(3);
  });

  it("searches and filters", () => {
    expect(searchFacts("", "sleep").every((fact) => fact.category === "sleep")).toBe(true);
    expect(searchFacts("insulin", null).map((fact) => fact.id)).toContain("insulin-discovery");
    expect(searchFacts("zzqxw", null)).toEqual([]);
    const fact = findFact("insulin-discovery")!;
    expect(relatedFacts(fact).every((other) => other.category === fact.category && other.id !== fact.id)).toBe(true);
  });
});
