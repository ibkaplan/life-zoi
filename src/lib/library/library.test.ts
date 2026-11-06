import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { containsProhibitedClaim } from "@/lib/claims";
import {
  LIBRARY_HEADLINE,
  LIBRARY_SUBTITLE,
  filterLibrary,
  healthCards,
  libraryCategories,
  libraryPlainText,
} from "@/lib/library/catalog";
import { libraryGuides } from "@/lib/library/guides";
import { dailyLessons, hardMoments, itemForDate, monthCells } from "@/lib/library/lessons";
import { MOVEMENT_GROUPS, libraryExercises, movementPrograms } from "@/lib/library/movement";
import { buildGuidePdf } from "@/lib/library/pdf";

const sweetener = /\b(sugar|honey|syrup|molasses|agave|juice)\b/i;

describe("health library", () => {
  it("keeps the public headline and does not invent a lifespan claim", () => {
    expect(LIBRARY_HEADLINE).toBe("YOUR FREE LIBRARY FOR A HEALTHIER LIFE");
    expect(LIBRARY_SUBTITLE).toBe(
      "Discover practical health guides, nutrition tips, exercise routines, recipes, and simple habits you can use every day.",
    );
    expect(containsProhibitedClaim(libraryPlainText())).toBe(false);
  });

  it("lists twelve categories and fifteen downloadable guides", () => {
    expect(libraryCategories).toHaveLength(12);
    expect(libraryGuides).toHaveLength(15);
    expect(new Set(libraryGuides.map((guide) => guide.slug)).size).toBe(15);
  });

  it("states 0 g added sugar only for bread recipes without sweeteners", () => {
    const bread = libraryGuides.find((guide) => guide.slug === "homemade-bread");
    expect(bread?.recipes).toHaveLength(3);
    for (const recipe of bread?.recipes ?? []) {
      expect(recipe.addedSugar).toBe("0 g");
      expect(recipe.ingredients.join(" ")).not.toMatch(sweetener);
    }
  });

  it("filters the library and has no hosted videos", () => {
    expect(filterLibrary("fiber", "guide").some((hit) => hit.title === "Fiber Guide")).toBe(true);
    expect(filterLibrary("", "video")).toHaveLength(0);
    expect(filterLibrary("flatbread", "recipe").length).toBeGreaterThan(0);
    expect(healthCards).toHaveLength(7);
  });

  it("gives every movement a safety note and a seated option", () => {
    expect(MOVEMENT_GROUPS).toHaveLength(13);
    for (const exercise of libraryExercises) {
      expect(exercise.instructions.length).toBeGreaterThan(0);
      expect(exercise.safety.length).toBeGreaterThan(20);
      expect(exercise.seated.length).toBeGreaterThan(5);
      expect(exercise.equipment.length).toBeGreaterThan(0);
      expect(exercise.duration.length).toBeGreaterThan(0);
    }
    expect(movementPrograms.map((item) => item.minutes)).toEqual([5, 10, 15, 20, 25, 30]);
    for (const program of movementPrograms) {
      const total = program.blocks.reduce((sum, block) => sum + block.minutes, 0);
      expect(total).toBe(program.minutes);
      expect(program.blocks.every((block) => block.seated.length > 0)).toBe(true);
    }
  });

  it("includes lessons, hard moments, and a November calendar", () => {
    expect(dailyLessons).toHaveLength(10);
    for (const lesson of dailyLessons) {
      expect(lesson.action.length).toBeGreaterThan(10);
      expect(lesson.reflection.length).toBeGreaterThan(10);
    }
    expect(hardMoments).toHaveLength(6);
    expect(itemForDate("2026-11-06", ["a", "b"])).toBe(itemForDate("2026-11-06", ["a", "b"]));
    const november = monthCells(2026, 11);
    expect(november[0]?.day).toBe(1);
  });

  it("builds a branded PDF that matches the committed file", () => {
    const guide = libraryGuides[0];
    const bytes = buildGuidePdf({
      title: guide.title,
      sections: guide.sections,
      backPath: `/library/guides/${guide.slug}`,
    });
    const text = Buffer.from(bytes).toString("latin1");
    expect(text.startsWith("%PDF-1.4")).toBe(true);
    expect(text).toContain("%%EOF");
    expect(text).toContain(guide.title);
    expect(text).toContain("LIVE BETTER. MAKE LIFE MATTER.");
    expect(text).toContain("It does not promise a longer life.");
    expect(text).toContain(`/library/guides/${guide.slug}`);
    const saved = readFileSync(join(process.cwd(), "public/library/pdfs", `${guide.slug}.pdf`));
    expect(Buffer.from(bytes).equals(saved)).toBe(true);
  });
});
