import { describe, expect, it } from "vitest";
import { en } from "@/lib/i18n/messages/en";
import { currentPageIn, FOOTER_LINKS, isCurrentLink, NAV_SECTIONS, PHONE_QUICK_SECTIONS, sectionFor } from "@/lib/navigation";

describe("site navigation", () => {
  it("shows the nine requested sections in the requested order", () => {
    expect(NAV_SECTIONS.map((section) => section.label)).toEqual([
      "Home",
      "Dashboard",
      "My Health",
      "Food & Wellness",
      "Movement",
      "Wellness Library",
      "Brain & Mind",
      "Progress",
      "My Profile",
    ]);
    for (const section of NAV_SECTIONS) expect(en.sections[section.key]).toBe(section.label);
  });

  it("keeps Home, Dashboard, and Movement on screen on phones", () => {
    expect(PHONE_QUICK_SECTIONS).toEqual(["home", "dashboard", "movement"]);
  });

  it("files each page in exactly one section and keeps every former menu page reachable", () => {
    const pages = NAV_SECTIONS.flatMap((section) => section.pages.map((page) => page.href));
    expect(new Set(pages).size).toBe(pages.length);
    const formerMenu = [
      "/", "/outlook", "/what-if", "/academy/meals", "/academy/move",
      "/my-day", "/plan", "/progress", "/food-plan", "/library", "/nature", "/habit-transformation",
    ];
    const reachable = new Set([...NAV_SECTIONS.map((section) => section.href), ...pages]);
    for (const href of formerMenu) expect(reachable.has(href), href).toBe(true);
    const footer = new Set(FOOTER_LINKS.map((link) => link.href));
    for (const href of pages) expect(footer.has(href), href).toBe(true);
  });

  it("finds the section of a page, preferring the longest match", () => {
    expect(sectionFor("/")?.key).toBe("home");
    expect(sectionFor("/dashboard")?.key).toBe("dashboard");
    expect(sectionFor("/academy/move/library")?.key).toBe("library");
    expect(sectionFor("/academy/move/studio/chair-yoga")?.key).toBe("movement");
    expect(sectionFor("/academy/move/resources/videos")?.key).toBe("movement");
    expect(sectionFor("/academy/meals/some-recipe")?.key).toBe("food");
    expect(sectionFor("/library/music")?.key).toBe("library");
    expect(sectionFor("/brain-quiz/games")?.key).toBe("brain");
    expect(sectionFor("/progress/weekly")?.key).toBe("progress");
    expect(sectionFor("/what-if/abc")?.key).toBe("myHealth");
    expect(sectionFor("/settings")?.key).toBe("profile");
  });

  it("marks one page in the section row", () => {
    const brain = NAV_SECTIONS.find((section) => section.key === "brain")!;
    expect(currentPageIn(brain, "/brain-quiz/games")).toBe("/brain-quiz/games");
    expect(currentPageIn(brain, "/brain-quiz/memory")).toBe("/brain-quiz");
  });

  it("marks the current page, including pages inside a section", () => {
    expect(isCurrentLink("/", "/")).toBe(true);
    expect(isCurrentLink("/outlook", "/")).toBe(false);
    expect(isCurrentLink("/academy/move/resources", "/academy/move")).toBe(true);
    expect(isCurrentLink("/academy/meals", "/academy/move")).toBe(false);
    expect(isCurrentLink("/what-if/abc", "/what-if")).toBe(true);
  });
});
