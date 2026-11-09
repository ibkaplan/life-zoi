import { describe, expect, it } from "vitest";
import { isCurrentLink, MEMBER_LINKS, PUBLIC_LINKS } from "@/lib/navigation";

describe("site navigation", () => {
  it("keeps one fixed public list with no duplicates", () => {
    const hrefs = PUBLIC_LINKS.map((link) => link.href);
    expect(hrefs[0]).toBe("/");
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("gives signed-in people the requested pages once each", () => {
    expect(MEMBER_LINKS.map((link) => link.label)).toEqual([
      "My Day",
      "My Plan",
      "Progress",
      "Food & Wellness",
      "Health Library",
      "Nature",
      "Habit Transformation",
    ]);
    const all = [...PUBLIC_LINKS, ...MEMBER_LINKS].map((link) => link.href);
    expect(new Set(all).size).toBe(all.length);
  });

  it("marks the current page, including pages inside a section", () => {
    expect(isCurrentLink("/", "/")).toBe(true);
    expect(isCurrentLink("/outlook", "/")).toBe(false);
    expect(isCurrentLink("/academy/move/resources", "/academy/move")).toBe(true);
    expect(isCurrentLink("/academy/meals", "/academy/move")).toBe(false);
    expect(isCurrentLink("/what-if/abc", "/what-if")).toBe(true);
  });
});
