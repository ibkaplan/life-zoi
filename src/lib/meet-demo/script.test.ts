import { describe, expect, it } from "vitest";
import { LOCALES } from "@/lib/i18n/config";
import { isPublicPath } from "@/lib/auth/public-paths";
import { FREE_HUB } from "@/lib/free/hub";
import { captionMs, MEET_DEMO, MEET_DEMO_PATH, progressLabel } from "@/lib/meet-demo/script";

function keys(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) return value.flatMap((item, index) => keys(item, `${prefix}[${index}]`));
  if (value && typeof value === "object")
    return Object.entries(value).flatMap(([key, item]) => keys(item, prefix ? `${prefix}.${key}` : key));
  return [prefix];
}

describe("Meet LifeZoi demo script", () => {
  const en = MEET_DEMO.en;

  it("has the same turns, speakers, and fields in every language", () => {
    for (const locale of LOCALES) {
      const copy = MEET_DEMO[locale];
      expect(keys(copy)).toEqual(keys(en));
      expect(copy.turns.map((turn) => [turn.speaker, turn.action ?? null])).toEqual(en.turns.map((turn) => [turn.speaker, turn.action ?? null]));
      for (const turn of copy.turns) expect(turn.text.trim().length).toBeGreaterThan(3);
    }
  });

  it("is translated, not copied from English", () => {
    for (const locale of LOCALES.filter((item) => item !== "en")) {
      const copy = MEET_DEMO[locale];
      copy.turns.forEach((turn, index) => {
        if (turn.text !== "Thank you, LifeZoi.") expect(turn.text).not.toBe(en.turns[index].text);
      });
      expect(copy.title).not.toBe(en.title);
    }
  });

  it("starts and ends with LifeZoi and alternates speakers", () => {
    expect(en.turns[0].speaker).toBe("zoi");
    expect(en.turns.at(-1)?.speaker).toBe("zoi");
    en.turns.forEach((turn, index) => {
      if (index > 0) expect(turn.speaker).not.toBe(en.turns[index - 1].speaker);
    });
  });

  it("shows no figures that could read as a measurement or a score", () => {
    for (const locale of LOCALES) for (const turn of MEET_DEMO[locale].turns) expect(turn.text).not.toMatch(/\d/);
  });

  it("keeps the sample label in every language", () => {
    for (const locale of LOCALES) expect(MEET_DEMO[locale].sampleNote.length).toBeGreaterThan(20);
  });

  it("gives every line enough time to read", () => {
    expect(captionMs("Hi")).toBe(1800);
    expect(captionMs("x".repeat(100))).toBe(5500);
    expect(progressLabel(en, 2)).toBe(`Line 2 of ${en.turns.length}`);
  });

  it("is public and listed in the free hub", () => {
    expect(isPublicPath(MEET_DEMO_PATH)).toBe(true);
    expect(FREE_HUB.some((entry) => entry.href === MEET_DEMO_PATH && entry.group === "discover")).toBe(true);
  });
});
